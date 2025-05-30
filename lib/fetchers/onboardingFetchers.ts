import { db, handleDatabaseError } from '@/lib/database';
import type { OnboardingStatus } from '@/types/onboarding';

export async function getOnboardingStatus(userId: string, orgId?: string): Promise<OnboardingStatus | null> {
  try {
    const dbUser = await db.user.findUnique({
      where: { clerkId: userId },
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
    handleDatabaseError(error);
  }
}

export async function getUserOnboardingProgress(clerkId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        onboardingComplete: true,
        onboardingSteps: true,
        firstName: true,
        lastName: true,
        organization: {
          select: {
            name: true,
            dotNumber: true,
            mcNumber: true,
            settings: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    handleDatabaseError(error);
  }
}
