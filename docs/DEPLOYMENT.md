# FleetFusion Production Deployment Guide

This document provides instructions for deploying FleetFusion to a production environment.

## Prerequisites

Before deploying to production, ensure you have:

- A Vercel account with appropriate permissions
- A Clerk account configured with your production domain
- A Neon PostgreSQL database for production
- Sentry project configured for error monitoring
- All required environment variables set up

## Environment Variables

Make sure all required environment variables are properly set in your production environment. Refer to `.env.example` for the full list. The critical ones include:

```
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-key
CLERK_SECRET_KEY=sk_live_your-key
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret

# Database (Neon PostgreSQL)
DATABASE_URL=postgres://username:password@host:port/database?sslmode=require

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fleet-fusion.vercel.app
```

## Deployment Steps

### Manual Deployment via Vercel Dashboard

1. **Connect Repository**:

   - Link your GitHub repository to Vercel
   - Select the main branch for production deployment

2. **Configure Project**:

   - Set the framework preset to Next.js
   - Set the root directory (if not in the repository root)
   - Set the build command to `next build`
   - Set the output directory to `.next`

3. **Environment Variables**:

   - Add all required environment variables in Vercel's project settings

4. **Deploy**:
   - Click "Deploy" and wait for the build to finish

### Automated Deployment via GitHub Actions

We've set up a CI/CD pipeline that will:

1. Run lint and type checks
2. Run tests
3. Deploy to production when changes are pushed to the main branch

Requirements for automated deployment:

1. Add these secrets to your GitHub repository:

   - `VERCEL_TOKEN` - A Vercel personal access token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - The Vercel project ID for FleetFusion
   - `VERCEL_TEAM_ID` - If applicable, your Vercel team ID

2. Ensure main branch is protected and requires passing checks before merging

## Post-Deployment Verification

After deploying, perform these checks:

1. **Functionality Test**:

   - Verify authentication flows work correctly
   - Check core features like dispatch, fleet management, and analytics
   - Test role-based access controls

2. **Performance Check**:

   - Run Lighthouse audits for performance, accessibility, and SEO
   - Check Vercel Analytics for any performance bottlenecks

3. **Security Verification**:

   - Verify security headers are properly set
   - Run a security scanner like OWASP ZAP
   - Check Cross-Origin restrictions are properly enforced

4. **Error Monitoring**:
   - Verify Sentry is capturing errors correctly
   - Check test errors are reported in the Sentry dashboard

---

### Backend Modernization Verification (Critical)

- **Error Handling:**

  - All server actions and database operations must return standardized `ApiResult<T>` objects for both success and error cases.
  - Errors must be logged with clear, contextual messages (see `[Feature]Actions` files for patterns).
  - Test error scenarios (invalid input, DB failures) and confirm errors are surfaced in the UI and Sentry.

- **Database Transactions:**

  - All multi-table operations (e.g., company deletion) must use database transactions to ensure atomicity and data integrity.
  - Review and test that partial updates/deletes do not occur on failure (see `deleteCompany` in `company-actions.ts`).

- **Multi-Tenant Data Integrity:**

  - All major tables must use `onDelete: "cascade"` for FKs referencing `companyId` (see `db/schema.ts`).
  - Test that deleting a company or user cascades deletes to all related data, with no orphaned records.

- **API Consistency:**
  - All server actions must use the shared `ApiResult<T>` type from `types/api.ts`.
  - All error and success responses must be predictable and type-safe.

---

## Database Migration Considerations

When deploying database schema changes:

1. Back up the production database before major changes
2. Run migrations during low-traffic periods
3. Have a rollback plan for any schema changes

## Monitoring and Alerts

Set up the following monitoring:

1. **Uptime Monitoring**:

   - Configure an uptime service (e.g., UptimeRobot, Pingdom)
   - Set up alerts for any downtime

2. **Error Alerts**:

   - Configure Sentry to alert on critical errors
   - Set up thresholds for error frequency alerts

3. **Performance Monitoring**:
   - Use Vercel Analytics to monitor performance
   - Set up alerts for performance degradation

## Troubleshooting

### Common Issues

1. **Authentication Issues**:

   - Check Clerk configuration and environment variables
   - Verify webhook endpoints are correctly set up

2. **Database Connectivity**:

   - Check Neon database connection string
   - Verify IP allowlists are properly configured

3. **Server Errors**:
   - Check Sentry for detailed error information
   - Verify server-side logs in Vercel dashboard

## Rollback Procedures

If a deployment causes critical issues:

1. **Immediate Rollback**:

   - Use Vercel's rollback feature to revert to the previous deployment
   - OR deploy a specific prior commit via Git

2. **Database Rollback**:
   - If database migration caused issues, restore from backup
   - Apply necessary fixes and re-deploy

## Support Contacts

For urgent production issues:

- **DevOps**: your-devops-contact@fleetfusion.app
- **Backend Team**: backend-team@fleetfusion.app
- **Vercel Support**: https://vercel.com/support
