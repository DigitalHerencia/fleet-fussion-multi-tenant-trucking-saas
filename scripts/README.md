# FleetFusion Utility Scripts

This directory contains utility scripts for the FleetFusion application.

## Available Scripts

### env-switcher.js

A utility for easily switching between development environments. It helps you configure your application for different environments:

- Local development (localhost:3000)
- ngrok tunneling for testing with public URLs

#### Usage

```bash
# Run the environment switcher
npm run env:switch

# Or directly with Node.js
node scripts/env-switcher.js
```

This interactive script will guide you through:
1. Choosing your environment type
2. Setting up the appropriate configuration
3. Preserving your existing environment variables

When switching to ngrok mode, you'll need to provide your ngrok subdomain, which will be used to update all URLs in the environment variables.

#### Why Use This?

This script is particularly useful when:

- Testing authentication flows that require public URLs
- Working with webhooks that need to reach your local environment
- Switching between development setups frequently

Remember to also update your Clerk Dashboard settings when changing environments.

## Other Scripts

Additional utility scripts will be documented here as they're added.
