import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  // Get auth and check if user is authenticated
  const { sessionClaims } = await auth();

  // Check if the user has completed onboarding using Clerk publicMetadata
  const isOnboardingComplete =
    (sessionClaims?.publicMetadata as any)?.onboardingComplete === true ||
    (sessionClaims?.metadata as any)?.onboardingComplete === true;

  // Only redirect if onboarding is already complete
  if (isOnboardingComplete) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
