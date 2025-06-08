---
id: qr1gpjuckq3pk3cw2nglqrx
title: ORM
desc: ''
updated: 1748450430064
created: 1748450012923
---

# Prisma ORM with PostgreSQL (Neon) for Next.js 15 (App Router), React 19, Server Actions, TypeScript 5

## Overview

This architecture uses [Prisma ORM](https://www.prisma.io/) with a [Neon](https://neon.tech/)
serverless PostgreSQL database, integrated into a [Next.js 15](https://nextjs.org/blog/next-15) App
Router project using [React 19](https://react.dev/),
[TypeScript 5](https://www.typescriptlang.org/), and deployed on [Vercel](https://vercel.com/).

## Key Features

- **Serverless PostgreSQL**: Neon provides scalable, serverless Postgres with branching and instant
  provisioning.
- **Prisma ORM**: Type-safe database access, migrations, and schema management.
- **Next.js 15 App Router**: Modern routing and server components.
- **React 19**: Latest React features.
- **Server Actions**: Mutate and fetch data securely on the server.
- **TypeScript 5**: Full type safety.
- **Vercel Deployment**: Optimized for serverless and edge environments.
- **Multi-tenant ABAC**: Attribute-based access control per tenant.
- **Clerk Webhook Handler**: Sync user/org data from Clerk using idempotent upsert requests.

---

## Database Connection

- Use the Neon PostgreSQL connection string in `DATABASE_URL` (Vercel environment variable).
- Prisma client is instantiated per request (or using a global singleton pattern for serverless).

```ts
// /lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Webhook Handler for Clerk Sync

- **Purpose**: Sync multi-tenant ABAC data (users, organizations, roles, permissions) from Clerk.
- **Implementation**:
  - Expose a serverless API route (e.g., `/api/webhooks/clerk`).
  - Parse Clerk webhook payloads.
  - Use Prisma `upsert` for idempotent writes (ensures no duplicates, safe for retries).
  - Associate data with tenant/org IDs for multi-tenancy.

```ts
// /app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  // Example: Upsert user
  await prisma.user.upsert({
    where: { clerkId: payload.id },
    update: { ...payload },
    create: { ...payload },
  });
  // ...handle orgs, roles, etc.
  return NextResponse.json({ ok: true });
}
```

---

## Multi-Tenant ABAC

- Each table (e.g., `User`, `Organization`, `Role`) includes a `orgId` column.
- All queries and mutations are scoped by tenant/org.
- ABAC logic is enforced in server actions and API routes.

---

## Server Actions: Fetches & Mutations

- **Server Actions**: Use Next.js server actions for all DB mutations and fetches.
- **Domain Separation**: Organize actions by domain (e.g., `/app/actions/user.ts`,
  `/app/actions/org.ts`).
- **Type Safety**: All actions are typed with TypeScript.

```ts
// /app/actions/user.ts
'use server';
import { prisma } from '@/lib/prisma';

export async function getUserById(id: string, tenantId: string) {
  return prisma.user.findUnique({
    where: { id, tenantId },
  });
}

export async function updateUser(id: string, data: any, tenantId: string) {
  return prisma.user.update({
    where: { id, tenantId },
    data,
  });
}
```

---

## Deployment Notes

- Set `DATABASE_URL` in Vercel project settings.
- Use [Prisma Data Proxy](https://www.prisma.io/docs/data-platform/data-proxy) or Neon connection
  pooling for serverless environments.
- Use [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate) for schema changes.

---

## References

- [Prisma Docs](https://www.prisma.io/docs/)
- [Neon Docs](https://neon.tech/docs/introduction)
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)
- [Clerk Webhooks](https://clerk.com/docs/reference/webhooks)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions/introduction)
