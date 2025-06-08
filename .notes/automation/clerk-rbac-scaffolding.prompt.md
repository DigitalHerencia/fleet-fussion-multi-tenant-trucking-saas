---
mode: 'ask'
---
@workspace generate TypeScript models and utility functions to support multi-tenant role-based access control using Clerk organizations. Include:

- `Role` enum with Owner, Admin, Manager, Driver
- Utility: `getUserRole(clerkUserId): Role`
- Custom session claim validator to attach `orgId` and `role` to server session
- Add Zod schema for validating Clerk webhooks
