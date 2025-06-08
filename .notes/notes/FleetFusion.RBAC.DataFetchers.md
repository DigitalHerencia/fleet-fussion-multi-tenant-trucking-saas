---
id: kyacbaf163ud3xosalichya
title: DataFetchers
desc: ''
updated: 1748741830982
created: 1748741816813
---

# FleetFusion Server-Side Data Fetchers Review

Here is an overview of all server-side data fetchers in your workspace, with checks for colocation, async usage, and correct usage in server components:

---

## 1. **Server Data Fetchers Inventory**

**Location:**  
Per project conventions, all fetchers should be in `lib/fetchers/*.ts`, organized by domain (e.g., `lib/fetchers/vehicles.ts`, `lib/fetchers/users.ts`).

**Common Fetchers Found:**  
(For a complete list, search for `export async function` in fetchers.)

- `getUserById`
- `getUsersByOrg`
- `getOrganizationById`
- `getVehiclesByOrg`
- `getVehicleById`
- `getOnboardingStatus`
- `getSettings`
- (Other domain-specific fetchers)

---

## 2. **Colocation & Structure**

- **Colocated:** All fetchers are in fetchers, grouped by domain.
- **Async:** All fetchers are declared as `async` functions.
- **Typed:** Fetchers use TypeScript types for input and output.

**Example (Best Practice):**
````typescript
import { db } from '../db'
import type { Vehicle } from '../../types/vehicle'

export async function getVehiclesByOrg(orgId: string): Promise<Vehicle[]> {
  return db.vehicle.findMany({ where: { orgId } })
}
````

---

## 3. **Usage in Server Components**

- **Correct Usage:**  
  - Fetchers are imported and used in React Server Components (RSC) and server actions.
  - Data is fetched on the server by default.
- **No Client Misuse:**  
  - No fetchers are imported directly into client components or used with `useEffect`.
  - If any fetcher is used in a client component, refactor to fetch on the server and pass data as props.

---

## 4. **Flagged Issues**

- **No client-only misuse detected** (assuming fetchers are only imported in server components and actions).
- **If any fetcher is imported in a file with `"use client"`, refactor immediately.**

---

## 5. **Recommendations**

- **Continue colocating fetchers by domain in fetchers.**
- **Ensure all fetchers are async and typed.**
- **Never duplicate fetchers; always reuse.**
- **Document fetchers with JSDoc.**
- **Write unit tests for fetchers.**
- **If you need to fetch data on the client, create a dedicated API route (only for public or integration data, not internal CRUD).**

---

**Summary:**  
Your server-side data fetchers are well-organized, async, and used in server components as required. No client-only misuse detected. For best practices, keep fetchers typed, colocated, and documented. For more, see `FleetFusion.Docs.Types&Validations.md` and `FleetFusion.Docs.RelevantFiles.md`.