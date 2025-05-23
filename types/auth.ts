/**
 * Authentication and Authorization Types for FleetFusion
 * 
 * Defines comprehensive ABAC (Attribute-Based Access Control) types
 * for multi-tenant fleet management system
 */

// Core user roles within an organization
export type UserRole = 
  | 'admin'        // Full access to organization
  | 'dispatcher'   // Can manage loads, drivers, vehicles
  | 'driver'       // Can view assigned loads, update status
  | 'compliance'   // Can view/manage compliance documents
  | 'accountant'   // Can access IFTA reports and financial data
  | 'viewer'       // Read-only access

// Permissions for granular access control
export type Permission = 
  // Fleet Management
  | 'fleet:view'
  | 'fleet:create'
  | 'fleet:update'
  | 'fleet:delete'
  
  // Driver Management
  | 'drivers:view'
  | 'drivers:create'
  | 'drivers:update'
  | 'drivers:delete'
  
  // Dispatch Operations
  | 'dispatch:view'
  | 'dispatch:create'
  | 'dispatch:update'
  | 'dispatch:delete'
  | 'dispatch:assign'
  
  // Compliance Management
  | 'compliance:view'
  | 'compliance:create'
  | 'compliance:update'
  | 'compliance:delete'
  
  // Analytics & Reports
  | 'analytics:view'
  | 'reports:view'
  | 'reports:generate'
  
  // IFTA Management
  | 'ifta:view'
  | 'ifta:create'
  | 'ifta:update'
  | 'ifta:submit'
  
  // Settings & Administration
  | 'settings:view'
  | 'settings:update'
  | 'billing:view'
  | 'billing:manage'
  
  // User Management
  | 'users:view'
  | 'users:invite'
  | 'users:manage'
  | 'users:remove'

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    'fleet:view', 'fleet:create', 'fleet:update', 'fleet:delete',
    'drivers:view', 'drivers:create', 'drivers:update', 'drivers:delete',
    'dispatch:view', 'dispatch:create', 'dispatch:update', 'dispatch:delete', 'dispatch:assign',
    'compliance:view', 'compliance:create', 'compliance:update', 'compliance:delete',
    'analytics:view', 'reports:view', 'reports:generate',
    'ifta:view', 'ifta:create', 'ifta:update', 'ifta:submit',
    'settings:view', 'settings:update', 'billing:view', 'billing:manage',
    'users:view', 'users:invite', 'users:manage', 'users:remove'
  ],
  
  dispatcher: [
    'fleet:view', 'fleet:update',
    'drivers:view', 'drivers:update',
    'dispatch:view', 'dispatch:create', 'dispatch:update', 'dispatch:assign',
    'analytics:view', 'reports:view',
    'settings:view'
  ],
  
  driver: [
    'dispatch:view', // Only assigned loads
    'compliance:view', // Own documents only
    'settings:view' // Own profile only
  ],
  
  compliance: [
    'fleet:view',
    'drivers:view', 'drivers:update',
    'compliance:view', 'compliance:create', 'compliance:update', 'compliance:delete',
    'analytics:view', 'reports:view', 'reports:generate',
    'settings:view'
  ],
  
  accountant: [
    'fleet:view',
    'analytics:view', 'reports:view', 'reports:generate',
    'ifta:view', 'ifta:create', 'ifta:update', 'ifta:submit',
    'settings:view'
  ],
  
  viewer: [
    'fleet:view',
    'drivers:view',
    'dispatch:view',
    'compliance:view',
    'analytics:view',
    'ifta:view',
    'settings:view'
  ]
} as const

// Clerk user metadata structure
export interface ClerkUserMetadata {
  organizationId: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLogin?: string
  onboardingCompleted: boolean
}

// Organization metadata in Clerk
export interface ClerkOrganizationMetadata {
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'cancelled'
  maxUsers: number
  features: string[]
  billingEmail: string
  createdAt: string
  settings: {
    timezone: string
    dateFormat: string
    distanceUnit: 'miles' | 'kilometers'
    fuelUnit: 'gallons' | 'liters'
  }
}

// Extended user context with ABAC data
export interface UserContext {
  userId: string
  organizationId: string
  role: UserRole
  permissions: Permission[]
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  isActive: boolean
  onboardingCompleted: boolean
  organizationMetadata: ClerkOrganizationMetadata
}

// Auth state for React context
export interface AuthState {
  user: UserContext | null
  isLoaded: boolean
  isSignedIn: boolean
  organization: {
    id: string
    name: string
    slug: string
    metadata: ClerkOrganizationMetadata
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
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  organizationId: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  onboardingCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseOrganization {
  id: string
  clerkId: string
  name: string
  slug: string
  subscriptionTier: string
  subscriptionStatus: string
  maxUsers: number
  billingEmail: string
  settings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
