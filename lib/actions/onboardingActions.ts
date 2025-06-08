"use server";

import { currentUser , clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { db, handleDatabaseError } from '@/lib/database/db';
import type { 
  OnboardingStepData, 
  CompanySetupData, 
  ProfileSetupData,
  OnboardingStatus,

} from '@/types/onboarding';
import { SystemRoles } from '@/types/abac';
import type { OnboardingData, SetClerkMetadataResult } from '@/types/auth';
import { handleError } from "@/lib/errors/handleError";

// Infer the resolved client type
type ResolvedClerkClient = Awaited<ReturnType<typeof clerkClient>>;

export async function submitOnboardingStepAction(step: string, data: OnboardingStepData) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current user from database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Update onboarding steps
    const currentSteps = dbUser.onboardingSteps as Record<string, boolean> || {};
    const updatedSteps = { ...currentSteps, [step]: true };

    // Handle specific step data
    switch (step) {
      case 'profile':
        const profileData = data as ProfileSetupData;
        await db.user.update({
          where: { id: dbUser.id },
          data: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            onboardingSteps: updatedSteps
          }
        });
        break;

      case 'company':
        const companyData = data as CompanySetupData;
        if (dbUser.role === 'admin' || dbUser.role === 'manager') {
          if (dbUser.organizationId) { // Ensure organizationId is not null
            await db.organization.update({
              where: { id: dbUser.organizationId },
              data: {
                dotNumber: companyData.dotNumber,
                mcNumber: companyData.mcNumber,
                address: companyData.address,
                city: companyData.city,
                state: companyData.state,
                zip: companyData.zip,
                phone: companyData.phone,
                settings: {
                  ...(dbUser.organization?.settings as object || {}),
                  timezone: companyData.timezone,
                  dateFormat: companyData.dateFormat,
                  distanceUnit: companyData.distanceUnit,
                  fuelUnit: companyData.fuelUnit
                }
              }
            });
          }
        }
        await db.user.update({
          where: { id: dbUser.id },
          data: { onboardingSteps: updatedSteps }
        });
        break;

      default:
        await db.user.update({
          where: { id: dbUser.id },
          data: { onboardingSteps: updatedSteps }
        });
    }

    revalidatePath('/onboarding');
    return { success: true };
  } catch (error) {
    console.error('Onboarding step submission error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function completeOnboardingAction() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    await db.user.update({
      where: { id: dbUser.id },
      data: { 
        onboardingComplete: true,
        onboardingSteps: {
          profile: true,
          company: true,
          preferences: true
        }
      }
    });

    revalidatePath('/onboarding');
    redirect(`/app/${dbUser.organizationId}/dashboard`);
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    };
  }
}



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
    const baseSlug = data.orgSlug;

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

    // No need to add user to organization: Clerk automatically adds creator as admin

    // Webhook will sync user/org to Neon DB
    // Redirect to dashboard: /app/(tenant)/[orgId]/dashboard/[userId]/page.tsx
    console.log('🎉 User successfully added to organization in Clerk. Webhook will sync to Neon DB.');
    return { success: true, organizationId: createdOrgId, userId: data.userId };

  } catch (error: any) {
    console.error('❌ Onboarding process failed:', error.errors || error.message);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during onboarding.",
      organizationId: createdOrgId 
    };
  }
}
