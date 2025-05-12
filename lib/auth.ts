// lib/auth.ts
import { cookies } from "next/headers"
import { db } from "../db"
import { companyUsers, companies } from "../db/schema"
import { eq, and } from "drizzle-orm"
import { UserRole } from "../db/schema"
import { auth } from "@clerk/nextjs/server"

/**
 * Retrieve the current authenticated user's ID using Clerk.
 */
export async function getCurrentUserId(): Promise<string> {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Not authenticated")
    }

    return userId
}

/**
 * Returns the current company ID for the authenticated user, or null if not authenticated.
 * Get the current company ID based on the selected Clerk organization.
 * First checks for an explicitly selected company in the cookie (for multi-company scenarios),
 * then falls back to looking up the company using the current Clerk organization ID.
 */
export async function getCurrentCompanyId(): Promise<string> {
    // First check if there's an explicitly selected company
    const cookieStore = await cookies()
    const explicitlySelected = cookieStore.get("selectedCompany")?.value
    if (explicitlySelected) {
        return explicitlySelected
    }

    // If no explicit selection, use the current Clerk organization
    const { orgId } = await auth()

    if (!orgId) {
        throw new Error("No organization selected")
    }

    // Look up the company using the Clerk orgId
    const company = await db.query.companies.findFirst({
        where: eq(companies.clerkOrgId, orgId)
    })

    if (!company) {
        throw new Error("Company not found for current organization")
    }

    return company.id
}

/**
 * Alias for getCurrentCompanyId to match naming conventions.
 */
export async function getAuthCompanyId() {
    return getCurrentCompanyId()
}

/**
 * Lookup the user's role within the given company.
 * Uses provided IDs or defaults to current context.
 * For Clerk integration, also considers Clerk organization roles.
 */
export async function getUserRoleInCompany(userId?: string, companyId?: string): Promise<UserRole> {
    const uid = userId ?? (await getCurrentUserId())
    const cid = companyId ?? getCurrentCompanyId()

    const cidResolved = await cid

    // First check the company_users table for custom roles
    const record = await db.query.companyUsers.findFirst({
        where: and(eq(companyUsers.userId, uid), eq(companyUsers.companyId, cidResolved))
    })

    if (record) {
        return record.role as UserRole
    }

    // If no custom role, check Clerk organization membership
    const { orgRole } = await auth()

    // Map Clerk organization roles to our application roles
    if (orgRole === "admin") {
        return UserRole.ADMIN
    } else if (orgRole === "org:admin") {
        return UserRole.OWNER
    } else if (orgRole) {
        return UserRole.VIEWER // Default role for any other Clerk roles
    }

    throw new Error("User not a member of this company")
}

/**
 * Require that the current user has one of the specified roles.
 * Admin and Owner roles always pass.
 */
export async function authorizeRoles(required: UserRole[]): Promise<void> {
    const role = await getUserRoleInCompany()
    const allowedRoles = [...required, UserRole.ADMIN, UserRole.OWNER]
    if (!allowedRoles.includes(role)) {
        throw new Error("Unauthorized")
    }
}

/**
 * Fine-grained permission mapping per role.
 */
export const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.OWNER]: ["*"],
    [UserRole.ADMIN]: ["*"],
    [UserRole.DISPATCHER]: ["load:create", "load:read", "load:update", "load:delete"],
    [UserRole.SAFETY_MANAGER]: ["compliance:read", "compliance:create", "compliance:update"],
    [UserRole.ACCOUNTANT]: ["ifta:create", "ifta:read"],
    [UserRole.DRIVER]: ["load:read_self"],
    [UserRole.VIEWER]: ["load:read", "driver:read", "vehicle:read"]
}

/**
 * Require that the current user has the specified permission.
 */
export async function authorizePermission(perm: string): Promise<void> {
    const role = await getUserRoleInCompany()
    const perms = rolePermissions[role] || []
    const allowed = perms.includes(perm) || perms.includes("*")
    if (!allowed) {
        throw new Error("Forbidden")
    }
}
