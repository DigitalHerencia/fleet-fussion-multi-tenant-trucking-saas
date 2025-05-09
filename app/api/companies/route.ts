import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { companies } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const clerkOrgId = url.searchParams.get("clerkOrgId");

    if (!clerkOrgId) {
      return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
    }

    // Find company by Clerk organization ID
    const company = await db.query.companies.findFirst({
      where: eq(companies.clerkOrgId, clerkOrgId),
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
