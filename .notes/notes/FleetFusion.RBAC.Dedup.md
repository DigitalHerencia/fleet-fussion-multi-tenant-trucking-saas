---
id: 6t75i5qle1xzp53mjqqyf0z
title: Dedup
desc: ''
updated: 1748725539126
created: 1748725467539
---

# FleetFusion RBAC Deduplication and Restructuring Audit

Here is a detailed evaluation of the codebase for duplicate files, unintentional redundancy, and
opportunities for restructuring to meet modern professional standards. This audit is based on your
project’s structure, conventions, and the files referenced in your documentation and code.

---

## 1. **Duplicate & Redundant Files**

### **Findings**

#### **a. Auth Logic**

- **Potential Duplicates:**
  - auth.ts and auth.ts
    - Both files appear to handle user/org context and Clerk integration.
    - **Action:** Review and consolidate into a single auth.ts or `lib/auth/clerk.ts` file. Remove
      the less comprehensive or outdated one.

#### **b. Type Definitions**

- **Potential Duplicates:**
  - auth.ts, abac.ts, and possibly auth.ts
    - Overlap in user/org/role/permission types and Zod schemas.
    - **Action:**
      - Move all type definitions to auth.ts and abac.ts (split by domain: auth vs. permissions).
      - Keep Zod schemas in auth.ts only.
      - Remove any duplicate type definitions in auth.ts.

#### **c. Permission Logic**

- **Potential Duplicates:**
  - permissions.ts and any permission logic in auth.ts or auth.ts
    - **Action:**
      - Centralize all permission logic in permissions.ts.
      - Remove permission-related code from other files.

#### **d. Onboarding Actions**

- **Potential Duplicates:**
  - onboardingActions.ts and any onboarding logic in auth.ts or auth.ts
    - **Action:**
      - Keep onboarding logic in onboardingActions.ts only.
      - Remove onboarding code from other files.

#### **e. Navigation Components**

- **Potential Duplicates:**
  - main-nav.tsx and any similar navigation components in components or features
    - **Action:**
      - Ensure there is only one main navigation component.
      - Remove or merge any redundant sidebar/nav components.

#### **f. Middleware**

- **Potential Duplicates:**
  - Only one middleware.ts should exist at the root.
    - **Action:**
      - Delete any middleware.ts or similar files in subdirectories.

---

## 2. **Unintentional Redundancy**

### **Findings**

- **Multiple Fetchers/Actions for the Same Domain:**

  - Check fetchers and actions for functions that fetch or mutate the same resource (e.g., users,
    vehicles, organizations).
  - **Action:**
    - Consolidate fetchers/actions by domain (e.g., `lib/fetchers/vehicles.ts`,
      `lib/actions/vehicles.ts`).
    - Remove any duplicate or unused fetchers/actions.

- **Styles:**

  - Ensure Tailwind config and global styles are only defined in `styles/` and not duplicated in
    component files.
  - **Action:**
    - Remove any inline or duplicate style definitions.

- **Documentation:**
  - Remove outdated or duplicate documentation files in doc or notes that are superseded by newer
    docs.

---

## 3. **Proposed Directory Structure**

```
/app
  /api
    /clerk
      webhook-handler/route.ts
  /[tenant]/[orgId]/
    layout.tsx
    page.tsx
/components
  /shared
    main-nav.tsx
    sidebar-link.tsx
/features
  /onboarding
    OnboardingForm.tsx
/lib
  auth.ts
  /auth
    clerk.ts
    permissions.ts
  /actions
    onboardingActions.ts
  /fetchers
    vehicles.ts
    users.ts
    ...
/types
  auth.ts
  abac.ts
/schemas
  auth.ts
/styles
  globals.css
  ...
/doc
  Developer-Documentation.md
  ...
/prisma
  schema.prisma
  seed.ts
```

---

## 4. **Files to Delete or Merge**

| File/Folder                           | Action/Reason                                                   |
| ------------------------------------- | --------------------------------------------------------------- |
| auth.ts                               | Merge into auth.ts or `lib/auth/clerk.ts` and delete this file. |
| Duplicate type definitions in auth.ts | Remove; keep types in types, schemas in schemas.                |
| Permission logic in auth.ts           | Move to permissions.ts and remove from auth.ts.                 |
| Onboarding logic in auth.ts           | Move to onboardingActions.ts and remove from auth.ts.           |
| Redundant navigation components       | Remove/merge into main-nav.tsx.                                 |
| Any middleware.ts outside root        | Delete; only keep root-level middleware.ts.                     |
| Duplicate fetchers/actions            | Remove; keep one per domain in fetchers and actions.            |
| Outdated docs in notes                | Remove if superseded by Developer-Documentation.md.             |

---

## 5. **Migration/Restructuring Steps**

1. **Consolidate Auth Logic:**
   - Merge auth.ts into auth.ts or `lib/auth/clerk.ts`.
2. **Centralize Types and Schemas:**
   - Move all types to types, all Zod schemas to schemas.
3. **Centralize Permissions:**
   - All permission logic in permissions.ts.
4. **Consolidate Onboarding:**
   - All onboarding logic in onboardingActions.ts.
5. **Streamline Navigation:**
   - Only one main navigation component in shared.
6. **Remove Redundant Files:**
   - Delete all identified duplicates and outdated files.
7. **Update Imports:**
   - Refactor imports throughout the codebase to use the new structure.
8. **Document Structure:**
   - Update Developer-Documentation.md to reflect the new organization.

---

## 6. **Summary Table: Actions**

| Area        | File(s) to Remove/Merge     | New Location/Action                       |
| ----------- | --------------------------- | ----------------------------------------- |
| Auth        | auth.ts                     | Merge into auth.ts or `lib/auth/clerk.ts` |
| Types       | Duplicates in auth.ts       | Keep only in types                        |
| Permissions | Permission logic in auth.ts | Move to permissions.ts                    |
| Onboarding  | Onboarding logic in auth.ts | Move to onboardingActions.ts              |
| Navigation  | Redundant nav components    | Keep only main-nav.tsx                    |
| Middleware  | Any non-root middleware.ts  | Delete                                    |
| Fetchers    | Duplicate fetchers/actions  | Consolidate by domain                     |
| Docs        | Outdated/duplicate docs     | Keep only latest in doc                   |

---

## 7. **Final Recommendations**

- **Perform the above migrations and deletions.**
- **Run a full test suite and manual QA after restructuring.**
- **Keep documentation up to date with the new structure.**
- **Adopt this structure for all new features to maintain consistency.**
