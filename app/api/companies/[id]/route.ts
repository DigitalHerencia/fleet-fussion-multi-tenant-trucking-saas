import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { db } from "@/db"
import { companies } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Get auth information - this ensures proper authorization
        const { userId, orgId } = await auth()

        // If no user is authenticated, return unauthorized
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get the organization ID from the route parameter
        const organizationId = params.id

        // Safety check - users should only be able to access data for their current organization
        if (orgId && orgId !== organizationId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Verify the user belongs to the organization
        const client = await clerkClient()
        const membership = await client.users.getOrganizationMembershipList({
            userId
        })

        const belongsToOrg = membership.data.some(m => m.organization.id === organizationId)

        if (!belongsToOrg) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Fetch company data from the database
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, organizationId)
        })

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 })
        }

        return NextResponse.json(company)
    } catch (error) {
        console.error("[COMPANY_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
