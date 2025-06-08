# 🧠 Clerk + Multi-Tenant RBAC Prompts

Automate and maintain tenant-aware access control, DB sync, and auth session enforcement for a
production-grade Next.js 15 SaaS app.

---

## 🔐 Clerk Auth + RBAC Setup

### `Create Clerk RBAC scaffolding with custom org roles`

```prompt
@workspace generate TypeScript models and utility functions to support multi-tenant role-based access control using Clerk organizations. Include:

- `Role` enum with Owner, Admin, Manager, Driver
- Utility: `getUserRole(clerkUserId): Role`
- Custom session claim validator to attach `orgId` and `role` to server session
- Add Zod schema for validating Clerk webhooks
```

---

## 🏗️ Tenant Context Setup

### `Inject and validate orgId in all server actions`

```prompt
@workspace refactor all server actions to include `orgId` validation using Clerk session claims. Ensure access to tenant-specific DB data is scoped by `orgId`. Use a helper like `requireOrgContext()`.
```

### `Add middleware to guard tenant routes`

```prompt
@workspace add middleware.ts to protect /tenant/* routes. Use Clerk middleware to:
- Redirect unauthenticated users to /sign-in
- Block access to routes unless session claims include valid `orgId` and `role`
```

---

## 🧬 Prisma + Neon Integration

### `Generate Prisma schema with multitenancy support`

```prompt
@workspace update Prisma schema to include tenant-aware models with `orgId` foreign key. Add `@relation` directives and cascading rules. Models:
- UserProfile
- Driver
- Vehicle
- Dispatch
- ComplianceReport
```

### `Auto-generate DB sync from Clerk webhooks`

```prompt
@workspace scaffold webhook handler in /api/webhooks/user to handle Clerk user.created and org.created events. On event:

- Create matching UserProfile and Organization row in Neon
- Use Prisma to upsert based on `clerkUserId` or `clerkOrgId`
- Validate with Zod and log errors
```

---

## 🧪 Validation & Session Enforcement

### `Enforce schema on server actions using Zod`

```prompt
@workspace create Zod schemas for:
- `createDriver`
- `updateVehicle`
- `submitComplianceReport`

Use them in respective server actions and surface errors to the UI via typed response objects.
```

### `Type Clerk session claims across app`

```prompt
@workspace define `SessionUser` TypeScript interface with Clerk session claims (orgId, role). Update all server actions and middleware to use typed claims.
```

---

## 🧠 Audits & Maintenance

### `Audit: Missing orgId enforcement`

```prompt
@workspace audit all database queries for missing orgId constraints. Flag any queries where tenant scoping is missing or incorrect.
```

### `Audit: Role-based view rendering`

```prompt
@workspace list all frontend pages and components that check user role. Identify places where role is hardcoded or inconsistent with RBAC schema.
```

### `Audit: Clerk webhooks`

```prompt
@workspace verify all Clerk webhook endpoints are:
- Typed with Zod
- Using Clerk's signature verification
- Handling edge cases (e.g. deleted org, user removed)
```

---

## 🚦 CI/CD + Vercel

### `Add post-deploy migration step`

```prompt
@workspace configure Vercel build output and post-deploy hook to run `prisma migrate deploy` and reindex any org-specific search data
```

---

# 🧰 Appendix

- Clerk Docs: [https://clerk.com/docs](https://clerk.com/docs)
- Prisma Docs: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- Neon Docs: [https://neon.tech/docs](https://neon.tech/docs)
- Zod Docs: [https://zod.dev](https://zod.dev)
- RBAC Pattern (FGA-style): [https://github.com/openfga](https://github.com/openfga)

---

### 💡 Tip:

To use these prompts in VS Code:

1. Create `.vscode/copilot.prompts.md`
2. Paste the above into the file
3. Use Ask Mode + `@workspace` and paste individual prompts
4. Optional: Convert into snippets or tasks for automation

Would you like me to generate a companion `README.md` or UI for browsing and triggering these
prompts in your local devtools?
