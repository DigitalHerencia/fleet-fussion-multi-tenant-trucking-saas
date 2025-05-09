import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    if (!companyId) {
      return NextResponse.json({ error: "Missing company ID" }, { status: 400 });
    }
    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error("[API] /api/companies/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
