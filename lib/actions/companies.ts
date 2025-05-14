"use server";

import { db } from "@/db/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

/**
 * Retrieves a company by its Clerk organization ID
 *
 * @param clerkOrgId - The Clerk organization ID to look up
 * @returns The company associated with the provided Clerk organization ID
 * @throws Error if user is not authenticated, organization ID is missing, or company is not found
 */
export async function getCompanyByClerkOrgId(clerkOrgId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!clerkOrgId) throw new Error("Missing organization ID");
  const company = await db.query.companies.findFirst({
    where: eq(companies.clerkOrgId, clerkOrgId),
  });
  if (!company) throw new Error("Company not found");
  return company;
}

/**
 * Retrieves a company by its database ID
 *
 * @param companyId - The database ID of the company to retrieve
 * @returns The company with the provided ID
 * @throws Error if company ID is missing or company is not found
 */
export async function getCompanyById(companyId: string) {
  if (!companyId) throw new Error("Missing company ID");
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
  });
  if (!company) throw new Error("Company not found");
  return company;
}
