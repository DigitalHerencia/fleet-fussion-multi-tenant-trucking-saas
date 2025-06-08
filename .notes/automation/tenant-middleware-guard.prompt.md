---
mode: 'ask'
---
@workspace add middleware.ts to protect /tenant/* routes. Use Clerk middleware to:
- Redirect unauthenticated users to /sign-in
- Block access to routes unless session claims include valid `orgId` and `role`
