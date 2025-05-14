import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get auth and check if user is authenticated
  const { sessionClaims } = await auth();
  
  // Check if the user has completed onboarding using type assertion
  const isOnboardingComplete = (sessionClaims?.metadata as any)?.onboardingComplete === true;

  // Only redirect if onboarding is already complete
  if (isOnboardingComplete) {
    console.log("Redirecting from onboarding: already completed");
    redirect("/dashboard");
  }
  
  return <>{children}</>;
}
