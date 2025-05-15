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
    const companyName = formData.get("companyName")?.toString() || "";
    const dotNumber = formData.get("dotNumber")?.toString() || "";
    const mcNumber = formData.get("mcNumber")?.toString() || "";
    const address = formData.get("address")?.toString() || "";
    const city = formData.get("city")?.toString() || "";
    const state = formData.get("state")?.toString() || "";
    const zip = formData.get("zip")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const email = formData.get("email")?.toString() || "";

    // Update user metadata
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        companyName,
      },
      privateMetadata: {
        dotNumber,
        mcNumber,
        address,
        city,
        state,
        zip,
        phone,
        email,
      },
    });

    // Verify the update was successful
    if (res.publicMetadata && (res.publicMetadata as any).onboardingComplete === true) {
      // Use Clerk orgId if available, otherwise fallback to a generated companyId
      const companyId = (res.publicMetadata as any).orgId || (res.publicMetadata as any).companyId || null;
      return { message: res.publicMetadata, success: true, companyId, clerkId: userId };
    } else {
      console.error("Failed to set onboardingComplete flag", res);
      return { error: "Failed to set onboarding status. Please try again." };
    }
  } catch (err) {
    console.error("Error updating user metadata:", err);
    return { error: "There was an error updating the user metadata." };
  }
};
