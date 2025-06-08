// lib/auth/utils.ts
import { auth } from '@clerk/nextjs/server'; // Assuming Clerk is used for auth

/**
 * Utility to get the current organization ID from the session.
 * This is a server-side utility.
 */
export async function getOrganizationId(): Promise<string | null> {
  const { orgId } = await auth();
  return orgId ? orgId : null;
}

/**
 * Utility to get the current user ID from the session.
 * This is a server-side utility.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// Add other auth-related utilities if needed
