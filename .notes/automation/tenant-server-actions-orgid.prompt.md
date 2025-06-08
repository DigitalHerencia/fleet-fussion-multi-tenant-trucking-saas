---
mode: 'ask'
---
@workspace refactor all server actions to include `orgId` validation using Clerk session claims. Ensure access to tenant-specific DB data is scoped by `orgId`. Use a helper like `requireOrgContext()`.
