// Define interfaces for expected error structures
export interface ClerkErrorObject {
  message: string;
  code?: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
}
export interface ClerkApiError {
  errors: ClerkErrorObject[];
  status?: number;
  clerkError?: boolean;
}

export interface StandardError {
  message: string;
}

// Type guard to check if the error is a Clerk API error
export function isClerkApiError(error: unknown): error is ClerkApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ClerkApiError).errors) &&
    (error as ClerkApiError).errors.every(
      (e) => typeof e === 'object' && e !== null && typeof e.message === 'string'
    )
  );
}

// Type guard for standard JS error
export function isStandardError(error: unknown): error is StandardError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as StandardError).message === 'string'
  );
}
