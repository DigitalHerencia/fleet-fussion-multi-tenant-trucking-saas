// This file configures the initialization of Sentry on the server.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  
  // Setting this option to true will enable performance monitoring
  enableTracing: true,
  
  // Server function instrumentation
  autoInstrumentServerFunctions: true,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Environment tagging
  environment: process.env.NODE_ENV || 'development',
  
  // Filter out noisy errors
  ignoreErrors: [
    // Network errors that don't represent actual app issues
    'Network request failed', 
    'Failed to fetch', 
    'NetworkError',
    'ChunkLoadError',
    // Clerk and auth related non-critical errors
    'clerk', 
    'auth'
  ],
});
