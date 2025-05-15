// Constants for organization roles and permissions

export const PERMISSIONS = {
  ACCESS_ALL_REPORTS: 'org:admin:access_all_reports',
  ACCESS_AUDIT_LOGS: 'org:compliance:access_audit_logs',
  ACCESS_DISPATCH_DASHBOARD: 'org:dispatcher:access_dispatch_dashboard',
  ASSIGN_DRIVERS: 'org:dispatcher:assign_drivers',
  CONFIGURE_COMPANY_SETTINGS: 'org:admin:configure_company_settings',
  CREATE_EDIT_LOADS: 'org:dispatcher:create_edit_loads',
  GENERATE_COMPLIANCE_REPORTS: 'org:compliance:generate_compliance_reports',
  LOG_HOS: 'org:driver:log_hos',
  MANAGE_BILLING: 'org:admin:manage_billing',
  MANAGE_USERS_ROLES: 'org:admin:manage_users_and_roles',
  UPDATE_LOAD_STATUS: 'org:driver:update_load_status',
  UPLOAD_REVIEW_COMPLIANCE_DOCS: 'org:compliance:upload_review_compliance_docs',
  UPLOAD_DOCUMENTS: 'org:driver:upload_documents',
  VIEW_EDIT_ALL_LOADS: 'org:admin:view_edit_all_loads',
  VIEW_ASSIGNED_LOADS: 'org:driver:view_assigned_loads',
  VIEW_AUDIT_LOGS: 'org:admin:view_audit_logs',
  VIEW_COMPLIANCE_DASHBOARD: 'org:compliance:view_compliance_dashboard',
  VIEW_DRIVER_VEHICLE_STATUS: 'org:dispatcher:view_driver_vehicle_status',
};

export const ROLES = {
  ADMIN: 'org:admin',
  COMPLIANCE: 'org:compliance',
  DISPATCHER: 'org:dispatcher',
  DRIVER: 'org:driver',
  MEMBER: 'org:member',
};

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = typeof ROLES[keyof typeof ROLES];

// Map each role to its allowed permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ACCESS_ALL_REPORTS,
    PERMISSIONS.CONFIGURE_COMPANY_SETTINGS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_USERS_ROLES,
    PERMISSIONS.VIEW_EDIT_ALL_LOADS,
    PERMISSIONS.MANAGE_BILLING,
    // system permissions
    'org:sys_domains:read',
    'org:sys_domains:manage',
    'org:sys_profile:manage',
    'org:sys_profile:delete',
    'org:sys_memberships:read',
    'org:sys_memberships:manage',
  ],
  [ROLES.COMPLIANCE]: [
    PERMISSIONS.VIEW_COMPLIANCE_DASHBOARD,
    PERMISSIONS.ACCESS_AUDIT_LOGS,
    PERMISSIONS.GENERATE_COMPLIANCE_REPORTS,
    PERMISSIONS.UPLOAD_REVIEW_COMPLIANCE_DOCS,
    'org:sys_memberships:read',
  ],
  [ROLES.DISPATCHER]: [
    PERMISSIONS.CREATE_EDIT_LOADS,
    PERMISSIONS.ASSIGN_DRIVERS,
    PERMISSIONS.VIEW_DRIVER_VEHICLE_STATUS,
    PERMISSIONS.ACCESS_DISPATCH_DASHBOARD,
    'org:sys_memberships:read',
  ],
  [ROLES.DRIVER]: [
    PERMISSIONS.VIEW_ASSIGNED_LOADS,
    PERMISSIONS.UPDATE_LOAD_STATUS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.LOG_HOS,
    'org:sys_memberships:read',
  ],
  [ROLES.MEMBER]: [
    'org:sys_memberships:read',
  ],
};

// JWT session tokens mapping (for Clerk):
// issuer: https://driving-gelding-14.clerk.accounts.dev
// endpoint: https://driving-gelding-14.clerk.accounts.dev/.well-known/jwks.json
// Claims:
//   org.id: {{org.id}}
//   user.id: {{user.id}}
//   org.role: {{org.role}}
//   org_membership.permissions: {{org_membership.permissions}}
//   org_membership.public_metadata: {{org.public_metadata}}
