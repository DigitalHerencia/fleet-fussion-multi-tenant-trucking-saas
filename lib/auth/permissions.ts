/**
 * ABAC (Attribute-Based Access Control) Utilities
 * 
 * Provides permission checking and role management utilities
 * for the FleetFusion multi-tenant system
 */

import { UserRole, Permission, ROLE_PERMISSIONS, UserContext } from '@/types/auth'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: UserContext | null, permission: Permission): boolean {
  if (!user || !user.isActive) return false
  return user.permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: UserContext | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) return false
  return permissions.some(permission => user.permissions.includes(permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: UserContext | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) return false
  return permissions.every(permission => user.permissions.includes(permission))
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: UserContext | null, role: UserRole): boolean {
  if (!user || !user.isActive) return false
  return user.role === role
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: UserContext | null, roles: UserRole[]): boolean {
  if (!user || !user.isActive) return false
  return roles.includes(user.role)
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: UserContext | null): boolean {
  return hasRole(user, 'admin')
}

/**
 * Check if a user can manage other users
 */
export function canManageUsers(user: UserContext | null): boolean {
  return hasAnyPermission(user, ['users:invite', 'users:manage', 'users:remove'])
}

/**
 * Check if a user can view billing information
 */
export function canViewBilling(user: UserContext | null): boolean {
  return hasAnyPermission(user, ['billing:view', 'billing:manage'])
}

/**
 * Check if a user can manage organization settings
 */
export function canManageSettings(user: UserContext | null): boolean {
  return hasPermission(user, 'settings:update')
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if a user belongs to a specific organization
 */
export function belongsToOrganization(user: UserContext | null, organizationId: string): boolean {
  if (!user) return false
  return user.organizationId === organizationId
}

/**
 * Resource-specific permission checks
 */
export const PermissionChecks = {
  // Fleet Management
  canViewFleet: (user: UserContext | null) => hasPermission(user, 'fleet:view'),
  canCreateFleet: (user: UserContext | null) => hasPermission(user, 'fleet:create'),
  canUpdateFleet: (user: UserContext | null) => hasPermission(user, 'fleet:update'),
  canDeleteFleet: (user: UserContext | null) => hasPermission(user, 'fleet:delete'),
  
  // Driver Management
  canViewDrivers: (user: UserContext | null) => hasPermission(user, 'drivers:view'),
  canCreateDrivers: (user: UserContext | null) => hasPermission(user, 'drivers:create'),
  canUpdateDrivers: (user: UserContext | null) => hasPermission(user, 'drivers:update'),
  canDeleteDrivers: (user: UserContext | null) => hasPermission(user, 'drivers:delete'),
  
  // Dispatch Operations
  canViewDispatch: (user: UserContext | null) => hasPermission(user, 'dispatch:view'),
  canCreateDispatch: (user: UserContext | null) => hasPermission(user, 'dispatch:create'),
  canUpdateDispatch: (user: UserContext | null) => hasPermission(user, 'dispatch:update'),
  canDeleteDispatch: (user: UserContext | null) => hasPermission(user, 'dispatch:delete'),
  canAssignLoads: (user: UserContext | null) => hasPermission(user, 'dispatch:assign'),
  
  // Compliance Management
  canViewCompliance: (user: UserContext | null) => hasPermission(user, 'compliance:view'),
  canCreateCompliance: (user: UserContext | null) => hasPermission(user, 'compliance:create'),
  canUpdateCompliance: (user: UserContext | null) => hasPermission(user, 'compliance:update'),
  canDeleteCompliance: (user: UserContext | null) => hasPermission(user, 'compliance:delete'),
  
  // Analytics & Reports
  canViewAnalytics: (user: UserContext | null) => hasPermission(user, 'analytics:view'),
  canViewReports: (user: UserContext | null) => hasPermission(user, 'reports:view'),
  canGenerateReports: (user: UserContext | null) => hasPermission(user, 'reports:generate'),
  
  // IFTA Management
  canViewIFTA: (user: UserContext | null) => hasPermission(user, 'ifta:view'),
  canCreateIFTA: (user: UserContext | null) => hasPermission(user, 'ifta:create'),
  canUpdateIFTA: (user: UserContext | null) => hasPermission(user, 'ifta:update'),
  canSubmitIFTA: (user: UserContext | null) => hasPermission(user, 'ifta:submit'),
  
  // Settings & Administration
  canViewSettings: (user: UserContext | null) => hasPermission(user, 'settings:view'),
  canUpdateSettings: (user: UserContext | null) => hasPermission(user, 'settings:update'),
  canViewBilling: (user: UserContext | null) => hasPermission(user, 'billing:view'),
  canManageBilling: (user: UserContext | null) => hasPermission(user, 'billing:manage'),
  
  // User Management
  canViewUsers: (user: UserContext | null) => hasPermission(user, 'users:view'),
  canInviteUsers: (user: UserContext | null) => hasPermission(user, 'users:invite'),
  canManageUsers: (user: UserContext | null) => hasPermission(user, 'users:manage'),
  canRemoveUsers: (user: UserContext | null) => hasPermission(user, 'users:remove'),
} as const

/**
 * Context-aware permission checks for specific resources
 */
export class ResourcePermissions {
  /**
   * Check if user can access a specific driver's data
   * Drivers can only access their own data unless they have broader permissions
   */
  static canAccessDriver(user: UserContext | null, driverId: string): boolean {
    if (!user) return false
    
    // If user has general driver permissions, allow access
    if (hasPermission(user, 'drivers:view')) return true
    
    // If user is the driver themselves, allow access to own data
    if (user.role === 'driver' && user.userId === driverId) return true
    
    return false
  }
  
  /**
   * Check if user can access a specific load/dispatch
   * Drivers can only see their assigned loads
   */
  static canAccessLoad(user: UserContext | null, loadDriverId?: string): boolean {
    if (!user) return false
    
    // If user has general dispatch permissions, allow access
    if (hasPermission(user, 'dispatch:view')) return true
    
    // If user is a driver and the load is assigned to them, allow access
    if (user.role === 'driver' && loadDriverId === user.userId) return true
    
    return false
  }
  
  /**
   * Check if user can access compliance documents
   * Drivers can only see their own compliance documents
   */
  static canAccessComplianceDocument(user: UserContext | null, documentDriverId?: string): boolean {
    if (!user) return false
    
    // If user has general compliance permissions, allow access
    if (hasPermission(user, 'compliance:view')) return true
    
    // If user is a driver and the document belongs to them, allow access
    if (user.role === 'driver' && documentDriverId === user.userId) return true
    
    return false
  }
}

/**
 * Higher-order component utilities for permission-based rendering
 */
export function requirePermission(permission: Permission) {
  return function<T extends object>(Component: React.ComponentType<T>) {
    return function PermissionWrapper(props: T) {
      // This would be used with the auth context
      // Implementation would check permissions and render component or fallback
      return Component as any // Placeholder for type checking
    }
  }
}

/**
 * Route protection utilities
 */
export const RouteProtection = {
  // Define which routes require which permissions
  PROTECTED_ROUTES: {
    '/dashboard': ['fleet:view'],
    '/fleet': ['fleet:view'],
    '/drivers': ['drivers:view'],
    '/dispatch': ['dispatch:view'],
    '/compliance': ['compliance:view'],
    '/analytics': ['analytics:view'],
    '/ifta': ['ifta:view'],
    '/settings': ['settings:view'],
    '/settings/billing': ['billing:view'],
    '/settings/users': ['users:view'],
  } as Record<string, Permission[]>,
  
  /**
   * Check if user can access a specific route
   */
  canAccessRoute(user: UserContext | null, path: string): boolean {
    const requiredPermissions = this.PROTECTED_ROUTES[path]
    if (!requiredPermissions) return true // Public route
    
    return hasAnyPermission(user, requiredPermissions)
  }
} as const
