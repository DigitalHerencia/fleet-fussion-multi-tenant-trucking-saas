/**
 * Validates required environment variables are set for the application
 * to function properly in production.
 */

export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Optional but recommended env vars to check
  const recommendedEnvVars = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'BLOB_READ_WRITE_TOKEN',
    'CLERK_WEBHOOK_SECRET'
  ];

  const missingRecommendedEnvVars = recommendedEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingRecommendedEnvVars.length > 0) {
    console.warn(
      `Warning: Missing recommended environment variables: ${missingRecommendedEnvVars.join(
        ', '
      )}. Some features may not function properly.`
    );
  }

  return true;
}
