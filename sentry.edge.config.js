// This file configures the initialization of Sentry for edge features (middleware, edge routes)
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  
  // Setting this option to true will enable performance monitoring
  enableTracing: true,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Disable request data capture for privacy
  sendDefaultPii: false,
  
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
