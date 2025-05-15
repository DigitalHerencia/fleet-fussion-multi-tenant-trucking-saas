// DEPRECATED: All types have been consolidated into types/types.ts. Please import from there.

export {};

export type Roles = "admin" | "moderator";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      onboardingComplete?: boolean;
      applicationName?: string;
      applicationType?: string;
      role?: Roles;
    };
  }
}
