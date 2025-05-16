import type { CustomJwtSessionClaims } from "@/types/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCompanyIdByClerkOrgId } from "@/lib/actions/company-actions";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  // Get auth and check if user is authenticated
  const { sessionClaims, userId } = await auth();

  // Check if the user has completed onboarding using Clerk publicMetadata
  const metadata = sessionClaims?.publicMetadata as CustomJwtSessionClaims['metadata'];
  const isOnboardingComplete = metadata?.onboardingComplete === true;

  // Only redirect if onboarding is already complete
  if (isOnboardingComplete) {
    if (userId) {
      const clerkOrgId = sessionClaims?.org_id; // Standard claim for active organization ID

      if (clerkOrgId) {
        const companyResult = await getCompanyIdByClerkOrgId(clerkOrgId);
        if (companyResult.success && companyResult.companyId) {
          redirect(`/${companyResult.companyId}/dashboard/${userId}`);
        } else {
          console.error(
            "OnboardingLayout: Failed to get companyId from clerkOrgId or companyId not found. Error:",
            companyResult.error,
          );
          // Fallback: If company mapping is missing, user might need to select/re-select an organization
          // or there's an issue with the data.
          redirect("/org-selection"); 
        }
      } else {
        console.error(
          "OnboardingLayout: Clerk Organization ID (org_id) not found in session claims.",
        );
        // Fallback: If no active org, user might need to select or create one.
        redirect("/org-selection"); 
      }
    } else {
      console.error(
        "OnboardingLayout: Clerk user ID (userId) not found in auth session.",
      );
      // Fallback: If user ID is missing, redirect to sign-in.
      redirect("/sign-in");
    }
  }

  return <>{children}</>;
}
