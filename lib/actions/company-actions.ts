"use server"

import { db } from "@/db/db";
import { companies, companyUsers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";

const COMPANY_COOKIE_NAME = "selectedCompany";

// Schema for company creation
export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  primaryColor: z.string().optional(),
});

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>;

// Get all companies a user belongs to
export async function getUserCompanies() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get all companies this user belongs to
    const userCompanies = await db.query.companyUsers.findMany({
      where: eq(companyUsers.userId, userId),
      with: {
        company: true,
      },
      orderBy: desc(companyUsers.updatedAt),
    });

    if (!userCompanies.length) {
      return {
        success: true,
        data: {
          companies: [],
          currentCompany: null,
        },
      };
    }

    // Get the current company from cookie
    const cookieStore = await cookies();
    const selectedCompanyId = cookieStore.get(COMPANY_COOKIE_NAME)?.value;

    // Find the selected company or default to the most recently used
    let currentCompany = null;
    if (selectedCompanyId) {
      currentCompany =
        userCompanies.find((uc) => uc.company.id === selectedCompanyId)
          ?.company || null;
    }

    // If no company is selected, use the first company
    if (!currentCompany && userCompanies.length > 0) {
      currentCompany = userCompanies[0]?.company ?? null;
      if (currentCompany) {
        await setCurrentCompany(currentCompany.id);
      }
    }

    return {
      success: true,
      data: {
        companies: userCompanies.map((uc) => uc.company),
        currentCompany,
      },
    };
  } catch (error) {
    console.error("Error getting user companies:", error);
    return {
      success: false,
      error: "Failed to get companies",
    };
  }
}

// Set the current company for the user
export async function setCurrentCompany(companyId: string) {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Verify the user belongs to this company
    const userCompany = await db.query.companyUsers.findFirst({
      where: and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, companyId),
      ),
      with: {
        company: true,
      },
    });

    if (!userCompany) {
      return {
        success: false,
        error: "User does not belong to this company",
      };
    }

    // Set the cookie
    const cookieStore = await cookies();
    cookieStore.set(COMPANY_COOKIE_NAME, companyId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days
      maxAge: 30 * 24 * 60 * 60,
    });

    // Update last used timestamp
    await db
      .update(companyUsers)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(companyUsers.userId, userId),
          eq(companyUsers.companyId, companyId),
        ),
      );

    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error setting current company:", error);
    return {
      success: false,
      error: "Failed to set company",
    };
  }
}

// Get the current company for the user
export async function getCurrentCompany() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get selected company from cookie
    const cookieStore = await cookies();
    const selectedCompanyId = cookieStore.get(COMPANY_COOKIE_NAME)?.value;

    if (!selectedCompanyId) {
      // If no company is selected, get the most recently used
      const userCompany = await db.query.companyUsers.findFirst({
        where: eq(companyUsers.userId, userId),
        with: {
          company: true,
        },
        orderBy: desc(companyUsers.updatedAt),
      });

      if (!userCompany) {
        return {
          success: true,
          data: null,
        };
      }

      await setCurrentCompany(userCompany.company.id);
      return {
        success: true,
        data: userCompany.company,
      };
    }

    // Get the selected company
    const userCompany = await db.query.companyUsers.findFirst({
      where: and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, selectedCompanyId),
      ),
      with: {
        company: true,
      },
    });

    if (!userCompany) {
      // If the selected company doesn't exist or user doesn't belong to it,
      // clear the cookie and try again with most recent company
      const store = cookieStore;
      store.delete(COMPANY_COOKIE_NAME);
      return await getCurrentCompany();
    }

    return {
      success: true,
      data: userCompany.company,
    };
  } catch (error) {
    console.error("Error getting current company:", error);
    return {
      success: false,
      error: "Failed to get current company",
    };
  }
}

// Create a new company
export async function createCompany(data: CreateCompanyFormValues) {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate input
    const validatedData = createCompanySchema.parse(data);

    // 1. Create Clerk organization
    const clerkOrg = await createClerkOrganization(validatedData.name);
    if (!clerkOrg?.id) {
      return {
        success: false,
        error: "Failed to create Clerk organization",
      };
    }

    // 2. Create the company in the DB, linking to Clerk org
    const [newCompany] = await db
      .insert(companies)
      .values({
        name: validatedData.name,
        dotNumber: validatedData.dotNumber,
        mcNumber: validatedData.mcNumber,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zip: validatedData.zip,
        phone: validatedData.phone,
        email: validatedData.email,
        primaryColor: validatedData.primaryColor || "#0f766e",
        clerkOrgId: clerkOrg.id, // Link to Clerk organization ID, maps to a user userId
      })
      .returning();

    if (!newCompany) {
      return {
        success: false,
        error: "Failed to create company",
      };
    }

    // Add the user as an owner of the company
    await db.insert(companyUsers).values({
      userId,
      companyId: newCompany.id,
      role: "owner",
    });

    // Set this as the current company
    await setCurrentCompany(newCompany.id);

    revalidatePath("/");

    return {
      success: true,
      data: newCompany,
    };
  } catch (error) {
    console.error("Error creating company:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid company data",
        errors: error.errors,
      };
    }
    return {
      success: false,
      error: "Failed to create company",
    };
  }
}

// Helper to create Clerk org (using Clerk SDK)
async function createClerkOrganization(name: string) {
  // Use Clerk SDK to create Clerk org
  const client = await clerkClient(); // Await the function to get the client
  const org = await client.organizations.createOrganization({ name });
  return org;
}

// New server action to get companyId by clerkOrgId
export async function getCompanyIdByClerkOrgId(clerkOrgId: string): Promise<{ success: boolean; companyId?: string; error?: string }> {
  if (!clerkOrgId) {
    return { success: false, error: "Clerk Organization ID is required." };
  }

  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, clerkOrgId),
      columns: {
        id: true,
      },
    });

    if (!company) {
      return { success: false, error: "Company not found for the given Clerk Organization ID." };
    }

    return { success: true, companyId: company.id };
  } catch (error) {
    console.error("Error fetching company by Clerk Org ID:", error);
    // It's good practice to not expose raw database errors to the client.
    // Log the actual error for server-side debugging.
    return { success: false, error: "Database error when fetching company by Clerk Org ID." };
  }
}

// Get user's role in the current company
export async function getUserRole() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const currentCompanyResult = await getCurrentCompany();

    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: currentCompanyResult.error || "No company selected",
      };
    }

    const userCompany = await db.query.companyUsers.findFirst({
      where: and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.companyId, currentCompanyResult.data.id),
      ),
    });

    if (!userCompany) {
      return {
        success: false,
        error: "User does not belong to this company",
      };
    }

    return {
      success: true,
      data: userCompany.role,
    };
  } catch (error) {
    console.error("Error getting user role:", error);
    return {
      success: false,
      error: "Failed to get user role",
    };
  }
}

// Get detailed company information for the settings page
export async function getCompanyDetails() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const currentCompanyResult = await getCurrentCompany();

    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: currentCompanyResult.error || "No company selected",
      };
    }

    return {
      success: true,
      company: currentCompanyResult.data,
    };
  } catch (error) {
    console.error("Error getting company details:", error);
    return {
      success: false,
      error: "Failed to get company details",
    };
  }
}

// Schema for company update
const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  dotNumber: z.string().optional().nullable(),
  mcNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  primaryColor: z.string().optional(),
});

export type UpdateCompanyFormValues = z.infer<typeof updateCompanySchema>;

// Update an existing company
export async function updateCompany(data: UpdateCompanyFormValues) {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the current company
    const currentCompanyResult = await getCurrentCompany();

    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: currentCompanyResult.error || "No company selected",
      };
    }

    // Ensure user has permission to update this company
    const userRole = await getUserRole();
    if (
      !userRole.success ||
      (userRole.data !== "owner" && userRole.data !== "admin")
    ) {
      return {
        success: false,
        error: "Insufficient permissions to update company",
      };
    }

    // Validate input
    const validatedData = updateCompanySchema.parse(data);

    // Update the company
    await db
      .update(companies)
      .set({
        name: validatedData.name,
        dotNumber: validatedData.dotNumber || null,
        mcNumber: validatedData.mcNumber || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        zip: validatedData.zip || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        primaryColor: validatedData.primaryColor || "#0f766e",
        updatedAt: new Date(),
      })
      .where(eq(companies.id, currentCompanyResult.data.id));

    revalidatePath("/settings");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating company:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid company data",
        errors: error.errors,
      };
    }
    return {
      success: false,
      error: "Failed to update company",
    };
  }
}

// Get all members of the current organization
export async function getOrganizationMembers() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get the current company
    const currentCompanyResult = await getCurrentCompany();

    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: "No company selected",
      };
    }

    const companyId = currentCompanyResult.data.id;

    // Get all users associated with this company
    const companyUsersList = await db.query.companyUsers.findMany({
      where: eq(companyUsers.companyId, companyId),
      // If you need user details like name/email, ensure a 'user' relation
      // is defined in your companyUsers schema and then you can use:
      // with: {
      //     user: true
      // }
    });

    // Since we no longer have Clerk, we would need to adapt this based on how user data is stored
    // This is a simplified implementation that returns the IDs and roles
    const members = companyUsersList.map((cu) => ({
      id: cu.userId,
      role: cu.role,
      createdAt: cu.createdAt,
      updatedAt: cu.updatedAt,
    }));

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("Error getting organization members:", error);
    return {
      success: false,
      error: "Failed to get organization members",
    };
  }
}

// Invite a new member to the organization
export async function inviteOrganizationMember({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    const currentCompanyResult = await getCurrentCompany();
    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: "No company selected",
      };
    }
    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }
    const company = currentCompanyResult.data;
    const clerkOrgId = company.clerkOrgId;
    if (!clerkOrgId) {
      return {
        success: false,
        error: "No Clerk organization linked to this company",
      };
    }
    // Use Clerk SDK to invite user to Clerk org
    const client = await clerkClient(); // Get the actual Clerk client
    await client.organizations.createOrganizationInvitation({
      organizationId: clerkOrgId,
      emailAddress: email,
      role,
    });
    return {
      success: true,
      data: {
        email,
        role,
        companyId: company.id,
        invitedBy: userId,
        status: "pending",
        createdAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error inviting organization member:", error);
    return {
      success: false,
      error: "Failed to invite organization member",
    };
  }
}

// Delete the current company
export async function deleteCompany() {
  try {
    // Get the current user ID using our custom auth helper
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }
    // Get the current company
    const currentCompanyResult = await getCurrentCompany();
    if (!currentCompanyResult.success || !currentCompanyResult.data) {
      return {
        success: false,
        error: currentCompanyResult.error || "No company selected",
      };
    }
    const companyId = currentCompanyResult.data.id;
    // Ensure user has permission to delete this company
    const userRole = await getUserRole();
    if (!userRole.success || userRole.data !== "owner") {
      return {
        success: false,
        error: "Only the owner can delete a company",
      };
    }
    // Use a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Delete company users first (to maintain referential integrity)
      await tx
        .delete(companyUsers)
        .where(eq(companyUsers.companyId, companyId));
      // Delete the company (cascades to all related data)
      await tx.delete(companies).where(eq(companies.id, companyId));
    });
    // Clear the selected company cookie
    const cookieStore = await cookies();
    cookieStore.delete(COMPANY_COOKIE_NAME);
    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.error("[CompanyActions] Error deleting company:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete company",
    };
  }
}
