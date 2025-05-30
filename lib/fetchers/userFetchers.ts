import { UserRole } from "@/types/auth";

// Define UserWithRole type as a placeholder. Adjust as needed.
type UserWithRole = {
  id: string;
  name: string;
  role: UserRole;
};

export async function listOrganizationUsers(orgId: string): Promise<UserWithRole[]> {
  // ...fetch from Clerk and/or DB...
  return [];
}
