# Playwright Test Setup for FleetFusion

## Prerequisites
- `npm run dev` (backend on http://localhost:3000)
- Ngrok endpoint for Clerk webhooks:
  ```
  ngrok http --domain=liberal-gull-quietly.ngrok-free.app 3000
  ```
- Playwright browsers installed (`npx playwright install`)

## Running Tests

1. Start the backend:
   ```
   npm run dev
   ```
2. Start ngrok for webhook endpoint:
   ```
   ngrok http --domain=liberal-gull-quietly.ngrok-free.app 3000
   ```
3. In a new terminal, run Playwright tests:
   ```
   npx playwright test
   ```

## Test Coverage
- Auth: sign-in, sign-up, sign-out, forgot password
- Onboarding: onboarding wizard
- Clerk/Neon: webhook handler and data sync

## Notes
- Ensure test users exist or are seeded for flows.
- Webhook tests use a mock payload and signature.
- Adjust selectors in `tests/auth-onboarding-webhook.spec.ts` if UI changes.
