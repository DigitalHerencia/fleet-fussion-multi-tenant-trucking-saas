"use server"

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cache } from "react"
import { getCurrentCompany, getUserRole } from "@/lib/actions/company-actions"

// User roles enum
export enum UserRole {
    OWNER = "owner",
    ADMIN = "admin",
    DISPATCHER = "dispatcher",
    SAFETY_MANAGER = "safety_manager",
    DRIVER = "driver",
    ACCOUNTANT = "accountant",
    VIEWER = "viewer"
}

// Role-based permissions
export const rolePermissions = {
    [UserRole.OWNER]: [
        "view:all",
        "create:all",
        "update:all",
        "delete:all",
        "manage:billing",
        "manage:users"
    ],
    [UserRole.ADMIN]: ["view:all", "create:all", "update:all", "delete:all", "manage:users"],
    [UserRole.DISPATCHER]: [
        "view:loads",
        "create:loads",
        "update:loads",
        "delete:loads",
        "view:drivers",
        "view:vehicles",
        "assign:loads"
    ],
    [UserRole.SAFETY_MANAGER]: [
        "view:drivers",
        "view:vehicles",
        "view:compliance",
        "update:compliance",
        "create:inspections",
        "update:inspections",
        "view:loads"
    ],
    [UserRole.DRIVER]: ["view:own_loads", "update:own_status", "create:own_hos", "create:own_dvir"],
    [UserRole.ACCOUNTANT]: ["view:loads", "view:ifta", "create:ifta", "export:reports"],
    [UserRole.VIEWER]: ["view:loads", "view:drivers", "view:vehicles", "view:analytics"]
}

// Check if a user has a specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
    if (!userRole || !permission) {
        return false
    }

    const permissions = rolePermissions[userRole]

    if (!permissions) {
        return false
    }

    // Check for specific permission
    if (permissions.includes(permission)) {
        return true
    }

    // Check for wildcard permissions
    if (permission.includes(":") && permissions.includes(`${permission.split(":")[0]}:all`)) {
        return true
    }

    // Owner and Admin have all permissions
    if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
        return true
    }

    return false
}

/**
 * Get authentication status and user information
 * Use this function in server components to get all auth context
 */
export const getUserAuth = cache(async () => {
    const { userId } = await clerkAuth()

    if (!userId) {
        return {
            isAuthenticated: false,
            isCompanySelected: false,
            user: null,
            company: null,
            role: null
        }
    }

    const user = await currentUser()
    const companyResult = await getCurrentCompany()
    const company = companyResult.success ? companyResult.data : null

    const roleResult = await getUserRole()
    const role = roleResult.success ? (roleResult.data as UserRole) : null

    return {
        isAuthenticated: true,
        isCompanySelected: !!company,
        user,
        company,
        role
    }
})

/**
 * Get the current company based on cookie/session
 * Returns null if no company is selected
 */
export const getCurrentCompanyFromAuth = cache(async () => {
    const companyResult = await getCurrentCompany()
    return companyResult.success ? companyResult.data : null
})

/**
 * Get the user's role in the current company
 * Returns null if no user or company is selected
 */
export const getUserRoleInCompany = cache(async () => {
    const roleResult = await getUserRole()
    return roleResult.success ? (roleResult.data as UserRole) : null
})

/**
 * Check if a user has a required role
 * Returns boolean indicating if the user has the required role
 */
export async function checkUserRole(requiredRole: UserRole) {
    const role = await getUserRoleInCompany()

    if (!role) {
        return false
    }

    if (requiredRole === UserRole.OWNER) {
        return role === UserRole.OWNER
    }

    if (requiredRole === UserRole.ADMIN) {
        return role === UserRole.OWNER || role === UserRole.ADMIN
    }

    // For other roles, check if the user has the exact role or is an admin/owner
    return role === requiredRole || role === UserRole.ADMIN || role === UserRole.OWNER
}

/**
 * Check if user has permission
 * Returns boolean indicating if the user has the required permission
 */
export async function checkPermission(permission: string) {
    const role = await getUserRoleInCompany()

    if (!role) {
        return false
    }

    return hasPermission(role as UserRole, permission)
}

/**
 * Require authentication for server components
 * Redirects to sign-in if not authenticated or company-selection if no company is selected
 */
export async function requireAuth() {
    const { userId } = await clerkAuth()

    if (!userId) {
        // Use the custom sign-in page directly instead of Clerk's universal flow
        redirect("/sign-in?redirect_url=" + encodeURIComponent(global?.location?.href || "/"))
    }

    const companyResult = await getCurrentCompany()
    const company = companyResult.success ? companyResult.data : null

    if (!company) {
        redirect("/company-selection")
    }

    return { userId, companyId: company.id }
}

/**
 * Protected route with role check for server components
 * Redirects appropriately based on authentication state and role
 */
export async function protectRoute(requiredRole?: UserRole) {
    const { userId } = await clerkAuth()

    if (!userId) {
        // Use the custom sign-in page directly instead of Clerk's universal flow
        redirect("/sign-in?redirect_url=" + encodeURIComponent(global?.location?.href || "/"))
    }

    const companyResult = await getCurrentCompany()
    const company = companyResult.success ? companyResult.data : null

    if (!company) {
        redirect("/company-selection")
    }

    if (requiredRole) {
        const hasRole = await checkUserRole(requiredRole)
        if (!hasRole) {
            // User doesn't have the required role
            redirect("/unauthorized")
        }
    }

    return { userId, companyId: company.id }
}
