"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export const completeOnboarding = async (formData: FormData) => {
  const { userId } = await auth();
  if (!userId) {
    return { message: "No Logged In User" };
  }
  try {
    const client = await clerkClient();
    
    // Extract form values
    const applicationName = formData.get("applicationName")?.toString() || "";
    const applicationType = formData.get("applicationType")?.toString() || "";
    
    // Update user metadata
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName,
        applicationType,
      },
    });
    
    // Verify the update was successful
    if (res.publicMetadata && (res.publicMetadata as any).onboardingComplete === true) {
      return { message: res.publicMetadata, success: true };
    } else {
      console.error("Failed to set onboardingComplete flag", res);
      return { error: "Failed to set onboarding status. Please try again." };
    }
  } catch (err) {
    console.error("Error updating user metadata:", err);
    return { error: "There was an error updating the user metadata." };
  }
};
