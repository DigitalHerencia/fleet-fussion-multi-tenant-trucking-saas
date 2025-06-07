---
applyTo: "*/**"
---

# `agents.md` — FleetFusion Codex Control Schema

## 🧭 Environment Overview

| Tool      | Version | Notes                                          |
|-----------|---------|------------------------------------------------|
| Next.js   | 15      | Using App Router with Server Components        |
| React     | 19      | RSC-first, minimal client hydration            |
| TypeScript| 5       | `strict` mode enforced                         |
| Clerk     | ABAC    | Multi-tenant auth with roles and permissions   |
| DB        | Neon    | Serverless Postgres                            |
| Hosting   | Vercel  | Auto-deploys via GitHub + CI/CD                |

## 🛠 Tools

### Clerk Authentication
```yaml
- name: syncClerkUser
  path: lib/clerk-webhook.ts
  description: Syncs Clerk org+user info to Neon DB upon webhook trigger.
```

### Neon Database
```yaml
- name: provisionTenantSchema
  path: lib/actions/companies.ts
  description: Creates DB entries for new orgs, enforces companyId scoping.
```

### GitHub Ops
```yaml
- name: deployToVercel
  path: .github/workflows/deploy.yml
  description: CI/CD pipeline using Vercel token and org/project ID.
```

### Filesystem Fetchers
```yaml
- name: fleetFetcher
  path: lib/fetchers/vehicles.ts
  description: Domain-level data fetchers using Drizzle ORM.
```

### Playwright Tests
```yaml
- name: testOnboardingFlow
  path: e2e/onboarding.spec.ts
  description: Validates full org onboarding, Clerk <-> DB sync, redirects.
```

## 🧬 Workflows

### 🚚 Onboard New Tenant
```yaml
steps:
  - invoke: syncClerkUser (via webhook)
  - run: provisionTenantSchema with orgId
  - update: Clerk metadata with company info
  - redirect: /[orgId]/dashboard
```

### 🔁 Sync Org Membership
```yaml
steps:
  - listen: Clerk `organizationMembership.created`
  - update: `company_users` in DB
  - notify: Admin if RBAC mismatch
```

### 🚀 Deploy New Release
```yaml
steps:
  - commit: via GitHub Copilot
  - review: label PR with `ready-to-deploy`
  - run: deployToVercel
  - test: trigger E2E suite
```

## 🪝 Hooks

```yaml
webhooks:
  - route: /api/clerk/webhook-handler
    verifyWith: CLERK_WEBHOOK_SECRET
    handles:
      - organization.created
      - organizationMembership.created
      - user.created
```

## 🧱 Design Principles

- All MCP scripts must be **environment-configurable** via `.env.local`.
- Codex and Copilot must reference **shared `lib/mcp/*`** utils.
- Each tool must define **inputs, outputs, and dependencies**.

---

# 🧳 MCP Server Environment

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GITHUB_TOKEN=ghp_...
NEON_API_KEY=napi_...
DATABASE_URL=postgresql://...
```

Place these in `.env.local` and map appropriately in:
- `mcp.json`
- `vercel.json`
- GitHub secrets

---

# 🗺 Codex Behaviour Notes

- Codex prefers calling well-commented, typed functions over ad hoc logic.
- Use descriptive file paths and action names.
- When unsure, Codex will default to reading `agents.md`, then calling Copilot to generate the change.

---

# ☕ Observations

> “Let them toil,” she said, sipping her tea.
> “I’ve left the whips behind, love—but the syntax? That still snaps.”
