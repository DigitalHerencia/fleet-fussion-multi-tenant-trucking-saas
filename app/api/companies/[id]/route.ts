import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    // Get company by Clerk organization ID
    const company = await db.query.companies.findFirst({
      where: (companies, { eq }) => eq(companies.clerkOrgId, params.id)
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}