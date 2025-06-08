---
id: kl7h4td9dmkfgklc8z1u6wp
title: Refactor
desc: ''
updated: 1748634860115
created: 1748632331181
---

# FleetFusion Refactor Implementation Plan

## Gap Analysis: Current vs. Target Structure

### File Naming Conventions

- **Inconsistency Found**: The current codebase mixes kebab-case (`driver-actions.ts`) and camelCase
  (`driverActions.ts`) file naming
- **Target Standard**: CodeFuture standardizes on camelCase for all files

### Duplicate Action Files

| Current Duplicates                               | Target Consolidated File |
| ------------------------------------------------ | ------------------------ |
| `driver-actions.ts` + `driverActions.ts`         | `driverActions.ts`       |
| `dispatch-actions.ts` + `dispatchActions.ts`     | `dispatchActions.ts`     |
| `ifta-actions.ts` + `iftaActions.ts`             | `iftaActions.ts`         |
| `onboarding-actions.ts` + `onboardingActions.ts` | `onboardingActions.ts`   |
| `settings-actions.ts` + `settingsActions.ts`     | `settingsActions.ts`     |
| `vehicles-actions.ts` + `vehicleActions.ts`      | `vehicleActions.ts`      |

### Duplicate Fetcher Files

| Current Duplicates                 | Target Consolidated File          |
| ---------------------------------- | --------------------------------- |
| Multiple overlapping fetcher files | Single source of truth per domain |

### New Files to Add

- `lib/actions/auditActions.ts` - Centralized audit logging implementation
- `lib/auth.ts` - Root-level auth utilities (moved from subfolder)
- `lib/db.ts` - Direct database accessor (moved from subfolder)
- `schemas/compliance.ts` - New schema directory for validation schemas
- `types/prisma.d.ts` - Type declarations for Prisma models

### Directory Structure Changes

- auth.ts → `lib/auth.ts` (simplified path)
- index.ts → `lib/db.ts` (simplified path)
- Multiple validation files should move to `schemas/` directory

### Code Consolidation Needed

- Merge duplicate action implementations while preserving functionality
- Standardize error handling patterns across action files
- Normalize function naming conventions (e.g., `create*Action` vs `create*`)

---

## Refactor Task List

### 1. Normalize File Structure

- [ ] Create new directory `schemas/` at project root
- [ ] Move validations content to `schemas/` where appropriate
- [ ] Flatten auth utilities by moving auth.ts to `lib/auth.ts`
- [ ] Flatten database utilities by moving index.ts to `lib/db.ts`

### 2. Action File Consolidation

- [ ] Merge driver-actions.ts into driverActions.ts

  - Preserve all functionality and exports
  - Update imports where `driver-actions` is referenced
  - Delete `driver-actions.ts` after successful merge

- [ ] Merge dispatch-actions.ts into dispatchActions.ts

  - Preserve all functionality and exports
  - Update imports where `dispatch-actions` is referenced
  - Delete `dispatch-actions.ts` after successful merge

- [ ] Merge ifta-actions.ts into iftaActions.ts

  - Preserve all functionality and exports
  - Update imports where `ifta-actions` is referenced
  - Delete `ifta-actions.ts` after successful merge

- [ ] Merge onboarding-actions.ts into onboardingActions.ts

  - Preserve all functionality and exports
  - Update imports where `onboarding-actions` is referenced
  - Delete `onboarding-actions.ts` after successful merge

- [ ] Merge settings-actions.ts into settingsActions.ts

  - Preserve all functionality and exports
  - Update imports where `settings-actions` is referenced
  - Delete `settings-actions.ts` after successful merge

- [ ] Merge vehicles-actions.ts into vehicleActions.ts
  - Preserve all functionality and exports
  - Update imports where `vehicles-actions` is referenced
  - Delete `vehicles-actions.ts` after successful merge

### 3. Create New Files

- [ ] Create `lib/actions/auditActions.ts` for centralized audit logging
- [ ] Create `types/prisma.d.ts` for Prisma type declarations
- [ ] Create `schemas/compliance.ts` for compliance validation schemas

### 4. Fetcher Consolidation

- [ ] Review and merge duplicated functionality in fetcher files
- [ ] Standardize naming conventions across all fetcher files
- [ ] Update import references throughout the codebase

### 5. Import Path Updates

- [ ] Update all imports referencing `lib/auth/auth` to auth
- [ ] Update all imports referencing database to `lib/db`
- [ ] Update all imports referencing action files that were consolidated
- [ ] Update all imports referencing fetcher files that were consolidated

### 6. Type Definitions

- [ ] Ensure type consistency across consolidated files
- [ ] Review and normalize error return types across action files
- [ ] Move type definitions from validations to types directory where appropriate

### 7. Code Styling

- [ ] Standardize all function naming conventions
- [ ] Standardize all error handling patterns
- [ ] Ensure consistent use of async/await throughout action files

---

## Map Current to Future Files

### Core Library Files

| Current Path   | Target Path    | Action         |
| -------------- | -------------- | -------------- |
| auth.ts        | `lib/auth.ts`  | Move & flatten |
| permissions.ts | permissions.ts | Keep as-is     |
| index.ts       | `lib/db.ts`    | Move & rename  |
| auth-cache.ts  | auth-cache.ts  | Keep as-is     |
| rate-limit.ts  | rate-limit.ts  | Keep as-is     |
| utils.ts       | utils.ts       | Keep as-is     |

### Action Files

| Current Path                                 | Target Path                   | Action                           |
| -------------------------------------------- | ----------------------------- | -------------------------------- |
| driver-actions.ts + driverActions.ts         | driverActions.ts              | Merge & keep camelCase version   |
| dispatch-actions.ts + dispatchActions.ts     | dispatchActions.ts            | Merge & keep camelCase version   |
| ifta-actions.ts + iftaActions.ts             | iftaActions.ts                | Merge & keep camelCase version   |
| onboarding-actions.ts + onboardingActions.ts | onboardingActions.ts          | Merge & keep camelCase version   |
| settings-actions.ts + settingsActions.ts     | settingsActions.ts            | Merge & keep camelCase version   |
| vehicles-actions.ts + vehicleActions.ts      | vehicleActions.ts             | Merge & keep camelCase version   |
| admin-actions.ts                             | admin-actions.ts              | Rename to `adminActions.ts`      |
| analytics-actions.ts                         | analytics-actions.ts          | Rename to `analyticsActions.ts`  |
| compliance-actions.ts + complianceActions.ts | complianceActions.ts          | Merge & keep camelCase version   |
| dashboard-actions.ts                         | dashboard-actions.ts          | Rename to `dashboardActions.ts`  |
| invitation-actions.ts                        | invitation-actions.ts         | Rename to `invitationActions.ts` |
| load-actions.ts                              | load-actions.ts               | Rename to `loadActions.ts`       |
| N/A                                          | `lib/actions/auditActions.ts` | Create new file                  |

### Fetcher Files

| Current Path          | Target Path           | Action                                   |
| --------------------- | --------------------- | ---------------------------------------- |
| analyticsFetchers.ts  | analyticsFetchers.ts  | Keep as-is                               |
| complianceFetchers.ts | complianceFetchers.ts | Keep as-is                               |
| dispatchFetchers.ts   | dispatchFetchers.ts   | Keep as-is                               |
| driverFetchers.ts     | driverFetchers.ts     | Keep as-is                               |
| fetchers.ts           | fetchers.ts           | Review & potentially remove if redundant |
| iftaFetchers.ts       | iftaFetchers.ts       | Keep as-is                               |
| onboardingFetchers.ts | onboardingFetchers.ts | Keep as-is                               |
| settingsFetchers.ts   | settingsFetchers.ts   | Keep as-is                               |
| userFetchers.ts       | userFetchers.ts       | Keep as-is                               |
| vehicleFetchers.ts    | vehicleFetchers.ts    | Keep as-is                               |

### Type Files

| Current Path  | Target Path         | Action          |
| ------------- | ------------------- | --------------- |
| abac.ts       | abac.ts             | Keep as-is      |
| analytics.ts  | analytics.ts        | Keep as-is      |
| api.ts        | api.ts              | Keep as-is      |
| auth.ts       | auth.ts             | Keep as-is      |
| compliance.ts | compliance.ts       | Keep as-is      |
| dispatch.ts   | dispatch.ts         | Keep as-is      |
| drivers.ts    | drivers.ts          | Keep as-is      |
| globals.d.ts  | globals.d.ts        | Keep as-is      |
| ifta.ts       | ifta.ts             | Keep as-is      |
| index.ts      | index.ts            | Keep as-is      |
| onboarding.ts | onboarding.ts       | Keep as-is      |
| settings.ts   | settings.ts         | Keep as-is      |
| vehicles.ts   | vehicles.ts         | Keep as-is      |
| webhooks.ts   | webhooks.ts         | Keep as-is      |
| N/A           | `types/prisma.d.ts` | Create new file |

### Validation Files

| Current Path       | Target Path             | Action                                        |
| ------------------ | ----------------------- | --------------------------------------------- |
| `validations/*.ts` | `schemas/*.ts`          | Move to new directory & review for redundancy |
| N/A                | `schemas/compliance.ts` | Create new file                               |
