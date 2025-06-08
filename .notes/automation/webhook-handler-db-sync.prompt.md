---
mode: 'ask'
---

@workspace scaffold webhook handler in /api/webhooks/user to handle Clerk user.created and
org.created events. On event:

- Create matching UserProfile and Organization row in Neon
- Use Prisma to upsert based on `clerkUserId` or `clerkOrgId`
- Validate with Zod and log errors
