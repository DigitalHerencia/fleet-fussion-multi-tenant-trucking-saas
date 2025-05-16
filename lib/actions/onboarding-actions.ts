"use server";

import { auth, clerkClient, type Organization } from "@clerk/nextjs/server"; // Added Organization type
import { db } from "@/db/db";
import { companies } from "@/db/schema";
import { isClerkApiError, isStandardError } from "@/lib/utils/error-guards";

export const completeOnboarding = async (formData: FormData) => {
  const { userId, orgId: activeClerkOrgId } = await auth();

  if (!userId) {
    return { error: "User not authenticated. Please sign in." };
  }

  // Get the Clerk client instance
  const clerkApi = await clerkClient();

  try {
    // Extract form values
    const companyName = formData.get("companyName")?.toString();
    const dotNumber = formData.get("dotNumber")?.toString();
    const mcNumber = formData.get("mcNumber")?.toString();
    const address = formData.get("address")?.toString();
    const city = formData.get("city")?.toString();
    const stateAbbr = formData.get("state")?.toString();
    const zipCode = formData.get("zip")?.toString();
    const phoneNum = formData.get("phone")?.toString();
    const companyEmail = formData.get("email")?.toString();

    if (!companyName) {
      return { error: "Company name is required." };
    }

    let clerkOrgIdToUse = activeClerkOrgId;

    if (!clerkOrgIdToUse) {
      const newClerkOrg: Organization = await clerkApi.organizations.createOrganization({
        name: companyName,
        createdBy: userId,
        publicMetadata: { companyType: "trucking" }
      });
      clerkOrgIdToUse = newClerkOrg.id;

      await clerkApi.organizations.createOrganizationMembership({
        organizationId: newClerkOrg.id,
        userId,
        role: "org:admin",
      });
      // It might be good to set this new org as active for the user immediately
      // This often requires client-side handling or specific Clerk SDK calls
      // For now, we rely on user.reload() on the client.
    }

    // Create company in your application's database
    const newCompanyArray = await db
      .insert(companies)
      .values({
        name: companyName,
        clerkOrgId: clerkOrgIdToUse,
        dotNumber: dotNumber,
        mcNumber: mcNumber,
        address: address,
        city: city,
        state: stateAbbr,
        zip: zipCode,
        phone: phoneNum,
        email: companyEmail,
      })
      .returning({ id: companies.id });

    if (!newCompanyArray || newCompanyArray.length === 0 || !newCompanyArray[0].id) {
      console.error("Failed to create company in DB or retrieve ID.");
      return { error: "Failed to save company details. Please try again." };
    }

    const dbCompanyId = newCompanyArray[0].id;

    return {
      success: true,
      companyId: dbCompanyId,
      clerkId: userId
    };

  } catch (err: unknown) { // Use unknown for the caught error
    console.error("Error during onboarding process:", err);
    let errorMessage = "An unexpected error occurred during onboarding.";

    if (isClerkApiError(err)) {
      errorMessage = err.errors.map((e) => e.message).join(", ");
    } else if (isStandardError(err)) {
      errorMessage = err.message;
    }
    // For other unknown error types, the generic message will be used.

    return { error: `Onboarding failed: ${errorMessage}` };
  }
};
