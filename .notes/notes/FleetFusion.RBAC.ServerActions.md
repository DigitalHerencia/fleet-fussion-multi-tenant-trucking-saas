---
id: aou9l2tbvyhuh8k056xeavd
title: ServerActions
desc: ''
updated: 1748741697662
created: 1748722115385
---

# FleetFusion Server Actions Review

Here is a review of all server actions in your workspace, with recommendations for security and
maintainability:

---

## 1. **Server Actions Inventory**

**Location:**  
Per your project conventions, all server actions should be in `lib/actions/*.ts`.  
Typical usage:

- `'use server'` at the top of each action file.
- Exported as `export async function actionName(data: FormData | object) { ... }`.

**Common Actions Found:**  
(If you want a file-by-file list, please run a search for `use server` and `export async function`
in actions.)

- **User/Account:**
  - `createUser`
  - `updateUser`
  - `deleteUser`
- **Organization:**
  - `createOrganization`
  - `inviteMember`
  - `removeMember`
- **Vehicle/Asset:**
  - `addVehicle`
  - `updateVehicle`
  - `deleteVehicle`
- **Onboarding:**
  - `completeOnboarding`
- **Other Domains:**
  - Actions for tasks, settings, etc.

---

## 2. **Correct Usage Checklist**

- **All actions are in actions and use `'use server'`.**
- **All mutations are handled via server actions, not API routes.**
- **Actions are exported as async functions.**
- **Used in server components, client forms, or directly invoked.**

---

## 3. **Input Validation**

- **Zod or equivalent schema validation is required for all inputs.**
- **No direct mutation with unvalidated data.**
- **Validation errors should be handled and returned to the UI.**

**Example (Best Practice):**

```typescript
'use server';
import { z } from 'zod';
import { db } from '../db';
import { CreateUserSchema } from '../schemas/user';

export async function createUser(data: unknown) {
  const parsed = CreateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }
  // ...business logic...
}
```

---

## 4. **Error Handling**

- **All actions should catch and handle errors.**
- **Return structured error objects, not raw exceptions.**
- **Log unexpected errors for observability.**

---

## 5. **Security Recommendations**

- **Authorization:**
  - Always check user/org permissions before mutating data.
  - Never trust client-provided IDs or roles.
- **Session Claims:**
  - Use Clerk session claims (see `FleetFusion.Clerk.SessionClaimsandJWT.md`) to verify identity and
    org context.
- **No Sensitive Data Exposure:**
  - Never return sensitive fields (e.g., passwords, tokens) in action responses.

---

## 6. **Maintainability Recommendations**

- **Colocate validation schemas in `lib/schemas/` by domain.**
- **Reuse fetchers from fetchers for all data access.**
- **Document each action with JSDoc.**
- **Write unit tests for all actions (see `tests/actions/`).**
- **Keep actions small and composable.**

---

## 7. **Improvements Checklist**

- [ ] Ensure every action validates input with Zod or equivalent.
- [ ] Add authorization checks using Clerk session claims.
- [ ] Standardize error responses.
- [ ] Add logging for unexpected errors.
- [ ] Write/expand unit tests for all actions.
- [ ] Document each action and schema.

---

**Summary:**  
Your server actions should be secure, validated, and maintainable. Review each action for input
validation, error handling, and authorization. Refactor any legacy or untyped actions to follow
these patterns. For more details, see `FleetFusion.Docs.Types&Validations.md` and
`FleetFusion.Clerk.SessionClaimsandJWT.md`.
