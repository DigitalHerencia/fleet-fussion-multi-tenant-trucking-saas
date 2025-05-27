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
    try {
      const existingOrgs = await client.organizations.getOrganizationList({
        query: data.orgSlug
      })
      
      organization = existingOrgs.data.find(org => 
        org.slug === data.orgSlug || org.name === data.orgName
      )
    } catch (error) {
      console.log('Organization search failed, will create new one')
    }

    // Create organization if it doesn't exist
    if (!organization) {
      organization = await client.organizations.createOrganization({
        name: data.orgName,
        slug: data.orgSlug,
      
        createdBy: data.userId
      })
      createdOrgId = organization.id
      console.log('Created new organization:', organization.id)

      // Create organization in database immediately
      await DatabaseQueries.upsertOrganization({
        clerkId: organization.id,
        name: data.orgName,
        slug: data.orgSlug
        // metadata: orgMetadata // Removed, as this property is not supported
      })
    }

    // Step 2: Calculate user permissions based on role
    const permissions = ROLE_PERMISSIONS[data.role] || []    // Step 3: Create user metadata (aligned with JWT claims)
    const userMetadata: ClerkUserMetadata = {
      organizationId: organization.id,
      role: data.role,
      permissions,
      isActive: true,
      onboardingComplete: true, // Match JWT claim name
      lastLogin: new Date().toISOString()
    }

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
    } catch (membershipError) {
      // Ignore if already a member
      if (!String(membershipError).includes('already a member')) {
        throw membershipError;
      }
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
      onboardingCompleted: true // Keep database field name consistent
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
        await client.organizations.deleteOrganization(createdOrgId)
        await DatabaseQueries.deleteOrganization(createdOrgId)
      }
      
      if (createdUser) {
        console.log('Rolling back created user:', data.userId)
        await DatabaseQueries.deleteUser(data.userId)
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
