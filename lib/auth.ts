// lib/auth.ts
import { cookies } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { db } from "./db"
import { companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { UserRole } from "@/db/schema"

// 1) Get the Clerk user ID from the request context
export async function getCurrentUserId(): Promise<string> {
    const { userId } = await auth()
    if (!userId) throw new Error("Not authenticated")
    return userId
}

// 2) Read the selectedCompany cookie (set at login/company-select)
export async function getCurrentCompanyId(): Promise<number> {
    const cookieStore = await cookies()
    const raw = cookieStore.get("selectedCompany")?.value
    if (!raw) throw new Error("No company selected")
    const id = parseInt(raw, 10)
    if (isNaN(id)) throw new Error("Invalid company id")
    return id
}

// 3) Lookup the user’s role within that company
export async function getUserRoleInCompany(userId?: string, companyId?: number): Promise<UserRole> {
    const resolvedUserId = userId ?? (await getCurrentUserId())
    const resolvedCompanyId = companyId ?? (await getCurrentCompanyId())
    const record = await db.query.companyUsers.findFirst({
        where: and(
            eq(companyUsers.userId, resolvedUserId),
            eq(companyUsers.companyId, resolvedCompanyId.toString())
        )
    })
    if (!record) throw new Error("User not a member of this company")
    return record.role as UserRole
}

// 4) Authorization helper: require at least one of these roles (admins/owners always pass)
export async function authorizeRoles(required: UserRole[]) {
    const role = await getUserRoleInCompany()
    if (![...required, UserRole.ADMIN, UserRole.OWNER].includes(role)) {
        throw new Error("Unauthorized")
    }
}

// 5) (Optional) Permission-based check, if you prefer fine-grained strings
export const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.OWNER]: ["*"],
    [UserRole.ADMIN]: ["*"],
    [UserRole.DISPATCHER]: ["load:create", "load:read", "load:update", "load:delete" /*…*/],
    [UserRole.SAFETY_MANAGER]: ["compliance:read", "compliance:create", "compliance:update" /*…*/],
    [UserRole.ACCOUNTANT]: ["ifta:create", "ifta:read" /*…*/],
    [UserRole.DRIVER]: ["load:read_self" /*…*/],
    [UserRole.VIEWER]: ["load:read", "driver:read", "vehicle:read" /*…*/]
}
// Example usage: checkPermission('load:create')
export async function authorizePermission(perm: string) {
    const role = await getUserRoleInCompany()
    const perms = rolePermissions[role] || []
    const allowed = perms.includes(perm) || perms.includes("*")
    if (!allowed) throw new Error("Forbidden")
}
