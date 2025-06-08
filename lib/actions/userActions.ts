'use server';

export async function inviteUserAction(
  orgId: string,
  email: string,
  role: string
) {
  // ...invite user via Clerk...
  return { success: true };
}

export async function updateUserRoleAction(
  orgId: string,
  userId: string,
  newRole: string
) {
  // ...update role in Clerk and DB...
  return { success: true };
}
