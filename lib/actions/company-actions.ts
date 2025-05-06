"use server";

import {auth, clerkClient} from "@clerk/nextjs/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { createCompanySchema, type CreateCompanyFormValues } from "./company-schemas";
import { z } from "zod";

// Create a new company associated with a Clerk organization
export async function createCompany(data: CreateCompanyFormValues) {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to create a company.");
  }
  
  try {
    // Validate the data
    const validatedData = createCompanySchema.parse(data);
    
    // Insert the company
    const [company] = await db
      .insert(companies)
      .values({
        ...validatedData,
        clerkOrgId: orgId,
      })
      .returning();
    
    // Revalidate cache for dashboard pages
    revalidatePath("/dashboard");
    
    return { success: true, company };
  } catch (error) {
    console.error("Error creating company:", error);
    
    if (typeof z !== "undefined" && error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    
    return {
      success: false,
      error: "Failed to create company. Please try again.",
    };
  }
}

// Update an existing company
export async function updateCompany(data: Partial<CreateCompanyFormValues>) {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to update company details.");
  }
  
  try {
    // Find the company by orgId
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, orgId),
    });
    
    if (!existingCompany) {
      return {
        success: false,
        error: "Company not found.",
      };
    }
    
    // Update the company
    const [updatedCompany] = await db
      .update(companies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, existingCompany.id))
      .returning();
    
    // Revalidate cache for dashboard pages
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    
    return { success: true, company: updatedCompany };
  } catch (error) {
    console.error("Error updating company:", error);
    
    if (typeof z !== "undefined" && error instanceof z.ZodError) {
      return { success: false, error: (error as z.ZodError).errors };
    }
    
    return {
      success: false,
      error: "Failed to update company. Please try again.",
    };
  }
}

// Check if a company exists for the current organization
export async function checkCompanyExists() {
  const { orgId } = await auth();
  
  if (!orgId) {
    return false;
  }
  
  const company = await db.query.companies.findFirst({
    where: eq(companies.clerkOrgId, orgId),
  });
  
  return !!company;
}

// Get organization members with their roles
export async function getOrganizationMembers() {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to view organization members.");
  }
  
  try {
    const client = await clerkClient();
    const membershipList = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    
    return membershipList;
  } catch (error) {
    console.error("Error fetching organization members:", error);
    throw new Error("Failed to fetch organization members.");
  }
}

// Get company details for the current organization
export async function getCompanyDetails() {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to view company details.");
  }
  
  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, orgId),
    });
    
    if (!company) {
      return { success: false, error: "Company not found." };
    }
    
    return { success: true, company };
  } catch (error) {
    console.error("Error fetching company details:", error);
    return {
      success: false,
      error: "Failed to fetch company details. Please try again.",
    };
  }
}

// Delete a company (restricted to org admins only)
export async function deleteCompany() {
  const { userId, orgId, orgRole } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to delete a company.");
  }
  
  // Only org admins can delete companies
  if (orgRole !== 'admin') {
    throw new Error("Unauthorized: Only organization administrators can delete a company.");
  }
  
  try {
    // Find the company by orgId
    const company = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, orgId),
    });
    
    if (!company) {
      return { success: false, error: "Company not found." };
    }
    
    // Delete the company - cascading delete will handle related records
    await db.delete(companies).where(eq(companies.id, company.id));
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    
    // Redirect to login after deletion
    redirect("/login");
  } catch (error) {
    console.error("Error deleting company:", error);
    return {
      success: false,
      error: "Failed to delete company. Please try again.",
    };
  }
}

// Invite a new member to the organization
export async function inviteOrganizationMember({
  email,
  role = "basic_member",
}: {
  email: string;
  role?: string;
}) {
  const { userId, orgId, orgRole } = await auth();
  
  if (!userId || !orgId) {
    throw new Error("Unauthorized: You must be logged in to invite members.");
  }
  
  // Only org admins can invite members
  if (orgRole !== 'admin') {
    throw new Error("Unauthorized: Only organization administrators can invite members.");
  }
  
  try {
    const client = await clerkClient();
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: role,
    });
    
    return { success: true, invitation };
  } catch (error) {
    console.error("Error inviting organization member:", error);
    return {
      success: false,
      error: "Failed to invite member. Please check the email address and try again.",
    };
  }
}