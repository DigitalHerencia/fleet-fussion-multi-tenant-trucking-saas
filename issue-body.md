### Summary
Clerk middleware dependencies and configuration require updates.

### Steps to Reproduce
1. Run `npm run build` – build fails because `@svgr/webpack` is missing.
2. Deploy serverless – session cache resets on each cold start.
3. Use Chart.js components – TS type errors appear.

### Expected Behaviour
- Build succeeds and caching persists across instances.

### Actual Behaviour
- Missing loader causes build failure; caching is ephemeral.

### Severity
High - Major feature broken

### Priority
Priority-High

### Target Milestone
Testing & Automation Hardening

### Environment
- Node.js 18
- Next.js 15.3.3
- @clerk/nextjs 6.20.0

### Recommended Fixes
- [ ] Add `@svgr/webpack` to `devDependencies`
- [ ] Replace in-memory `sessionCache` with a shared cache (e.g., Redis)
- [ ] Update `@types/chart.js` to v4 types
- [ ] Upgrade `@clerk/nextjs` to the latest compatible version
- [ ] Use `redirectToSignIn` helper from Clerk
- [ ] Enforce onboarding completion in middleware
- [ ] Implement a real rate limiter (e.g., `@upstash/ratelimit`)
- [ ] Add security headers such as `Strict-Transport-Security`

