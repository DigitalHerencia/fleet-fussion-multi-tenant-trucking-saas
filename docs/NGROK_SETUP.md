# Using ngrok for Development with FleetFusion

This guide explains how to set up and use ngrok tunneling for local development, which is especially useful for testing authentication and webhooks that require a public URL.

## Why Use ngrok?

1. **Test Authentication Flows**: Some authentication providers (like Clerk) require a public URL for callbacks and redirects.
2. **Receive Webhooks Locally**: Allows external services to send webhooks to your local development environment.
3. **Testing on Multiple Devices**: Access your local development server from any device.

## Setup Instructions

### 1. Install ngrok

```bash
npm install -g ngrok
# or
yarn global add ngrok
```

Alternatively, download it from [ngrok.com](https://ngrok.com/download).

### 2. Create an ngrok Account

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your auth token from your dashboard
3. Configure ngrok with your token:

```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

### 3. Start Your Next.js Development Server

```bash
npm run dev
# or
yarn dev
```

### 4. Start ngrok Tunnel

```bash
# Use a consistent subdomain (requires paid plan or custom domain)
ngrok http 3000 --subdomain your-fleet-fusion-subdomain

# Or for free tier:
ngrok http 3000
```

### 5. Update Your Environment Variables

Update your `.env.local` file with the ngrok URL:

```
NEXT_PUBLIC_APP_URL=https://your-subdomain.ngrok-free.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://your-subdomain.ngrok-free.app/sign-in
# Update all other URLs similarly
```

### 6. Configure Clerk Dashboard

1. Go to [clerk.com](https://dashboard.clerk.com/)
2. Navigate to your application settings
3. Add your ngrok domain to allowed domains
4. Update webhook endpoints to use your ngrok URL
5. Make sure redirects are configured correctly

## Best Practices

1. **Use a Consistent Subdomain**: This ensures cookies and domains work consistently (requires paid ngrok plan)
2. **Update All Environment Variables**: Make sure all URLs in your environment variables use the same ngrok domain
3. **Clear Browser Cookies**: After changing domains, clear browser cookies to avoid authentication issues
4. **Monitor ngrok Traffic**: Use the ngrok web interface at http://127.0.0.1:4040 to inspect traffic

## Troubleshooting

### Common Issues:

1. **Redirect Loops**:
   - Clear browser cookies and local storage
   - Ensure all environment variables are updated
   - Check that Clerk dashboard has the correct domain settings

2. **Cookie Issues**:
   - Make sure `cookieDomain` is set to `.ngrok-free.app` in the Clerk configuration
   - Try using a consistent subdomain with ngrok

3. **Webhook Failures**:
   - Verify webhook URL in Clerk dashboard
   - Check webhook signature secret matches
   - Use ngrok inspector to see if webhooks are arriving
