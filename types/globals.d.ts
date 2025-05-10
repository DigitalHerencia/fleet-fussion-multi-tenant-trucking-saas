export {};

export type Roles = 'admin' | 'moderator';

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
