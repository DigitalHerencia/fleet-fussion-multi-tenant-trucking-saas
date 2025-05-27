// Global TypeScript declarations for Clerk custom session claims

export {};

declare global {
  interface CustomJwtSessionClaims {
    // Match your JWT claims structure exactly
    "org.id"?: string;
    "user.id"?: string;
    "org.name"?: string;
    "org.role"?: string;
    publicMetadata?: {
      onboardingComplete?: boolean;
    };
    "user.organizations"?: string | object[];
    "org_membership.permissions"?: string[];
    
    // Additional legacy fields for compatibility
    metadata?: {
      organizationId?: string;
      role?: string;
      permissions?: string[];
      isActive?: boolean;
      lastLogin?: string;
      onboardingComplete?: boolean;
    };
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    fullName?: string;
  }
}
