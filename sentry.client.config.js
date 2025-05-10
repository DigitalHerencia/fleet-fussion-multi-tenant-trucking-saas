// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.3 : 1.0,
  
  // Setting this option to true will enable performance monitoring
  enableTracing: true,
  
  // No need for this on client
  // autoInstrumentServerFunctions: false,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Capture uncaught errors
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      // Capture errors to help debug visual issues
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter sensitive URLs in breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't capture breadcrumbs for authentication URLs
    if (breadcrumb.category === 'xhr' && 
        breadcrumb.data?.url && 
        (breadcrumb.data.url.includes('auth') || 
         breadcrumb.data.url.includes('clerk'))) {
      return null;
    }
    return breadcrumb;
  },
  
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
  
  // Environment tagging
  environment: process.env.NODE_ENV || 'development',
  
  // Disable session tracking by default for privacy
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
