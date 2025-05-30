"use server";

import { currentUser } from '@clerk/nextjs/server';
import { db, handleDatabaseError } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { 
  OnboardingStepData, 
  CompanySetupData, 
  ProfileSetupData,
  OnboardingStatus 
} from '@/types/onboarding';

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
                ...dbUser.organization.settings as object,
                timezone: companyData.timezone,
                dateFormat: companyData.dateFormat,
                distanceUnit: companyData.distanceUnit,
                fuelUnit: companyData.fuelUnit
              }
            }
          });
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

export async function getOnboardingStatusAction(): Promise<OnboardingStatus | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true }
    });

    if (!dbUser) return null;

    const steps = dbUser.onboardingSteps as Record<string, boolean> || {};
    
    return {
      isComplete: dbUser.onboardingComplete,
      steps: {
        profile: steps.profile || false,
        company: steps.company || false,
        preferences: steps.preferences || false
      },
      currentStep: !steps.profile ? 'profile' : 
                   !steps.company ? 'company' : 
                   !steps.preferences ? 'preferences' : 'complete',
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role
      },
      organization: {
        id: dbUser.organization.id,
        name: dbUser.organization.name,
        slug: dbUser.organization.slug
      }
    };
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return null;
  }
}
