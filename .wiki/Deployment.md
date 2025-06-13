# FleetFusion Deployment Guide

This guide covers deploying FleetFusion to production environments, including Vercel deployment,
environment configuration, CI/CD setup, and monitoring.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migration](#database-migration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Domain Configuration](#domain-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying FleetFusion, ensure you have:

### Required Services

- **Vercel Account** with Pro plan (for team features)
- **Neon PostgreSQL** database (production branch)
- **Clerk Authentication** project configured
- **GitHub Repository** with proper access permissions

### Required Tools

```bash
# Install Vercel CLI
npm i -g vercel

# Install dependencies
npm install

# Verify build
npm run build
```

### Domain & SSL

- Custom domain purchased and configured
- SSL certificate (handled automatically by Vercel)

---

## Vercel Deployment

### Initial Setup

1. **Connect Repository**

```bash
# Connect to Vercel
vercel --yes

# Set project settings
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add DATABASE_URL
```

2. **Configure Build Settings**

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

3. **Deploy to Production**

```bash
# Deploy main branch
vercel --prod

# Check deployment status
vercel ls
```

---

## Environment Configuration

### Production Environment Variables

Create production environment variables in Vercel dashboard or via CLI:

```bash
# Core Application
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NODE_ENV

# Database
vercel env add DATABASE_URL
vercel env add SHADOW_DATABASE_URL

# Authentication (Clerk)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

# Monitoring
vercel env add SENTRY_DSN
vercel env add VERCEL_ANALYTICS_ID

# External Services
vercel env add POSTMARK_API_TOKEN
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

### Environment Validation

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  // ... other variables
});

export const env = envSchema.parse(process.env);
```

---

## Database Migration

### Production Database Setup

1. **Create Production Branch**

```bash
# Create production branch in Neon
npx neonctl branches create --name=production

# Get production connection string
npx neonctl connection-string --branch=production
```

2. **Run Migrations**

```bash
# Deploy schema to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

3. **Seed Production Data**

```bash
# Run production seeds
npm run seed:production
```

### Migration Strategy

- Use Prisma migrations for schema changes
- Test migrations on staging branch first
- Backup database before major migrations
- Use read replicas for zero-downtime deployments

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Deployment Stages

1. **Development**: Feature branches auto-deploy to preview URLs
2. **Staging**: Develop branch deploys to staging environment
3. **Production**: Main branch deploys to production after tests pass

---

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**

```bash
# Add custom domain
vercel domains add fleetfusion.com

# Configure DNS records
vercel domains inspect fleetfusion.com
```

2. **DNS Configuration**

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. **SSL Certificate**

- Automatically provisioned by Vercel
- Includes www and apex domain
- Auto-renewal handled by Vercel

### Subdomain Strategy

- `app.fleetfusion.com` - Main application
- `api.fleetfusion.com` - API endpoints
- `docs.fleetfusion.com` - Documentation
- `status.fleetfusion.com` - Status page

---

## Monitoring & Logging

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Monitoring with Sentry

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    return event;
  },
});
```

### Custom Logging

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Add external logging service
  ],
});
```

---

## Performance Optimization

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    serverComponentsExternalPackages: ['prisma'],
  },
  images: {
    domains: ['images.clerk.dev'],
    formats: ['image/webp', 'image/avif'],
  },
  poweredByHeader: false,
  compress: true,
};
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin
```

### Caching Strategy

- API responses cached with appropriate headers
- Static assets cached with long TTL
- Database queries cached with Redis
- CDN optimization for global distribution

---

## Troubleshooting

### Common Deployment Issues

#### Build Failures

```bash
# Check build logs
vercel logs

# Test build locally
npm run build

# Clear build cache
rm -rf .next
npm run build
```

#### Environment Variable Issues

```bash
# List environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local

# Test environment locally
npm run dev
```

#### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Check connection string
echo $DATABASE_URL

# Verify migrations
npx prisma migrate status
```

### Performance Issues

#### Slow Cold Starts

- Optimize bundle size
- Use edge runtime where possible
- Implement proper caching

#### Database Performance

- Add database indexes
- Optimize queries with explain plans
- Use connection pooling

### Rollback Strategy

```bash
# Rollback to previous deployment
vercel rollback

# Rollback specific deployment
vercel rollback <deployment-url>

# Database rollback (if needed)
npx prisma migrate rollback
```

---

## Security Considerations

### Production Checklist

- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Webhook signatures verified
- [ ] Database access restricted
- [ ] Error messages sanitized
- [ ] Audit logging enabled
- [ ] Backup strategy implemented

### Security Headers

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}
```

---

## Post-Deployment

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

### Monitoring Checklist

- [ ] Uptime monitoring configured
- [ ] Error rate alerts setup
- [ ] Performance monitoring active
- [ ] Database monitoring enabled
- [ ] Log aggregation working
- [ ] Backup verification scheduled

---

_For additional support, consult the [Troubleshooting Guide](./Troubleshooting.md) or contact the
DevOps team._

## Vercel Deployment Analysis

### Current Implementation Assessment

#### ✅ What's Working Well

1. **Authentication Architecture**

   - Proper Clerk middleware implementation with ABAC support
   - Comprehensive role-based access control (8 roles: admin, manager, user, dispatcher, driver,
     compliance, accountant, viewer)
   - Multi-tenant organization structure
   - Proper session claim management

2. **Database Integration**

   - Neon PostgreSQL integration for multi-tenancy
   - Webhook handlers for Clerk-to-database synchronization
   - Proper user metadata and organization metadata handling

3. **Type Safety**
   - Comprehensive TypeScript definitions for auth, ABAC, and permissions
   - Proper typing for Clerk session claims and user context

### Potential Deployment Issues & Solutions

#### 🚨 Environment Variables Configuration

**Issue**: Missing or incorrect environment variables in Vercel **Solution**: Ensure these are set
in Vercel dashboard:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs (for production)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# Neon Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 🔧 Webhook Configuration Issues

**Issue**: Clerk webhooks failing to reach Vercel deployment **Solutions**:

1. **Update Clerk Dashboard**:

   - Webhook URL: `https://your-app.vercel.app/api/clerk/webhook-handler`
   - Events to listen for: user.created, user.updated, user.deleted, organization._,
     organizationMembership._

2. **Verify Webhook Secret**:
   - Copy webhook secret from Clerk dashboard
   - Add to Vercel environment variables as `CLERK_WEBHOOK_SECRET`

#### 🗄️ Database Connection Issues

**Issue**: Neon database connection timeouts or connection limits **Solutions**:

1. **Connection Pooling**:

   - Use `@neondatabase/serverless` for optimal connection management
   - Implement proper connection management in Prisma client

2. **Database URL Configuration**:

   ```typescript
   // lib/database/connection.ts
   import { neon } from '@neondatabase/serverless';

   export const sql = neon(process.env.DATABASE_URL!);
   ```

#### ⚡ Middleware Edge Runtime Issues

**Issue**: Middleware not working properly on Vercel Edge Runtime **Current Status**: Your
middleware.ts implementation is correct ✅

**Potential Enhancement**:

```typescript
// Add to middleware.ts if experiencing issues
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
  runtime: 'nodejs', // Add this if edge runtime causes issues
};
```

#### 🚀 Performance Optimization for Vercel

1. **Bundle Size Optimization**:

   ```javascript
   // next.config.ts
   const nextConfig = {
     experimental: {
       optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
     },
     images: {
       domains: ['clerk.com'],
     },
   };
   ```

2. **Caching Strategy**:

   ```typescript
   // Optimize for Vercel's caching
   import { unstable_cache } from 'next/cache';

   export const getCachedData = unstable_cache(
     async (orgId: string) => {
       // Your data fetching logic
     },
     ['cache-key'],
     {
       revalidate: 300, // 5 minutes
       tags: ['organization-data'],
     }
   );
   ```
