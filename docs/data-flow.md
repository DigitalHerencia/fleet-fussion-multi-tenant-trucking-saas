# Data Flow & State Management in FleetFusion

This document explains the data flow and state management patterns used in FleetFusion.

## Overview

FleetFusion uses a modern Next.js 15 and React 19 architecture with:

1. Server Components for data fetching
2. Server Actions for mutations
3. React Context for shared state
4. Client-side state hooks for UI interactions

## Data Flow Architecture

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│ Server Component◄─────┤ lib/fetchers   ◄─────┤   Database    │
│                │     │                │     │                │
└───────┬────────┘     └────────────────┘     └────────────────┘
        │                                             ▲
        │ Props                                       │
        ▼                                             │
┌────────────────┐     ┌────────────────┐     ┌──────┴─────────┐
│                │     │                │     │                │
│ Client Component─────►   Server Action─────►     Mutation    │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

## Server-First Data Fetching

1. Server Components fetch data directly via `lib/fetchers/*.ts` functions
2. Data is passed as props to Client Components that need interactivity
3. No client-side fetching via useEffect or SWR

Example:

```tsx
// Server Component (e.g., app/vehicles/page.tsx)
export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return <VehiclesClient vehicles={vehicles} />;
}

// Client Component (e.g., components/vehicles/vehicles-client.tsx)
("use client");
export function VehiclesClient({ vehicles }) {
  // Client-side interactivity, but no data fetching
}
```

## State Management Patterns

### 1. Global Application State

For global state that is needed across multiple routes:

- **AuthContext**: User authentication state
- **CompanyContext**: Current company and company selection
- **ToastContext**: Application notifications

Example usage:

```tsx
"use client";
import { useAuth } from "@/context/auth-context";
import { useCompany } from "@/context/company-context";

export function MyComponent() {
  const { user } = useAuth();
  const { company } = useCompany();
  // ...
}
```

### 2. Server Actions for Mutations

For data mutations (create, update, delete):

1. Define server actions in `lib/actions/*.ts` files
2. Import and use them directly in client components
3. Use `useOptimistic` for immediate UI feedback

Example:

```tsx
"use client";
import { updateVehicle } from "@/lib/actions/vehicles";
import { useOptimistic } from "react";

export function VehicleForm({ vehicle }) {
  const [optimisticVehicle, updateOptimisticVehicle] = useOptimistic(
    vehicle,
    (state, newData) => ({ ...state, ...newData }),
  );

  async function handleSubmit(formData) {
    // Optimistic update
    updateOptimisticVehicle({ status: "updating" });
    // Actual server action
    await updateVehicle(formData);
  }

  return <form action={handleSubmit}>{/* Form fields */}</form>;
}
```

### 3. Form State Management

Forms use a combination of:

- Native HTML forms with `<form action={serverAction}>`
- `useFormStatus()` hook for loading states
- `useActionState()` hook for form submission results
- Zod schema validation for input validation

### 4. Component-Local State

For UI-specific state that doesn't affect data:

- Use `useState` for simple toggle/form state
- Use `useReducer` for more complex local state

## Best Practices

1. **Fetch On Server**: Always fetch data in Server Components
2. **Props Down**: Pass data down as props rather than fetching in client
3. **Actions Up**: Use Server Actions for all mutations
4. **Context Sparingly**: Only use Context for truly global state
5. **Optimistic Updates**: Use `useOptimistic` for better UX
6. **Form Status**: Use `useFormStatus` for loading indicators
7. **Validation**: Always validate inputs with Zod schemas
