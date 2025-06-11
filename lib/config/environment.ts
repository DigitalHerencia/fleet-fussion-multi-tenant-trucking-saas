/**
 * Environment Configuration Manager
 * Handles secure environment variable validation and management
 */

import { z } from 'zod';

// Environment schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  DIRECT_URL: z.string().url('Invalid DIRECT_URL format').optional(),
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET is required'),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid NEXT_PUBLIC_APP_URL format'),
  
  // Performance & Monitoring
  DATABASE_LOGGING: z.string().optional().default('false'),
  SLOW_QUERY_THRESHOLD: z.string().optional().default('1000'),
  DATABASE_MAX_CONNECTIONS: z.string().optional().default('20'),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional().default('30000'),
  
  // Optional External APIs
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional().default('true'),
  NEXT_PUBLIC_ENABLE_REAL_TIME: z.string().optional().default('false'),
});

export type Environment = z.infer<typeof envSchema>;

// Validate and parse environment variables
let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    console.error('❌ Environment validation failed:');
    console.error(missingVars.join('\n'));
    throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
  }
  throw error;
}

// Security checks
const securityChecks = () => {
  // Ensure SSL in production
  if (env.NODE_ENV === 'production' && !env.DATABASE_URL.includes('sslmode=require')) {
    console.warn('⚠️  Production database should use SSL (sslmode=require)');
  }
  
  // Check for test credentials in production
  if (env.NODE_ENV === 'production') {
    if (env.CLERK_SECRET_KEY.includes('test') || env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('test')) {
      throw new Error('❌ Test Clerk credentials detected in production environment');
    }
  }
  
  // Validate webhook secret format
  if (!env.CLERK_WEBHOOK_SECRET.startsWith('whsec_')) {
    console.warn('⚠️  Clerk webhook secret should start with "whsec_"');
  }
};

securityChecks();

export { env };

// Helper functions for environment-specific configurations
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Database configuration helper
export const getDatabaseConfig = () => ({
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
  maxConnections: parseInt(env.DATABASE_MAX_CONNECTIONS),
  connectionTimeout: parseInt(env.DATABASE_CONNECTION_TIMEOUT),
  enableLogging: env.DATABASE_LOGGING === 'true',
  slowQueryThreshold: parseInt(env.SLOW_QUERY_THRESHOLD),
});

// Clerk configuration helper
export const getClerkConfig = () => ({
  publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
  webhookSecret: env.CLERK_WEBHOOK_SECRET,
  appUrl: env.NEXT_PUBLIC_APP_URL,
});

// Feature flags helper
export const getFeatureFlags = () => ({
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  realTime: env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
});

export default env;
