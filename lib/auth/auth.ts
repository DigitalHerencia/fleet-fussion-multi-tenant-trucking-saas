"use server"

import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { ClerkUserMetadata, ClerkOrganizationMetadata, UserContext } from "@/types/auth"

// Get the current authenticated user and their role (RBAC only)
export async function getCurrentUser(): Promise<UserContext | null> {
  const user = await currentUser();
  if (!user) return null;
  const userMeta = user.publicMetadata as unknown as ClerkUserMetadata;
  return {
    name: user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.username ?? user.emailAddresses[0]?.emailAddress ?? undefined,
    userId: user.id,
    organizationId: userMeta.organizationId || '',
    role: userMeta.role,
    permissions: [], // Permissions are not used in RBAC-only model
    email: user.emailAddresses[0]?.emailAddress ?? '',
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    profileImage: user.imageUrl,
    isActive: userMeta.isActive,
    onboardingComplete: userMeta.onboardingComplete,
    organizationMetadata: {} as ClerkOrganizationMetadata, // No org metadata in RBAC-only model
  };
}

// Require authentication and redirect to login if not authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
}

// Require a specific role (or any of a set of roles)
export async function requireRole(roles: string | string[]) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) redirect('/unauthorized');
}