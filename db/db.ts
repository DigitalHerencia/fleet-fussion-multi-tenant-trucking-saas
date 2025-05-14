import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a connection pool to the database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a drizzle instance using the connection pool
export const db = drizzle(pool, { schema });

// Helper function to get the company ID from the Clerk organization ID
export async function getCompanyIdFromClerkOrgId(clerkOrgId: string) {
  const company = await db.query.companies.findFirst({
    where: (companies, { eq }) => eq(companies.clerkOrgId, clerkOrgId),
    columns: { id: true },
  });

  return company?.id;
}
