# Clerk Authentication Configuration Guide

This document provides a comprehensive guide on how to configure Clerk authentication for the FleetFusion application in both development and production environments.

## Environment Configuration

### Development Environment (.env.local)

When developing locally, especially with ngrok tunneling:

1. **Update the ngrok URL** in `.env.local`:
   ```
   NEXT_PUBLIC_APP_URL=https://your-subdomain.ngrok-free.app
   # Update all NEXT_PUBLIC_CLERK_* URLs to use the same ngrok domain
   ```

2. **Configure Clerk Dashboard for Development**:
   - Add your ngrok domain to the allowed domains in Clerk Dashboard
   - Configure the webhook endpoint to: `https://your-subdomain.ngrok-free.app/api/clerk/webhook-handler`
   - Make sure the webhook is active and has the correct CLERK_WEBHOOK_SECRET

### Production Environment (.env.production)

For production deployment:

1. **Use your production domain**:
   ```
   NEXT_PUBLIC_APP_URL=https://fleet-fusion.vercel.app
   # All NEXT_PUBLIC_CLERK_* URLs should use the production domain
   ```

2. **Configure Clerk Dashboard for Production**:
   - Add your production domain to the allowed domains in Clerk Dashboard
   - Configure the webhook endpoint to: `https://fleet-fusion.vercel.app/api/clerk/webhook-handler`

## Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public API key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Private API key | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | Secret for webhook verification | `whsec_...` |
| `NEXT_PUBLIC_APP_URL` | Base URL of your application | `https://your-domain.com` |

## Authentication Flow Configuration

The middleware.ts file controls the authentication flow:

1. **Public Routes**: Accessible without authentication
2. **Protected Routes**: Require authentication
3. **Onboarding Flow**: Redirects new users to complete onboarding
4. **Admin Routes**: Restricted to users with admin role

## Cookie and Domain Configuration

### For ngrok tunneling in development:

In `app/layout.tsx`, we use special configuration:
```typescript
// In development with ngrok tunneling
cookieDomain: isDevelopment ? '.ngrok-free.app' : undefined,
```

This allows cookies to work correctly with ngrok subdomains.

### For production:

```typescript
// In production
domain: new URL(prodDomain).host,
```

## Webhook Handler

The webhook handler in `app/api/clerk/webhook-handler/route.ts` processes Clerk events:

1. Verifies the webhook signature using CLERK_WEBHOOK_SECRET
2. Processes organization and user events
3. Updates the database accordingly

## Troubleshooting

### Redirect Loops

If experiencing redirect loops:
1. Check that `sessionClaims.onboardingComplete` is correctly set after onboarding
2. Verify the middleware conditional logic
3. Clear browser cookies and session storage

### Webhook Issues

If webhooks aren't working:
1. Verify the webhook endpoint is correctly configured in Clerk Dashboard
2. Check that CLERK_WEBHOOK_SECRET matches between Clerk Dashboard and .env
3. Ensure the webhook route is properly handling the secret

### Cookie Issues with ngrok

If authentication isn't persisting with ngrok:
1. Make sure cookieDomain is set to '.ngrok-free.app'
2. Verify your ngrok tunnel is using the same subdomain
3. Check that all redirect URLs use the same ngrok domain
