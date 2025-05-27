/**
 * Authentication and Authorization Types for FleetFusion
 * 
 * Defines comprehensive ABAC (Attribute-Based Access Control) types
 * for multi-tenant fleet management system
 */

// Core user roles within an organization
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager', // Added MANAGER
  USER: 'user', // Added USER
  DISPATCHER: 'dispatcher',
  DRIVER: 'driver',
  COMPLIANCE: 'compliance',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Aligned permission structure with ABAC types
export type Permission = string

// Resource types for ABAC
export type ResourceType = 
  | 'user'
  | 'driver'
  | 'vehicle'
  | 'load'
  | 'document'
  | 'ifta_report'
  | 'organization'
  | 'billing'

// Permission actions for ABAC
export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'assign'
  | 'approve'
  | 'report'

// Generate permission strings from resource and action
export function createPermission(action: PermissionAction, resource: ResourceType): Permission {
  return `${action}:${resource}`
}

// Role-based permission mapping using consistent structure
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything - generate all combinations
    'create:user', 'read:user', 'update:user', 'delete:user', 'manage:user',
    'create:driver', 'read:driver', 'update:driver', 'delete:driver', 'manage:driver',
    'create:vehicle', 'read:vehicle', 'update:vehicle', 'delete:vehicle', 'manage:vehicle',
    'create:load', 'read:load', 'update:load', 'delete:load', 'manage:load', 'assign:load',
    'create:document', 'read:document', 'update:document', 'delete:document', 'approve:document',
    'create:ifta_report', 'read:ifta_report', 'update:ifta_report', 'report:ifta_report',
    'read:organization', 'update:organization', 'manage:organization',
    'read:billing', 'manage:billing'
  ],
  
  dispatcher: [
    'read:vehicle', 'update:vehicle',
    'read:driver', 'update:driver',
    'create:load', 'read:load', 'update:load', 'assign:load',
    'read:document', 'report:load'
  ],
  
  driver: [
    'read:load', 'update:load', // Only assigned loads
    'read:document', 'create:document', // Own documents only
    'read:user' // Own profile only
  ],
  
  compliance: [
    'read:vehicle',
    'read:driver', 'update:driver',
    'create:document', 'read:document', 'update:document', 'delete:document', 'approve:document',
    'report:document'
  ],
  
    
  accountant: [
    'read:load',
    'read:driver',
    'read:vehicle',
    'create:ifta_report', 'read:ifta_report', 'update:ifta_report', 'report:ifta_report',
    'read:billing'
  ],
    viewer: [
    'read:load',
    'read:driver', 
    'read:vehicle',
    'read:document',
    'read:ifta_report'
  ],
  
  manager: [
    // Manager has elevated permissions but not full admin access
    'read:user', 'update:user', 'manage:user',
    'create:driver', 'read:driver', 'update:driver', 'manage:driver',
    'create:vehicle', 'read:vehicle', 'update:vehicle', 'manage:vehicle',
    'create:load', 'read:load', 'update:load', 'assign:load', 'manage:load',
    'read:document', 'create:document', 'approve:document',
    'read:ifta_report', 'update:ifta_report', 'report:ifta_report',
    'read:organization', 'update:organization',
    'read:billing'
  ],
  
  user: [
    // Basic user permissions
    'read:user', // Own profile only
    'read:load', 'update:load', // Limited to assigned loads
    'read:document', 'create:document', // Own documents only
    'read:vehicle', // Read-only access to vehicle info
    'read:driver' // Read-only access to driver info
  ],
} as const;

// Clerk user metadata structure (aligned with JWT claims)
export interface ClerkUserMetadata {
  organizationId: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLogin?: string
  onboardingComplete: boolean // Must match JWT/session claim
}

// Organization metadata in Clerk
export interface ClerkOrganizationMetadata {
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'cancelled'
  maxUsers: number
  features: string[]
  billingEmail: string
  createdAt: string
  dotNumber?: string
  mcNumber?: string
  settings: {
    timezone: string
    dateFormat: string
    distanceUnit: 'miles' | 'kilometers'
    fuelUnit: 'gallons' | 'liters'
  }
}

// Extended user context with ABAC data
export interface UserContext {
  name: string | undefined
  userId: string
  organizationId: string
  role: UserRole
  permissions: Permission[]
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  isActive: boolean
  onboardingCompleted: boolean // Should match onboardingComplete in ClerkUserMetadata and JWT
  organizationMetadata: ClerkOrganizationMetadata
}

// Auth state for React context
export interface AuthState {
  user: UserContext | null
  isLoaded: boolean
  isSignedIn: boolean
  isLoading: boolean
  organization: {
    id: string
    name: string
    slug: string
    metadata: ClerkOrganizationMetadata
  } | null
  company: {
    id: string
    name: string
    dotNumber?: string
    mcNumber?: string
  } | null
}

// Webhook payload types for Clerk synchronization
export interface UserWebhookPayload {
  data: {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name?: string
    last_name?: string
    profile_image_url?: string
    public_metadata: ClerkUserMetadata
    organization_memberships: Array<{
      organization: {
        id: string
        name: string
        slug: string
        public_metadata: ClerkOrganizationMetadata
      }
      role: string
      public_metadata: ClerkUserMetadata
    }>
  }
  type: 'user.created' | 'user.updated' | 'user.deleted'
}

export interface OrganizationWebhookPayload {
  data: {
    id: string
    name: string
    slug: string
    public_metadata: ClerkOrganizationMetadata
    members_count: number
  }
  type: 'organization.created' | 'organization.updated' | 'organization.deleted'
}

// Database sync types
export interface DatabaseUser {
  id: string; // Clerk User ID
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  // Fields from ClerkUserMetadata, synced via webhook
  organizationId: string | null;
  role: UserRole | null;
  isActive: boolean;
  lastLogin?: string | null;
  onboardingCompleted: boolean // Should match ClerkUserMetadata.onboardingComplete
  // Standard database timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseOrganization {
  id: string; // Clerk Organization ID
  name: string;
  slug: string;
  // Fields from ClerkOrganizationMetadata, synced via webhook
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'cancelled';
  maxUsers: number;
  features: string[]; // Consider storing as JSON or in a related table
  billingEmail: string;
  clerkCreatedAt: string; // Timestamp from Clerk, renamed to avoid conflict
  dotNumber?: string | null;
  mcNumber?: string | null;
  // Settings from ClerkOrganizationMetadata (flattened or as JSON)
  settings_timezone: string;
  settings_dateFormat: string;
  settings_distanceUnit: 'miles' | 'kilometers';
  settings_fuelUnit: 'gallons' | 'liters';
  // membersCount from OrganizationWebhookPayload
  membersCount?: number;
  // Standard database timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Onboarding types
export interface OnboardingData {
  userId: string
  companyName: string
  orgName: string
  orgSlug: string
  dotNumber: string
  mcNumber: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  role: UserRole
  onboardingCompleted: boolean
}

export interface SetClerkMetadataResult {
  success: boolean
  organizationId?: string
  userId?: string
  error?: string
}
