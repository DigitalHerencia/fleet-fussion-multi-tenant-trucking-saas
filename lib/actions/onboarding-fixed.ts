"use server"

import { clerkClient } from '@clerk/nextjs/server'
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
 * Server action to set Clerk metadata and create organization after onboarding
 * ONLY creates in Clerk - database sync handled by webhooks for proper separation of concerns
 * 
 * This fixes the architecture issue where both server actions AND webhooks were creating
 * database entries, causing duplicates and inconsistent data.
 */
export async function setClerkMetadata(data: OnboardingData): Promise<SetClerkMetadataResult> {
  const client = await clerkClient()
  let createdOrgId: string | undefined

  try {
    console.log('🚀 Starting onboarding metadata setup for user:', data.userId)
    console.log('📋 Architecture: ONLY creating in Clerk, database sync via webhooks')

    // Validate required onboarding data
    if (!data.userId) {
      throw new Error('User ID is required for onboarding')
    }
    if (!data.orgName || data.orgName.trim().length < 2) {
      throw new Error('Organization name is required and must be at least 2 characters')
    }
    if (!data.orgSlug) {
      throw new Error('Organization slug is required')
    }

    // Step 1: Create or get existing organization IN CLERK ONLY
    // Use Clerk user email for billingEmail
    let billingEmail = ''
    try {
      const clerkUser = await client.users.getUser(data.userId)
      billingEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
    } catch (e) {
      console.warn('Could not fetch Clerk user for billingEmail, leaving blank')
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

    // Create organization if it doesn't exist - ONLY IN CLERK
    if (!organization) {
      // Prepare organization metadata for Clerk according to their documentation
      const publicMetadata: Record<string, any> = {
        // Business information - public for transparency
        dotNumber: data.dotNumber,
        mcNumber: data.mcNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        // Subscription and feature metadata
        subscriptionTier: 'free',
        subscriptionStatus: 'trial',
        maxUsers: 5,
        features: ['basic_tracking', 'load_management'],
        billingEmail: billingEmail,
        createdAt: new Date().toISOString(),
        settings: {
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          distanceUnit: 'miles',
          fuelUnit: 'gallons'
        }
      }

      // Private metadata for sensitive internal data
      const privateMetadata: Record<string, any> = {
        onboardingData: {
          userId: data.userId,
          completedAt: new Date().toISOString(),
          version: '1.0'
        },
        internalSettings: {
          autoSync: true,
          webhookVersion: '2024-v1'
        }
      }

      organization = await client.organizations.createOrganization({
        name: data.orgName,
        slug: uniqueSlug,
        createdBy: data.userId,
        maxAllowedMemberships: 5, // Use proper Clerk parameter
        publicMetadata,
        privateMetadata
      })
      
      if (!organization || !organization.id) {
        throw new Error('Organization creation failed - no organization ID returned from Clerk')
      }
      
      createdOrgId = organization.id
      console.log('✅ Created new organization in Clerk ONLY (database sync via webhook):', {
        id: organization.id,
        name: data.orgName,
        slug: uniqueSlug,
        maxAllowedMemberships: 5
      })

      // DO NOT create in database here - webhooks will handle this for proper separation
      console.log('📋 Database sync will be handled by organization.created webhook')
    }

    // Step 2: Set comprehensive user metadata in Clerk ONLY
    const permissions = ROLE_PERMISSIONS[data.role] || []

    // Single comprehensive user metadata update - ONLY IN CLERK
    await client.users.updateUser(data.userId, {
      publicMetadata: {
        onboardingComplete: true,
        organizationId: organization.id,
        role: data.role,
        permissions,
        isActive: true
      },
      privateMetadata: {
        onboarding: {
          ...data,
          organizationId: organization.id,
          completedAt: new Date().toISOString()
        },
        lastLogin: new Date().toISOString()
      }
    })    
    
    console.log('✅ Updated user metadata in Clerk ONLY (database sync via webhook):', {
      userId: data.userId,
      organizationId: organization.id,
      role: data.role,
      onboardingComplete: true
    })

    // Step 3: Add user to organization with proper role - ONLY IN CLERK
    // Use retry logic to handle potential race conditions with organization availability
    const createMembershipWithRetry = async (maxRetries = 3, baseDelay = 1000): Promise<void> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const membership = await client.organizations.createOrganizationMembership({
            organizationId: organization.id,
            userId: data.userId,
            role: data.role
          });
          console.log('✅ Created organization membership in Clerk ONLY (database sync via webhook):', {
            organizationId: organization.id,
            userId: data.userId,
            role: data.role,
            membershipId: membership.id,
            attempt
          });
          return; // Success, exit retry loop
        } catch (membershipError: any) {
          const errorMessage = String(membershipError?.message || membershipError).toLowerCase();
          const errorStatus = membershipError?.status;
          
          // Handle specific error cases
          if (errorMessage.includes('already a member') || errorStatus === 422) {
            console.log('✅ User is already a member of organization, updating role if needed');
            try {
              // Get existing membership and update role if different
              const memberships = await client.organizations.getOrganizationMembershipList({
                organizationId: organization.id
              });
              const existingMembership = memberships.data.find(m => m.publicUserData?.userId === data.userId);
              if (existingMembership && existingMembership.role !== data.role) {
                await client.organizations.updateOrganizationMembership({
                  organizationId: organization.id,
                  userId: data.userId,
                  role: data.role
                });
                console.log('✅ Updated existing membership role');
              }
            } catch (updateError) {
              console.warn('Could not update existing membership role:', updateError);
            }
            return; // Consider this successful
          }
          
          // For retryable errors, wait and retry
          if (attempt < maxRetries && (
            errorMessage.includes('not found') ||
            errorMessage.includes('temporarily unavailable') ||
            errorStatus >= 500
          )) {
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.warn(`Retrying membership creation (${attempt}/${maxRetries}) after ${delay}ms:`, membershipError);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Try again
          }
          
          // Non-retryable error or max retries exceeded
          console.error('❌ Membership creation failed after retries:', {
            error: membershipError,
            attempt,
            maxRetries,
            organizationId: organization.id,
            userId: data.userId
          });
          throw membershipError;
        }
      }
    };
    
    await createMembershipWithRetry();

    // Step 4: Database sync will be handled by webhooks for proper separation
    console.log('📋 User database sync will be handled by user.updated and organizationMembership.created webhooks')

    console.log('🎉 Successfully completed onboarding setup in Clerk ONLY:', {
      userId: data.userId,
      organizationId: organization.id,
      role: data.role,
      databaseSyncMethod: 'webhooks',
      architecture: 'fixed - no duplicate creation'
    })

    return {
      success: true,
      organizationId: organization.id
    }

  } catch (error) {
    console.error('❌ Onboarding setup failed:', error)

    // Rollback logic - only for Clerk since we don't create in DB anymore
    try {
      if (createdOrgId) {
        console.log('🔄 Rolling back created organization:', createdOrgId)
        try {
          await client.organizations.deleteOrganization(createdOrgId)
          console.log('✅ Organization rollback successful')
        } catch (deleteError) {
          console.error('❌ Failed to rollback organization:', deleteError)
        }
      }
    } catch (rollbackError) {
      console.error('❌ Rollback process failed:', rollbackError)
    }

    throw error instanceof Error ? error : new Error(String(error))
  }
}
