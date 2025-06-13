# FleetFusion Environment Configuration

This guide covers all environment variables, configuration management, and secrets handling for
FleetFusion across different deployment environments.

## Table of Contents

- [Environment Overview](#environment-overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configs](#environment-specific-configs)
- [Security & Secrets](#security--secrets)
- [Configuration Validation](#configuration-validation)
- [Local Development](#local-development)
- [Production Setup](#production-setup)

---

## Environment Overview

FleetFusion uses environment variables for configuration management across development, staging, and
production environments. All sensitive data is handled through secure environment variables and
never committed to version control.

### Environment Files Structure

```
├── .env.local                 # Local development (git-ignored)
├── .env.example              # Template with dummy values
├── .env.test                 # Test environment
└── .env.production           # Production (managed via Vercel)
```

### Configuration Hierarchy

1. Environment variables (highest priority)
2. `.env.local` (development)
3. `.env.production` (production)
4. `.env` (base configuration)
5. Default values in code (lowest priority)

---

## Required Variables

### Core Application

```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://app.fleetfusion.com

# Environment
NODE_ENV=production

# API Base URL
NEXT_PUBLIC_API_URL=https://api.fleetfusion.com
```

### Database Configuration

```bash
# Primary database connection
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Shadow database for migrations (development)
SHADOW_DATABASE_URL=postgresql://username:password@host:5432/shadow_db?sslmode=require

# Connection pooling
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
DATABASE_POOL_TIMEOUT=30000
```

### Authentication (Clerk)

```bash
# Clerk authentication keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Webhook verification
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## Optional Variables

### External Services

```bash
# Email service (Postmark)
POSTMARK_API_TOKEN=your-api-token
POSTMARK_FROM_EMAIL=noreply@fleetfusion.com

# SMS service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fleetfusion-documents
```

### Payment Processing

```bash
# Stripe payment processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription product IDs
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Analytics & Monitoring

```bash
# Error tracking (Sentry)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=fleetfusion
SENTRY_PROJECT=webapp

# Analytics (Vercel)
VERCEL_ANALYTICS_ID=your-analytics-id

# Application monitoring
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=FleetFusion

# Log management
LOGTAIL_TOKEN=your-logtail-token
```

### Maps & Geolocation

```bash
# Google Maps integration
GOOGLE_MAPS_API_KEY=your-api-key

# MapBox integration (alternative)
MAPBOX_ACCESS_TOKEN=your-access-token
```

### Cache & Session Management

```bash
# Redis for caching and sessions
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Session configuration
SESSION_SECRET=your-session-secret
SESSION_TIMEOUT=3600000
```

---

## Environment-Specific Configs

### Development Environment

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Use local database
DATABASE_URL=postgresql://postgres:password@localhost:5432/fleetfusion_dev

# Clerk test keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Debug settings
DEBUG=true
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true

# Disable external services in development
SKIP_EMAIL_VERIFICATION=true
MOCK_EXTERNAL_APIS=true
```

### Staging Environment

```bash
# Staging configuration
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.fleetfusion.com

# Staging database
DATABASE_URL=postgresql://staging_user:password@staging-db:5432/fleetfusion_staging

# Staging Clerk environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_staging_...
CLERK_SECRET_KEY=sk_test_staging_...

# Enable logging but not debug
LOG_LEVEL=info
ENABLE_ANALYTICS=false
```

### Production Environment

```bash
# Production configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.fleetfusion.com

# Production database with connection pooling
DATABASE_URL=postgresql://prod_user:secure_password@prod-db:5432/fleetfusion_prod?sslmode=require&connection_limit=20

# Production Clerk environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production optimizations
LOG_LEVEL=warn
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
CACHE_TTL=3600
```

---

## Security & Secrets

### Secret Management Best Practices

1. **Never commit secrets** to version control
2. **Use secure secret managers** (Vercel Secrets, AWS Secrets Manager)
3. **Rotate secrets regularly** (monthly for high-security keys)
4. **Use environment-specific secrets** (separate dev/staging/prod)
5. **Implement secret validation** at application startup

### Secret Rotation Strategy

```typescript
// lib/secrets/rotation.ts
export interface SecretRotationConfig {
  secretName: string;
  rotationInterval: number; // days
  lastRotated: Date;
  nextRotation: Date;
  autoRotate: boolean;
}

export const secretRotationSchedule: SecretRotationConfig[] = [
  {
    secretName: 'CLERK_SECRET_KEY',
    rotationInterval: 90,
    lastRotated: new Date('2024-01-01'),
    nextRotation: new Date('2024-04-01'),
    autoRotate: false,
  },
  {
    secretName: 'DATABASE_URL',
    rotationInterval: 30,
    lastRotated: new Date('2024-01-01'),
    nextRotation: new Date('2024-02-01'),
    autoRotate: true,
  },
];
```

### Secret Validation

```typescript
// lib/env/validation.ts
import { z } from 'zod';

const environmentSchema = z.object({
  // Required secrets
  DATABASE_URL: z.string().url('Invalid database URL'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Clerk secret key'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Clerk publishable key'),

  // Optional secrets with defaults
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters').optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Environment-specific validation
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
});

export function validateEnvironment() {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

---

## Configuration Validation

### Runtime Validation

```typescript
// lib/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    name: z.string().default('FleetFusion'),
    version: z.string().default('1.0.0'),
    url: z.string().url(),
    environment: z.enum(['development', 'test', 'staging', 'production']),
  }),
  database: z.object({
    url: z.string().url(),
    poolMax: z.number().default(20),
    poolMin: z.number().default(5),
    timeout: z.number().default(30000),
  }),
  auth: z.object({
    clerkPublishableKey: z.string(),
    clerkSecretKey: z.string(),
    sessionSecret: z.string().min(32),
    sessionTimeout: z.number().default(3600000),
  }),
  features: z.object({
    enableAnalytics: z.boolean().default(true),
    enableDebugMode: z.boolean().default(false),
    enableMockData: z.boolean().default(false),
  }),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const config = {
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'FleetFusion',
      version: process.env.npm_package_version || '1.0.0',
      url: process.env.NEXT_PUBLIC_APP_URL!,
      environment: process.env.NODE_ENV!,
    },
    database: {
      url: process.env.DATABASE_URL!,
      poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20'),
      poolMin: parseInt(process.env.DATABASE_POOL_MIN || '5'),
      timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '30000'),
    },
    auth: {
      clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
      clerkSecretKey: process.env.CLERK_SECRET_KEY!,
      sessionSecret: process.env.SESSION_SECRET!,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'),
    },
    features: {
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      enableDebugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
      enableMockData: process.env.MOCK_EXTERNAL_APIS === 'true',
    },
  };

  return configSchema.parse(config);
}
```

### Configuration Health Check

```typescript
// lib/health/config-check.ts
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
}

export async function checkConfigurationHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Check required environment variables
  const requiredVars = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    checks.push({
      name: `Environment Variable: ${varName}`,
      status: value ? 'healthy' : 'critical',
      message: value ? 'Present' : 'Missing',
      timestamp: new Date(),
    });
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'Database Connection',
      status: 'healthy',
      message: 'Connected successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    checks.push({
      name: 'Database Connection',
      status: 'critical',
      message: `Connection failed: ${error.message}`,
      timestamp: new Date(),
    });
  }

  return checks;
}
```

---

## Local Development

### Setup Instructions

1. **Copy environment template**

```bash
cp .env.example .env.local
```

2. **Configure required variables**

```bash
# Edit .env.local with your values
nano .env.local
```

3. **Validate configuration**

```bash
npm run config:validate
```

4. **Start development server**

```bash
npm run dev
```

### Development Tools

```typescript
// scripts/dev-tools.ts
export function generateDevConfig() {
  const template = `# FleetFusion Development Configuration
# Copy this to .env.local and fill in your values

# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database (use local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/fleetfusion_dev

# Clerk Authentication (get from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: External Services (can be mocked in development)
POSTMARK_API_TOKEN=your_postmark_token
STRIPE_SECRET_KEY=sk_test_your_stripe_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Development Features
DEBUG=true
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
MOCK_EXTERNAL_APIS=true
SKIP_EMAIL_VERIFICATION=true
`;

  return template;
}
```

---

## Production Setup

### Vercel Configuration

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add STRIPE_SECRET_KEY production

# Set staging environment variables
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add DATABASE_URL preview
vercel env add CLERK_SECRET_KEY preview
```

### Environment Variable Management

```typescript
// lib/env/manager.ts
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: Config;

  private constructor() {
    this.config = loadConfig();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  public isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  public isFeatureEnabled(feature: keyof Config['features']): boolean {
    return this.config.features[feature];
  }

  public getConnectionString(): string {
    return this.config.database.url;
  }

  public getAuthConfig() {
    return this.config.auth;
  }
}

// Export singleton instance
export const env = EnvironmentManager.getInstance();
```

### Configuration Monitoring

```typescript
// lib/monitoring/config-monitor.ts
export interface ConfigurationAlert {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  environment: string;
}

export class ConfigurationMonitor {
  private alerts: ConfigurationAlert[] = [];

  public checkForIssues(): ConfigurationAlert[] {
    this.alerts = [];

    // Check for missing critical variables
    this.checkCriticalVariables();

    // Check for security issues
    this.checkSecurityConfiguration();

    // Check for performance settings
    this.checkPerformanceConfiguration();

    return this.alerts;
  }

  private checkCriticalVariables() {
    const critical = ['DATABASE_URL', 'CLERK_SECRET_KEY'];

    for (const varName of critical) {
      if (!process.env[varName]) {
        this.alerts.push({
          level: 'error',
          message: `Critical variable ${varName} is missing`,
          timestamp: new Date(),
          environment: process.env.NODE_ENV || 'unknown',
        });
      }
    }
  }

  private checkSecurityConfiguration() {
    // Check if running in production with development keys
    if (process.env.NODE_ENV === 'production') {
      if (process.env.CLERK_SECRET_KEY?.includes('test')) {
        this.alerts.push({
          level: 'error',
          message: 'Production environment using test Clerk keys',
          timestamp: new Date(),
          environment: 'production',
        });
      }
    }
  }

  private checkPerformanceConfiguration() {
    const poolSize = parseInt(process.env.DATABASE_POOL_MAX || '20');

    if (poolSize > 50) {
      this.alerts.push({
        level: 'warn',
        message: `Database pool size (${poolSize}) may be too large`,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'unknown',
      });
    }
  }
}
```

---

## Configuration Examples

### Complete Development Configuration

```bash
# .env.local (development)
# FleetFusion Development Environment

# Core Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database
DATABASE_URL=postgresql://postgres:fleetfusion@localhost:5432/fleetfusion_dev
SHADOW_DATABASE_URL=postgresql://postgres:fleetfusion@localhost:5432/fleetfusion_shadow

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsubG9jYWxob3N0JA
CLERK_SECRET_KEY=sk_test_1234567890abcdef
CLERK_WEBHOOK_SECRET=whsec_development_secret

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Development Features
DEBUG=true
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
MOCK_EXTERNAL_APIS=true
SKIP_EMAIL_VERIFICATION=true

# Optional External Services (mock in development)
POSTMARK_API_TOKEN=mock_token
STRIPE_SECRET_KEY=sk_test_mock_key
GOOGLE_MAPS_API_KEY=mock_api_key
```

### Complete Production Configuration

```bash
# Production Environment Variables (managed via Vercel)
# FleetFusion Production Environment

# Core Application
NEXT_PUBLIC_APP_URL=https://app.fleetfusion.com
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://app.fleetfusion.com/api

# Database (Neon)
DATABASE_URL=postgresql://username:password@host:5432/fleetfusion_prod?sslmode=require&connection_limit=20

# Authentication (Clerk Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_production_key
CLERK_SECRET_KEY=sk_live_production_secret
CLERK_WEBHOOK_SECRET=whsec_production_webhook_secret

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# External Services
POSTMARK_API_TOKEN=production_postmark_token
STRIPE_SECRET_KEY=sk_live_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_production_stripe_webhook
GOOGLE_MAPS_API_KEY=production_maps_api_key

# Monitoring
SENTRY_DSN=https://production_sentry_dsn@sentry.io/project
VERCEL_ANALYTICS_ID=production_analytics_id

# Performance
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
CACHE_TTL=3600
LOG_LEVEL=warn
```

---

_For security reasons, never share actual production environment variables. Always use secure secret
management systems and follow the principle of least privilege for secret access._
