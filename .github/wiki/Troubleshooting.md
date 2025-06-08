# FleetFusion Troubleshooting Guide

This guide provides solutions to common issues encountered during development, deployment, and
operation of FleetFusion.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Development Issues](#development-issues)
- [Database Problems](#database-problems)
- [Authentication Issues](#authentication-issues)
- [Deployment Problems](#deployment-problems)
- [Performance Issues](#performance-issues)
- [API & Server Action Errors](#api--server-action-errors)
- [Frontend Issues](#frontend-issues)
- [Error Reference](#error-reference)

---

## Quick Diagnostics

### Health Check Commands

```bash
# Check overall application health
npm run health-check

# Verify environment configuration
npm run config:validate

# Test database connection
npm run db:status

# Check authentication setup
npm run auth:test

# Validate dependencies
npm run deps:check
```

### System Requirements Check

```bash
# Node.js version (requires 18.17+)
node --version

# npm version (requires 9+)
npm --version

# PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"

# Check ports availability
lsof -i :3000  # Next.js dev server
lsof -i :5432  # PostgreSQL
```

---

## Development Issues

### Server Won't Start

**Problem**: `npm run dev` fails to start

**Common Causes & Solutions**:

1. **Port Already in Use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

2. **Missing Environment Variables**

```bash
# Copy template and configure
cp .env.example .env.local

# Validate configuration
npm run config:validate
```

3. **Dependencies Not Installed**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency issues
npm ls
```

### Build Failures

**Problem**: `npm run build` fails

**Solution Steps**:

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Clean TypeScript cache
rm -rf .tsbuildinfo

# 3. Reinstall dependencies
rm -rf node_modules
npm install

# 4. Run type check
npm run type-check

# 5. Check for import errors
npm run lint
```

### Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solutions**:

```bash
# 1. Check file system limits (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf

# 2. Restart dev server
npm run dev

# 3. Clear browser cache
# Use Cmd/Ctrl + Shift + R

# 4. Check for file path issues
# Ensure correct import paths and file extensions
```

---

## Database Problems

### Connection Issues

**Problem**: "Can't connect to database"

**Diagnostic Steps**:

```bash
# 1. Test connection string
echo $DATABASE_URL

# 2. Test direct connection
psql $DATABASE_URL -c "SELECT 1;"

# 3. Check Neon dashboard status
# Visit console.neon.tech

# 4. Verify SSL requirements
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1;"
```

**Common Solutions**:

```bash
# Update connection string format
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# For local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/fleetfusion_dev"
```

### Migration Failures

**Problem**: Prisma migrations fail

**Solution Process**:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Reset database (development only)
npx prisma migrate reset

# 3. Apply pending migrations
npx prisma migrate deploy

# 4. Generate client
npx prisma generate

# 5. If shadow database errors
# Set SHADOW_DATABASE_URL in .env
```

### Schema Drift

**Problem**: Database schema doesn't match Prisma schema

**Resolution**:

```bash
# 1. Pull current database schema
npx prisma db pull

# 2. Compare with schema.prisma
# Make necessary adjustments

# 3. Create migration for changes
npx prisma migrate dev --name fix-schema-drift

# 4. Deploy migration
npx prisma migrate deploy
```

---

## Authentication Issues

### Clerk Integration Problems

**Problem**: Authentication not working

**Debugging Steps**:

```typescript
// 1. Check environment variables
console.log({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  hasSecretKey: !!process.env.CLERK_SECRET_KEY,
  webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
});

// 2. Verify Clerk configuration
import { clerkClient } from '@clerk/nextjs/server';

export async function testClerkConnection() {
  try {
    const users = await clerkClient.users.getUserList({ limit: 1 });
    console.log('Clerk connection successful:', users.length);
  } catch (error) {
    console.error('Clerk connection failed:', error);
  }
}
```

**Common Solutions**:

```bash
# 1. Verify API keys match environment
# Check Clerk Dashboard > API Keys

# 2. Update middleware configuration
# Ensure proper route matching in middleware.ts

# 3. Clear browser storage
# localStorage, sessionStorage, cookies
```

### Session Issues

**Problem**: User sessions not persisting

**Troubleshooting**:

```typescript
// 1. Check session in middleware
export default function middleware(req: NextRequest) {
  console.log('Session data:', req.headers.get('authorization'));
  // ... rest of middleware
}

// 2. Verify cookie settings
// Check secure/httpOnly/sameSite settings

// 3. Test session endpoints
fetch('/api/auth/session')
  .then(res => res.json())
  .then(console.log);
```

### Permission Errors

**Problem**: RBAC permissions not working

**Debug Process**:

```typescript
// 1. Check user context
import { auth } from '@/lib/auth';

export async function debugUserContext() {
  const context = await auth();
  console.log('User context:', {
    userId: context?.user?.id,
    orgId: context?.organization?.id,
    role: context?.organization?.role,
    permissions: context?.organization?.permissions,
  });
}

// 2. Verify permission definitions
import { hasPermission } from '@/lib/auth/permissions';

const canEditVehicles = hasPermission(userContext, 'vehicles', 'write');
console.log('Can edit vehicles:', canEditVehicles);
```

---

## Deployment Problems

### Vercel Build Failures

**Problem**: Build fails on Vercel but works locally

**Common Issues & Solutions**:

1. **Environment Variables Missing**

```bash
# Check Vercel environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

2. **Build Command Issues**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm ci"
}
```

3. **Memory/Timeout Issues**

```json
// vercel.json
{
  "functions": {
    "app/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Database Migration on Deploy

**Problem**: Migrations not running in production

**Solution**:

```bash
# 1. Set up deploy script
echo 'npx prisma migrate deploy' > scripts/deploy.sh

# 2. Add to package.json
{
  "scripts": {
    "postbuild": "npx prisma generate",
    "deploy": "npx prisma migrate deploy"
  }
}

# 3. Run manually if needed
npx prisma migrate deploy --preview-feature
```

### SSL/Certificate Issues

**Problem**: SSL certificate errors

**Resolution**:

```bash
# 1. Check domain configuration
dig your-domain.com

# 2. Verify DNS settings
# A record: your-ip
# CNAME: cname.vercel-dns.com

# 3. Force SSL renewal
# Vercel Dashboard > Domains > Refresh
```

---

## Performance Issues

### Slow Page Loads

**Problem**: Pages loading slowly

**Optimization Steps**:

```typescript
// 1. Add loading states
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SlowComponent />
    </Suspense>
  )
}

// 2. Optimize data fetching
export async function getData() {
  // Use parallel fetching
  const [users, vehicles] = await Promise.all([
    getUsers(),
    getVehicles(),
  ])

  return { users, vehicles }
}

// 3. Implement caching
import { cache } from 'react'

export const getCachedData = cache(async (id: string) => {
  return await fetchData(id)
})
```

### Database Query Performance

**Problem**: Slow database queries

**Debugging**:

```sql
-- 1. Enable query logging
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM vehicles WHERE organization_id = $1;

-- 2. Check for missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename = 'vehicles';

-- 3. Analyze query patterns
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE query LIKE '%vehicles%'
ORDER BY total_time DESC;
```

**Solutions**:

```typescript
// 1. Add database indexes
// In Prisma schema
model Vehicle {
  // ... fields
  @@index([organizationId, status])
  @@index([assignedDriverId])
}

// 2. Optimize Prisma queries
const vehicles = await prisma.vehicle.findMany({
  where: { organizationId },
  select: {
    id: true,
    make: true,
    model: true
  }, // Only select needed fields
  take: 20, // Limit results
})

// 3. Use connection pooling
// In DATABASE_URL
postgresql://user:pass@host:5432/db?connection_limit=20
```

### Bundle Size Issues

**Problem**: Large JavaScript bundles

**Analysis & Solutions**:

```bash
# 1. Analyze bundle size
npm run analyze

# 2. Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin

# 3. Optimize imports
# Before
import { Button, Dialog, Table } from '@radix-ui/react'

# After
import { Button } from '@radix-ui/react-button'
import { Dialog } from '@radix-ui/react-dialog'
```

---

## API & Server Action Errors

### Server Action Failures

**Problem**: Server actions throwing errors

**Debugging**:

```typescript
// 1. Add error logging
export async function createVehicle(data: CreateVehicleData) {
  try {
    console.log('Creating vehicle:', data);
    const result = await prisma.vehicle.create({ data });
    return { success: true, data: result };
  } catch (error) {
    console.error('Vehicle creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 2. Validate inputs
import { z } from 'zod';

const vehicleSchema = z.object({
  vin: z.string().length(17),
  make: z.string().min(1),
  // ... other fields
});

export async function createVehicle(rawData: unknown) {
  const validationResult = vehicleSchema.safeParse(rawData);
  if (!validationResult.success) {
    return { success: false, errors: validationResult.error.flatten() };
  }
  // ... proceed with valid data
}
```

### API Route Issues

**Problem**: API routes returning errors

**Common Solutions**:

```typescript
// 1. Proper error handling
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// 2. CORS issues
export async function GET(request: Request) {
  const response = Response.json({ data: 'test' });
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

// 3. Method not allowed
export async function POST(request: Request) {
  // Handle POST
}

export async function GET() {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}
```

---

## Frontend Issues

### Component Rendering Errors

**Problem**: Components not rendering correctly

**Debugging**:

```typescript
// 1. Check for hydration mismatches
'use client'
import { useState, useEffect } from 'react'

export function ClientComponent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return <div>Client-only content</div>
}

// 2. Proper error boundaries
'use client'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export function ComponentWithErrorBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RiskyComponent />
    </ErrorBoundary>
  )
}
```

### Styling Issues

**Problem**: CSS styles not applying

**Solutions**:

```css
/* 1. Check CSS specificity */
.component {
  @apply bg-blue-500; /* Tailwind */
}

/* 2. Global styles not loading */
/* In app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 3. CSS modules conflicts */
/* Use CSS modules for component-specific styles */
.button {
  background: blue;
}
```

### State Management Issues

**Problem**: State not updating correctly

**Debugging**:

```typescript
// 1. Check for stale closures
const [count, setCount] = useState(0);

const handleClick = useCallback(() => {
  setCount(prev => prev + 1); // Use functional update
}, []);

// 2. Multiple state updates
const handleMultipleUpdates = () => {
  setCount(c => c + 1);
  setName(n => n + '!');
  // Use useTransition for better UX
};

// 3. State debugging
import { useEffect } from 'react';

useEffect(() => {
  console.log('State changed:', { count, name });
}, [count, name]);
```

---

## Error Reference

### Common Error Codes

| Error Code   | Description                     | Solution                           |
| ------------ | ------------------------------- | ---------------------------------- |
| `AUTH_001`   | Invalid Clerk configuration     | Check API keys in environment      |
| `DB_001`     | Database connection failed      | Verify DATABASE_URL and network    |
| `DB_002`     | Migration failed                | Run `prisma migrate reset`         |
| `API_001`    | Server action validation failed | Check input validation schemas     |
| `API_002`    | Permission denied               | Verify user permissions and RBAC   |
| `BUILD_001`  | TypeScript compilation error    | Run `npm run type-check`           |
| `BUILD_002`  | Missing environment variable    | Add to `.env.local` or Vercel      |
| `DEPLOY_001` | Vercel build timeout            | Optimize build or increase timeout |
| `PERF_001`   | Slow database query             | Add indexes or optimize queries    |

### Error Logging

```typescript
// lib/error-logging.ts
export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  organizationId?: string;
}

export function logError(error: Error, context?: Record<string, unknown>) {
  const errorLog: ErrorLog = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    level: 'error',
    message: error.message,
    stack: error.stack,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog);
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
  }
}
```

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing issues** in the repository
3. **Run diagnostic commands** listed above
4. **Gather relevant logs** and error messages
5. **Prepare reproduction steps**

### Information to Include

When reporting issues, include:

- Error message and stack trace
- Environment (development/staging/production)
- Node.js and npm versions
- Browser and version (for frontend issues)
- Steps to reproduce
- Expected vs actual behavior
- Relevant configuration (sanitized)

### Getting Support

- **Documentation**: Check all wiki pages
- **GitHub Issues**: Create detailed issue reports
- **Development Team**: Contact via established channels
- **Emergency Issues**: Use escalation procedures

---

_This troubleshooting guide is continuously updated as new issues and solutions are identified. If
you encounter an issue not covered here, please document the solution and update this guide._
