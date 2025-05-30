/**
 * RBAC (Role-Based Access Control) Utilities
 * 
 * Provides role management utilities
 * for the FleetFusion multi-tenant system with aligned type structure
 */

export type SystemRole = 'admin' | 'manager' | 'driver' | 'viewer';
export const ROLES: SystemRole[] = ['admin', 'manager', 'driver', 'viewer'];

/**
 * Check if a user has a specific role
 */
export function hasRole(user: { role: string } | null, role: SystemRole): boolean {
  return !!user && user.role === role;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: { role: string } | null, roles: SystemRole[]): boolean {
  return !!user && roles.includes(user.role as SystemRole);
}