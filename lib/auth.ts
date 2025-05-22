import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

// User roles enum
export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  DISPATCHER = "dispatcher",
  SAFETY_MANAGER = "safety_manager",
  DRIVER = "driver",
  ACCOUNTANT = "accountant",
  VIEWER = "viewer",
}

// Role-based permissions
export const rolePermissions = {
  [UserRole.OWNER]: [
    "view:all", 
    "create:all", 
    "update:all", 
    "delete:all", 
    "manage:billing",
    "manage:users",
  ],
  [UserRole.ADMIN]: [
    "view:all", 
    "create:all", 
    "update:all", 
    "delete:all", 
    "manage:users",
  ],
  [UserRole.DISPATCHER]: [
    "view:loads", 
    "create:loads", 
    "update:loads", 
    "delete:loads",
    "view:drivers", 
    "view:vehicles", 
    "assign:loads",
  ],
  [UserRole.SAFETY_MANAGER]: [
    "view:drivers",
    "view:vehicles",
    "view:compliance",
    "update:compliance",
    "create:inspections",
    "update:inspections",
    "view:loads",
  ],
  [UserRole.DRIVER]: [
    "view:own_loads", 
    "update:own_status",
    "create:own_hos",
    "create:own_dvir",
  ],
  [UserRole.ACCOUNTANT]: [
    "view:loads",
    "view:ifta",
    "create:ifta",
    "export:reports",
  ],
  [UserRole.VIEWER]: [
    "view:loads",
    "view:drivers",
    "view:vehicles",
    "view:analytics",
  ],
};

// Check if a user has a specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  if (!userRole || !permission) {
    return false;
  }
  
  const permissions = rolePermissions[userRole];
  
  if (!permissions) {
    return false;
  }
  
  // Check for specific permission
  if (permissions.includes(permission)) {
    return true;
  }
  
  // Check for wildcard permissions
  if (permission.includes(':') && permissions.includes(`${permission.split(':')[0]}:all`)) {
    return true;
  }
  
  // Owner and Admin have all permissions
  if (userRole === UserRole.OWNER || userRole === UserRole.ADMIN) {
    return true;
  }
  
  return false;
}

// Get authentication status and user information
// Get authentication status and user information
export async function getUserAuth() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    return {
      isOrgSelected: false,
      user: null,
      company: null,
      role: null,
    };
  }
  
  const user = await currentUser();
  const role = await getUserRoleInOrg();
  const company = await getCurrentCompany();
  
  return {
    isAuthenticated: !!userId,
    isOrgSelected: !!orgId,
    user,
    company,
    role,
    orgId,
  };
}

// Get the current company based on the selected organization
export const getCurrentCompany = cache(async () => {
  const { orgId } = await auth();
  
  if (!orgId) {
    return null;
  }
  
  const company = await db.query.companies.findFirst({
    where: eq(companies.clerkOrgId, orgId),
  });
  
  return company;
});

// Get the user's role in the current organization
export async function getUserRoleInOrg() {
  const { userId, orgId } = await auth();
  
  if (!userId || !orgId) {
    return null;
  }
  
  try {
    // Fetch the list of memberships for the user
    const client = await clerkClient();
    const membershipList = await client.users.getOrganizationMembershipList({
      userId: userId,
    });

    // Find the membership for the current organization
    const membership = membershipList.data?.find((m: { organization: { id: any; }; }) => m.organization.id === orgId);

    if (!membership) {
      return null;
    }
    
    // Clerk stores the role in the publicMetadata
    const role = membership.role as string;
    
    if (Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    
    // Default to viewer if the role is not recognized
    return UserRole.VIEWER;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Require authentication
// Require authentication
export async function requireAuth() {
  const authResult = await auth();
  const { userId, orgId } = authResult;
  
  if (!userId) {
    // Use the synchronous redirectToSignIn from the auth result
    return authResult.redirectToSignIn();
  }
  if (!orgId) {
    redirect("/org-selection");
  }
  
  return { userId, orgId };
}

// Protected route with role check
export async function protectRoute(requiredRole?: UserRole) {
  const authResult = await auth();
  const { userId, orgId } = authResult;
  
  if (!userId) {
    // Use the synchronous redirectToSignIn from the auth result
    return authResult.redirectToSignIn({ returnBackUrl: "/" });
  }
  
  if (!orgId) {
    redirect("/org-selection");
  }
  
  if (requiredRole) {
    const hasRole = await checkUserRole(requiredRole);
    if (!hasRole) {
      // User doesn't have the required role
      redirect("/unauthorized");
    }
  }
  
  return { userId, orgId };
}

// Check if a user has a required role
export async function checkUserRole(requiredRole: UserRole) {
  const role = await getUserRoleInOrg();
  
  if (!role) {
    return false;
  }
  
  if (requiredRole === UserRole.OWNER) {
    return role === UserRole.OWNER;
  }
  
  if (requiredRole === UserRole.ADMIN) {
    return role === UserRole.OWNER || role === UserRole.ADMIN;
  }
  
  // For other roles, check if the user has the exact role or is an admin/owner
  return role === requiredRole || role === UserRole.ADMIN || role === UserRole.OWNER;
}

// Check if user has permission
export async function checkPermission(permission: string) {
  const role = await getUserRoleInOrg();
  
  if (!role) {
    return false;
  }
  
  return hasPermission(role, permission);
}
