/**
 * FleetFusion ABAC (Attribute-Based Access Control) Type Definitions
 *
 * This file defines all role types, permissions, and attributes used for
 * authorization throughout the application. These types are used by Clerk
 * for custom session claims and by our middleware for access control.
 */

/**
 * System Roles - Core roles available in the FleetFusion platform
 * These are synchronized with Clerk's organization roles
 */
export const SystemRoles = {
  ADMIN: 'admin',
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
  COMPLIANCE_OFFICER: 'compliance_officer',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
} as const;

export type SystemRole = (typeof SystemRoles)[keyof typeof SystemRoles];

/**
 * Resource Types - Entities that can be accessed/modified in the system
 */
export const ResourceTypes = {
  USER: 'user',
  DRIVER: 'driver',
  VEHICLE: 'vehicle',
  LOAD: 'load',
  DOCUMENT: 'document',
  IFTA: 'ifta_report',
  ORGANIZATION: 'organization',
  BILLING: 'billing',
} as const;

export type ResourceType = (typeof ResourceTypes)[keyof typeof ResourceTypes];

/**
 * Permission Actions - Operations that can be performed on resources
 */
export const PermissionActions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage', // Full control (all operations)
  ASSIGN: 'assign', // Special action for dispatchers to assign drivers to loads
  APPROVE: 'approve', // Special action for compliance officers
  REPORT: 'report', // Special action for generating reports
} as const;

export type PermissionAction =
  (typeof PermissionActions)[keyof typeof PermissionActions];

/**
 * Permission - Represents a single permission (action + resource)
 * Example: { action: 'create', resource: 'load' }
 */
export interface Permission {
  action: PermissionAction;
  resource: ResourceType;
}

/**
 * Role Permission Map - Defines permissions for each role
 */
export const RolePermissions: Record<SystemRole, Permission[]> = {
  [SystemRoles.ADMIN]: [
    // Admin has full access to everything
    ...Object.values(ResourceTypes).flatMap(resource =>
      Object.values(PermissionActions).map(action => ({
        action,
        resource: resource as ResourceType,
      }))
    ),
  ],

  [SystemRoles.DISPATCHER]: [
    // Dispatcher permissions
    { action: PermissionActions.CREATE, resource: ResourceTypes.LOAD },
    { action: PermissionActions.READ, resource: ResourceTypes.LOAD },
    { action: PermissionActions.UPDATE, resource: ResourceTypes.LOAD },
    { action: PermissionActions.DELETE, resource: ResourceTypes.LOAD },
    { action: PermissionActions.ASSIGN, resource: ResourceTypes.DRIVER },
    { action: PermissionActions.ASSIGN, resource: ResourceTypes.VEHICLE },
    { action: PermissionActions.READ, resource: ResourceTypes.DRIVER },
    { action: PermissionActions.READ, resource: ResourceTypes.VEHICLE },
    { action: PermissionActions.READ, resource: ResourceTypes.DOCUMENT },
  ],

  [SystemRoles.DRIVER]: [
    // Driver permissions
    { action: PermissionActions.READ, resource: ResourceTypes.LOAD },
    { action: PermissionActions.UPDATE, resource: ResourceTypes.LOAD }, // For updating status
    { action: PermissionActions.CREATE, resource: ResourceTypes.DOCUMENT }, // Upload their documents
    { action: PermissionActions.READ, resource: ResourceTypes.DOCUMENT }, // View their documents
  ],

  [SystemRoles.COMPLIANCE_OFFICER]: [
    // Compliance officer permissions
    { action: PermissionActions.READ, resource: ResourceTypes.DRIVER },
    { action: PermissionActions.READ, resource: ResourceTypes.VEHICLE },
    { action: PermissionActions.READ, resource: ResourceTypes.DOCUMENT },
    { action: PermissionActions.CREATE, resource: ResourceTypes.DOCUMENT },
    { action: PermissionActions.UPDATE, resource: ResourceTypes.DOCUMENT },
    { action: PermissionActions.APPROVE, resource: ResourceTypes.DOCUMENT },
    { action: PermissionActions.REPORT, resource: ResourceTypes.DOCUMENT },
  ],

  [SystemRoles.ACCOUNTANT]: [
    // Accountant permissions
    { action: PermissionActions.READ, resource: ResourceTypes.LOAD },
    { action: PermissionActions.READ, resource: ResourceTypes.DRIVER },
    { action: PermissionActions.READ, resource: ResourceTypes.VEHICLE },
    { action: PermissionActions.CREATE, resource: ResourceTypes.IFTA },
    { action: PermissionActions.READ, resource: ResourceTypes.IFTA },
    { action: PermissionActions.UPDATE, resource: ResourceTypes.IFTA },
    { action: PermissionActions.REPORT, resource: ResourceTypes.IFTA },
    { action: PermissionActions.READ, resource: ResourceTypes.BILLING },
  ],

  [SystemRoles.VIEWER]: [
    // Viewer permissions (read-only access)
    { action: PermissionActions.READ, resource: ResourceTypes.LOAD },
    { action: PermissionActions.READ, resource: ResourceTypes.DRIVER },
    { action: PermissionActions.READ, resource: ResourceTypes.VEHICLE },
    { action: PermissionActions.READ, resource: ResourceTypes.DOCUMENT },
    { action: PermissionActions.READ, resource: ResourceTypes.IFTA },
  ],
};

/**
 * Interface for user session with ABAC attributes
 * This is what will be added to the Clerk session claims
 */
export interface UserSessionAttributes {
  role: SystemRole;
  organizationId: string;
  permissions: Permission[];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  action: PermissionAction,
  resource: ResourceType
): boolean {
  return userPermissions.some(
    permission =>
      (permission.action === action ||
        permission.action === PermissionActions.MANAGE) &&
      permission.resource === resource
  );
}

/**
 * Get permissions for a specific role
 */
export function getPermissionsForRole(role: SystemRole): Permission[] {
  return RolePermissions[role] || [];
}
