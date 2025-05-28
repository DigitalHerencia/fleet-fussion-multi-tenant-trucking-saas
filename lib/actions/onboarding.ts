"use server"

import { clerkClient } from '@clerk/nextjs/server';
import { 
  type UserRole, 
  type ClerkUserMetadata, 
  type ClerkOrganizationMetadata,
  type OnboardingData,
  type SetClerkMetadataResult,
  ROLE_PERMISSIONS 
} from '@/types/auth';

// Infer the resolved client type
type ResolvedClerkClient = Awaited<ReturnType<typeof clerkClient>>;

/**
 * Server action to set Clerk metadata and create organization after onboarding
 * ONLY creates in Clerk - database sync handled by webhooks for proper separation of concerns
 */
export async function setClerkMetadata(data: OnboardingData): Promise<SetClerkMetadataResult> {
  const actualClient: ResolvedClerkClient = await clerkClient();
  let createdOrgId: string | undefined;

  try {
    console.log('🚀 Starting onboarding metadata setup for user:', data.userId);
    console.log('📋 Architecture: ONLY creating in Clerk, database sync via webhooks');

    if (!data.userId) {
      return { success: false, error: "User ID is required." };
    }
    if (!data.orgName || data.orgName.trim().length < 2) {
      return { success: false, error: "Organization name must be at least 2 characters." };
    }
    if (!data.orgSlug) { 
      return { success: false, error: "Base organization slug is required." };
    }
    if (!data.role) {
        return { success: false, error: "User role is required for organization membership." };
    }

    let billingEmail = '';
    try {
      const user = await actualClient.users.getUser(data.userId);
      billingEmail = user.emailAddresses.find((email: { id: string; }) => email.id === user.primaryEmailAddressId)?.emailAddress || '';
    } catch (e: any) {
      console.warn('Could not retrieve user email for billing:', e.message);
    }

    let organization;
    let baseSlug = data.orgSlug;

    try {
        // Reverted to using query for initial check as well.
        const existingOrgsBySlug = await actualClient.organizations.getOrganizationList({ query: baseSlug });
        organization = existingOrgsBySlug.data.find((org: any) => org.slug === baseSlug);
    } catch (error: any) {
        console.warn(`Error fetching organization by slug '${baseSlug}' using query: ${error.message}. Will attempt to create if necessary.`);
    }

    if (!organization) {
        
        console.log(`Attempting to create organization '${data.orgName}' with slug '${baseSlug}'`);
        try {
            organization = await actualClient.organizations.createOrganization({
                name: data.orgName,
                slug: baseSlug,
                createdBy: data.userId,
                publicMetadata: { companyName: data.companyName, dotNumber: data.dotNumber, mcNumber: data.mcNumber },
                ...(billingEmail && { billingEmail }),
            });
            createdOrgId = organization.id;
            console.log('🏢 Organization created in Clerk ONLY:', { id: organization.id, name: organization.name, slug: organization.slug });
        } catch (creationError: any) {
            console.error('❌ Error creating organization:', creationError.errors || creationError.message);
            return { success: false, error: `Failed to create organization '${data.orgName}': ${creationError.message}` };
        }
    } else {
        createdOrgId = organization.id;
        console.log('🏢 Organization with preferred slug already exists in Clerk:', { id: organization.id, name: organization.name, slug: organization.slug });
    }
    
    if (!organization) {
        console.error('❌ Organization object is undefined after creation/retrieval attempt.');
        return { success: false, error: 'Failed to obtain organization details.' };
    }
    createdOrgId = organization.id;

    await actualClient.users.updateUser(data.userId, {
      publicMetadata: {
        onboardingComplete: true,
        organizationId: organization.id, 
        role: data.role, 
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
    });    
    
    console.log('✅ Updated user metadata in Clerk ONLY (database sync via webhook):', {
      userId: data.userId,
      organizationId: organization.id,
      role: data.role,
      onboardingComplete: true
    });

    const createMembershipWithRetry = async (maxRetries = 3, baseDelay = 1000): Promise<void> => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          console.log(`Attempt ${attempts + 1} to add user ${data.userId} to org ${organization!.id} with role ${data.role}`);
          await actualClient.organizations.createOrganizationMembership({
            organizationId: organization!.id,
            userId: data.userId,
            role: data.role, 
          });
          console.log(`✅ Successfully added user ${data.userId} to organization ${organization!.id} with role ${data.role}`);
          return; 
        } catch (error: any) {
          attempts++;
          const errorMessage = error.errors ? error.errors.map((e: any) => e.message).join(', ') : error.message;
          console.warn(`Failed attempt ${attempts} to add user to organization:`, errorMessage);
          if (attempts >= maxRetries) {
            console.error('❌ Max retries reached for adding user to organization. Error:', errorMessage);
            throw new Error(`Failed to add user to organization after ${maxRetries} attempts: ${errorMessage}`);
          }
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempts -1)));
        }
      }
    };
    
    await createMembershipWithRetry();

    console.log('🎉 User successfully added to organization in Clerk.');
    return { success: true, organizationId: createdOrgId };

  } catch (error: any) {
    console.error('❌ Onboarding process failed:', error.errors || error.message);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during onboarding.",
      organizationId: createdOrgId 
    };
  }
}
