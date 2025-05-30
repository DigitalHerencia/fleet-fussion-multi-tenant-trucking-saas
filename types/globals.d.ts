// Global TypeScript declarations for Clerk custom session claims (RBAC only)

export {};

declare global {
  interface CustomJwtSessionClaims {
    // Core Clerk fields
    "org.id"?: string;
    "user.id"?: string;
    "org.name"?: string;
    "org.role"?: string; // RBAC only
    
    // User information
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    fullName?: string;
    
    // Public metadata
    publicMetadata?: {
      onboardingComplete?: boolean;
      organizationId?: string;
      role?: string;
    };
  }
}
