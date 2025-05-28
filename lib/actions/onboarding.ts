"use server"

import { clerkClient } from '@clerk/nextjs/server'
import { DatabaseQueries } from '@/lib/database'
import { 
  type UserRole, 
  type ClerkUserMetadata, 
  type ClerkOrganizationMetadata,
  type OnboardingData,
  type SetClerkMetadataResult,
  ROLE_PERMISSIONS 
} from '@/types/auth'

/**
 * Utility to generate a unique slug for organizations
 */
async function generateUniqueOrgSlug(baseSlug: string, client: any): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  const maxAttempts = 50; // Prevent excessive API calls
  
  while (suffix <= maxAttempts) {
    try {
      const existingOrgs = await client.organizations.getOrganizationList({ query: slug });
      const exists = existingOrgs.data.some((org: any) => org.slug === slug);
      if (!exists) return slug;
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    } catch (error) {
      console.warn(`Error checking slug uniqueness for '${slug}':`, error);
      // If we can't check, assume it might exist and try the next one
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }
  }
  
  // If we still can't find a unique slug, add a timestamp
  const timestamp = Date.now();
  slug = `${baseSlug}-${timestamp}`;
  return slug;
}

/**
 * Server action to immediately set Clerk metadata and create organization after onboarding
 * This provides instant UX while webhooks handle eventual consistency
 */
export async function setClerkMetadata(data: OnboardingData): Promise<SetClerkMetadataResult> {
  const client = await clerkClient()
  let createdOrgId: string | undefined
  let createdUser = false

  try {
    console.log('Starting onboarding metadata setup for user:', data.userId)

    // Step 1: Create or get existing organization
    // Use Clerk user email for billingEmail
    let billingEmail = ''
    try {
      const clerkUser = await client.users.getUser(data.userId)
      billingEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
    } catch (e) {
      console.warn('Could not fetch Clerk user for billingEmail, leaving blank')
    }
    const orgMetadata: ClerkOrganizationMetadata = {
      subscriptionTier: 'free',
      subscriptionStatus: 'trial',
      maxUsers: 5,
      features: ['basic_tracking', 'load_management'],
      billingEmail,
      createdAt: new Date().toISOString(),
      dotNumber: data.dotNumber,
      mcNumber: data.mcNumber,
      settings: {
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        distanceUnit: 'miles',
        fuelUnit: 'gallons'
      }
    }

    // Check if organization already exists
    let organization
    let uniqueSlug = data.orgSlug;
    try {
      const existingOrgs = await client.organizations.getOrganizationList({
        query: data.orgSlug
      })
      organization = existingOrgs.data.find(org => 
        org.slug === data.orgSlug || org.name === data.orgName
      )
      if (!organization) {
        // Generate a unique slug if needed
        uniqueSlug = await generateUniqueOrgSlug(data.orgSlug, client);
      }
    } catch (error) {
      console.log('Organization search failed, will create new one')
    }

    // Create organization if it doesn't exist
    if (!organization) {
      organization = await client.organizations.createOrganization({
        name: data.orgName,
        slug: uniqueSlug,
      
        createdBy: data.userId
      })
      createdOrgId = organization.id
      console.log('Created new organization:', organization.id)

      // Create organization in database immediately with retry logic
      try {
        await DatabaseQueries.upsertOrganization({
          clerkId: organization.id,
          name: data.orgName,
          slug: uniqueSlug
          // metadata: orgMetadata // Removed, as this property is not supported
        })
        console.log('✅ Organization successfully created in database')
      } catch (dbError) {
        console.error('❌ Failed to create organization in database:', dbError)
        // Don't fail the entire onboarding - the webhook will handle this eventually
        // But log the error for monitoring
        console.warn('Database sync will be handled by webhook - continuing with onboarding')
      }
    }

    // Step 2: Calculate user permissions based on role
    const permissions = ROLE_PERMISSIONS[data.role] || []
    const userMetadata: ClerkUserMetadata = {
      organizationId: organization.id,
      role: data.role,
      permissions,
      isActive: true,
      onboardingComplete: true, // Always set onboardingComplete
      lastLogin: new Date().toISOString()
    }

    // Set Clerk public metadata (must include onboardingComplete)
    await client.users.updateUserMetadata(data.userId, {
      publicMetadata: {
        ...userMetadata,
        onboardingComplete: true // Ensure this is always set
      }
    })

    // Step 4: Update user with complete metadata
    await client.users.updateUser(data.userId, {
      publicMetadata: {
        onboardingComplete: true, // Match JWT claim name
        organizationId: organization.id,
        role: data.role,
        permissions
      },
      privateMetadata: {
        onboarding: {
          ...data,
          organizationId: organization.id,
          completedAt: new Date().toISOString()
        }
      }
    })    // Step 5: Add user to organization with proper role (if not already a member)
    try {
      await client.organizations.createOrganizationMembership({
        organizationId: organization.id,
        userId: data.userId,
        role: data.role
      });
    } catch (membershipError: any) {
      // Check for various error conditions that indicate user is already a member
      const errorMessage = String(membershipError?.message || membershipError).toLowerCase();
      const isAlreadyMemberError = 
        errorMessage.includes('already a member') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('duplicate') ||
        membershipError?.status === 422 ||
        (membershipError?.errors && Array.isArray(membershipError.errors) && 
         membershipError.errors.some((e: any) => 
           String(e?.message || e).toLowerCase().includes('already') ||
           String(e?.code || e).toLowerCase().includes('member')
         ));
      
      if (!isAlreadyMemberError) {
        console.error('Membership creation failed:', membershipError);
        throw membershipError;
      }
      console.log('User is already a member of the organization, continuing...')
    }

    // Step 6: Create user in database immediately for instant access
    // Use Clerk user email for database user
    let dbUserEmail = ''
    try {
      const clerkUser = await client.users.getUser(data.userId)
      dbUserEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
    } catch (e) {
      console.warn('Could not fetch Clerk user for dbUserEmail, leaving blank')
    }
    await DatabaseQueries.upsertUser({
      clerkId: data.userId,
      organizationId: organization.id,
      email: dbUserEmail,
      firstName: undefined, // Will be updated by webhook if available
      lastName: undefined,
      profileImage: undefined,
      isActive: true,
      onboardingComplete: true // Keep database field name consistent
    });
    createdUser = true

    console.log('Successfully completed onboarding setup:', {
      userId: data.userId,
      organizationId: organization.id,
      role: data.role
    })

    return {
      success: true,
      organizationId: organization.id
    }

  } catch (error) {
    console.error('Onboarding setup failed:', error)

    // Rollback logic
    try {
      if (createdOrgId) {
        console.log('Rolling back created organization:', createdOrgId)
        try {
          await client.organizations.deleteOrganization(createdOrgId)
        } catch (clerkError) {
          console.warn('Failed to delete organization from Clerk (may not exist):', clerkError)
        }
        
        const dbDeleteResult = await DatabaseQueries.deleteOrganization(createdOrgId)
        console.log('DB delete result:', dbDeleteResult?.message)
      }
      
      if (createdUser) {
        console.log('Rolling back created user:', data.userId)
        const userDeleteResult = await DatabaseQueries.deleteUser(data.userId)
        console.log('User delete result:', userDeleteResult?.message)
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
      // Continue execution - rollback failures shouldn't block the error response
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
