---
id: 7ehzx6999y250114j4robqs
title: Domains
desc: ''
updated: 1748450930556
created: 1748450930556
---

# FleetFusion Domain Architecture

This document outlines the domain architecture for the FleetFusion application, built with Next.js 15, React 19, and TypeScript. It follows a modern full-stack approach, emphasizing server-first rendering, React Server Components (RSC), and a feature-driven, scalable, and modular structure.

## Core Architectural Principles

- **Server-First Rendering**: Prioritize rendering on the server using React Server Components.
- **React Server Components (RSC)**: Used by default for pages and components that fetch data or don't require client-side interactivity.
- **Client Components**: Components are marked with `'use client'` only when interactivity (state, event handlers, browser APIs) is essential.
- **Feature-Driven Structure**: Logic is organized around business features for better modularity and scalability, primarily within the `features/` directory.
- **Separation of Concerns**:
    - **UI (`components/`)**: Dumb, reusable presentational components, often stateless.
    - **Business Logic & Smart UI (`features/`)**: Encapsulates feature-specific logic and orchestrates UI components. These can be Server or Client Components.
    - **Domain Logic & Infrastructure (`lib/`)**: Contains server actions, data fetchers, utility functions, and database interactions (e.g., Prisma client).
    - **Routing & Pages (`app/`)**: Managed by the Next.js App Router, defining routes and composing UI.
- **Server Actions (`lib/actions/`)**: Used for data mutations and enforcing business rules, callable from both server and client components. Marked with `'use server'`.
- **Data Fetching (`lib/fetchers/`)**: Centralized logic for retrieving data, primarily for Server Components.
- **Styling**: Tailwind CSS 4 with CSS variables for theming, as defined in `tailwind.config.ts` and `app/globals.css`.
- **TypeScript**: For end-to-end type safety, with types defined in `types/` and validation schemas in `validations/`.

## Domain Breakdown

The application is divided into the following key domains:

1.  [Auth](#auth-domain)
2.  [Onboarding](#onboarding-domain)
3.  [Analytics](#analytics-domain)
4.  [Compliance](#compliance-domain)
5.  [Dispatch](#dispatch-domain)
6.  [Drivers](#drivers-domain)
7.  [IFTA](#ifta-domain)
8.  [Settings](#settings-domain)
9.  [Vehicles](#vehicles-domain)
10. [Admin](#admin-domain)

---

## Auth Domain

### 1. Domain Architecture Overview

The Auth domain handles all aspects related to user authentication, registration, session management, and authorization. It leverages Clerk for core authentication services, integrated via API routes (`app/api/clerk/`) and server-side utilities.

- **Frontend**: Primarily uses Client Components within the `app/(auth)/` routes (e.g., `sign-in`, `sign-up`) for interactive forms. Shared components like `UserButton` are managed via `components/auth/context.tsx`.
- **Backend**: Server Actions may wrap some Clerk operations or handle related profile updates. Clerk's SDK is used for session management and user data retrieval, often within `lib/auth/` utilities.

### 2. UI Components (Dumb Components)

UI components for the Auth domain are located in `components/auth/` and `components/ui/` (for generic elements like buttons, inputs).

- **Responsibilities**: Rendering sign-in/sign-up forms, displaying user profile information snippets, and password recovery UIs.
- **Stateless & Reusable**: Form fields are generic; specific auth forms compose these.
- **Examples**:
    - `SignInFormFields`: Renders email/password inputs.
    - `OAuthButton`: A button for initiating OAuth flows (e.g., Google, GitHub).

```tsx
// Example: components/auth/SignInFormFields.tsx
import React from 'react';
import { Input } from '@/components/ui/input'; // Assuming a generic Input component
import { Label } from '@/components/ui/label'; // Assuming a generic Label component

export function SignInFormFields() {
  return (
    <>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" name="password" required />
      </div>
    </>
  );
}
```

### 3. Business Logic (Features)

Feature-specific logic for authentication resides in components within `app/(auth)/` (e.g., `app/(auth)/sign-in/page.tsx`) or potentially `features/auth/`.

- **Encapsulation**: Manages the flow of signing in, signing up, password reset, and onboarding initiation.
- **Form Handling**: Uses standard HTML forms with Server Actions or client-side handlers that call Server Actions. React 19's `useActionState` and `useFormStatus` enhance form UX.
- **Complex Interactions**: Handling MFA, social logins, and redirects post-authentication.

```tsx
// Example: app/(auth)/sign-in/page.tsx (Simplified)
'use client'; // Sign-in forms are interactive

import React from 'react';
import { useActionState } from 'react';
import { signInAction } from '@/lib/actions/authActions'; // Assumed action
import { SignInFormFields } from '@/components/auth/SignInFormFields';
import { SubmitButton } from '@/components/ui/submit-button'; // Assumed SubmitButton aware of form status

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <form action={formAction}>
      <h2>Sign In</h2>
      <SignInFormFields />
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      <SubmitButton buttonText="Sign In" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions for the Auth domain are in `lib/actions/authActions.ts`. They interface with Clerk or custom user management logic.

- **`'use server';`**: Standard directive.
- **Data Mutations**: User creation (sign-up), session creation (sign-in), user profile updates.
- **Business Rule Enforcement**: Validating credentials, checking for existing users, handling password policies.
- **Integration**: Called from auth forms. May use `revalidatePath` for profile pages or redirect.

```typescript
// Example: lib/actions/authActions.ts
'use server';

import { redirect } from 'next/navigation';
// import { clerkClient } from '@clerk/nextjs/server'; // Example if using Clerk directly
import { z } from 'zod';
import { signInSchema } from '@/validations/auth'; // From validations/auth.ts

export async function signInAction(prevState: any, formData: FormData) {
  const validatedFields = signInSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { error: "Invalid input.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  try {
    // Replace with actual Clerk sign-in logic or your auth provider
    // const user = await attemptSignIn(email, password);
    // if (!user) return { error: "Invalid credentials." };
    console.log("Simulating sign in for:", email);
  } catch (error) {
    return { error: "Sign in failed." };
  }
  
  // On successful sign-in, Clerk typically handles redirection via middleware or its components.
  // If custom logic needed:
  // revalidatePath('/'); // Or dashboard path
  redirect('/dashboard'); // Example redirect
}

export async function signUpAction(prevState: any, formData: FormData) {
  // ... similar validation and sign-up logic ...
  return { success: true }; // Placeholder
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/authFetchers.ts` would typically retrieve user-related data not directly handled by Clerk's hooks/components.

- **Data Retrieval**: Getting current user session (often handled by Clerk's `auth()` or `currentUser()`), fetching user profile details.
- **Efficiency**: Clerk SDK handles its own caching. Custom fetchers should use Next.js caching.
- **Consistency**: Standardized way to access user data if not using Clerk's direct methods.

```typescript
// Example: lib/fetchers/authFetchers.ts
import { unstable_noStore as noStore } from 'next/cache';
import { auth, clerkClient } from '@clerk/nextjs/server'; // Example
import { UserProfile } from '@/types/auth'; // From types/auth.ts

export async function getCurrentUserCustomProfile(): Promise<UserProfile | null> {
  noStore();
  const { userId } = auth();
  if (!userId) return null;

  try {
    // Assuming you store additional profile data linked to the Clerk user ID
    // const customProfile = await prisma.userProfile.findUnique({ where: { clerkId: userId } });
    // return customProfile;
    return { clerkId: userId, customData: "some_data" }; // Placeholder
  } catch (error) {
    console.error('Error fetching custom user profile:', error);
    return null;
  }
}
```

### 6. Integration

- **Pages (`app/(auth)/`)**: Use Feature components or directly implement auth forms.
- **Feature Components**: Orchestrate form UI, call Server Actions.
- **UI Components (`components/auth/`)**: Provide reusable form elements.
- **Server Actions (`lib/actions/authActions.ts`)**: Handle credential validation, user creation, session management.
- **Fetchers (`lib/fetchers/authFetchers.ts`)**: Provide access to user data.
- **Clerk**: Provides core auth services, UI components (`<UserButton />`, `<SignIn />`), and SDKs.
- **Types/Validations**: `types/auth.ts`, `validations/auth.ts`.

---

## Onboarding Domain

### 1. Domain Architecture Overview

The Onboarding domain manages the process of guiding new users through initial setup steps after registration, such as completing their profile, setting up their organization, or configuring initial preferences.

- **Frontend**: Interactive multi-step forms located within `app/(auth)/onboarding/`. Uses Client Components for managing step progression and form state.
- **Backend**: Server Actions handle the submission of each onboarding step, persisting data progressively.

### 2. UI Components (Dumb Components)

UI components for Onboarding are in `components/onboarding/` (if specific) or use generic UI elements from `components/ui/`.

- **Responsibilities**: Rendering individual steps of the onboarding flow, progress indicators, and form inputs for collecting user information.
- **Stateless & Reusable**: Components for each step are self-contained.
- **Examples**:
    - `OnboardingStepIndicator`: Shows current progress in the onboarding flow.
    - `ProfileSetupFormFields`: Inputs for name, company role, etc.

```tsx
// Example: components/onboarding/OnboardingStepIndicator.tsx
import React from 'react';

interface OnboardingStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingStepIndicator({ currentStep, totalSteps }: OnboardingStepIndicatorProps) {
  return (
    <div>
      Step {currentStep} of {totalSteps}
      {/* Visual progress bar could be added here */}
    </div>
  );
}
```

### 3. Business Logic (Features)

The main onboarding feature is likely a multi-step wizard, managed by a parent component in `app/(auth)/onboarding/page.tsx` or `features/onboarding/OnboardingWizard.tsx`.

- **Encapsulation**: Manages the current step, data collected across steps, and navigation between steps.
- **Form Handling**: Each step is a form submitting to a Server Action. `useActionState` helps manage submission state and errors for each step.
- **Complex Interactions**: Persisting partial data, validating step-specific information, and redirecting upon completion.

```tsx
// Example: features/onboarding/OnboardingWizard.tsx
'use client';

import React, { useState } from 'react';
import { useActionState } from 'react';
import { submitOnboardingStepAction } from '@/lib/actions/onboardingActions';
import { OnboardingStepIndicator } from '@/components/onboarding/OnboardingStepIndicator';
// Import step-specific form field components

const TOTAL_STEPS = 3;

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({});
  const [actionState, formAction, isPending] = useActionState(submitOnboardingStepAction, null);

  const handleNextStep = (stepData: any) => {
    const newOnboardingData = { ...onboardingData, ...stepData };
    setOnboardingData(newOnboardingData);
    
    const formData = new FormData();
    formData.append('step', currentStep.toString());
    formData.append('data', JSON.stringify(newOnboardingData));
    // Append other necessary fields from stepData to formData

    formAction(formData); // Call the server action

    // if actionState indicates success (from previous submission)
    // setCurrentStep(prev => prev + 1);
  };
  
  // Logic to render current step's form
  // Example: if (currentStep === 1) return <Step1Form onSubmit={handleNextStep} isPending={isPending} errors={actionState?.errors} />;

  return (
    <div>
      <OnboardingStepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      {/* Render current step form here */}
      {actionState?.message && <p>{actionState.message}</p>}
    </div>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/onboardingActions.ts` handle data persistence for each onboarding step.

- **`'use server';`**: Standard.
- **Data Mutations**: Updating user profiles, creating organization records, saving preferences.
- **Business Rule Enforcement**: Validating submitted data for each step.
- **Integration**: Called by the onboarding wizard. May `revalidatePath` or redirect upon final step completion.

```typescript
// Example: lib/actions/onboardingActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { prisma } from '@/lib/database/prisma';
// import { onboardingStepSchema } from '@/validations/onboarding'; // Assuming a Zod schema
import { auth } from '@clerk/nextjs/server';

interface OnboardingActionState {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

export async function submitOnboardingStepAction(
  prevState: OnboardingActionState | null,
  formData: FormData
): Promise<OnboardingActionState | null> {
  const { userId } = auth();
  if (!userId) return { message: "User not authenticated.", success: false };

  const step = parseInt(formData.get('step') as string, 10);
  const jsonData = formData.get('data') as string; // This might need more robust handling
  // const parsedData = JSON.parse(jsonData); // Parse data specific to the step

  // const validation = onboardingStepSchema.safeParse({ step, ...parsedData });
  // if (!validation.success) {
  //   return { errors: validation.error.flatten().fieldErrors, success: false };
  // }
  
  try {
    // Based on 'step', save 'parsedData' to the database
    // Example: if (step === 1) await prisma.userProfile.update({ where: { clerkId: userId }, data: { ... } });
    console.log(`Step ${step} data for user ${userId} submitted:`, jsonData);

    if (step === 3 /* Assuming 3 is the last step */) {
      // Mark onboarding as complete
      // await prisma.user.update({ where: { clerkId: userId }, data: { hasCompletedOnboarding: true } });
      revalidatePath('/dashboard');
      redirect('/dashboard'); // Or a specific post-onboarding page
      return null; // Redirect will occur
    }
    return { message: `Step ${step} saved successfully.`, success: true };
  } catch (error) {
    console.error('Error submitting onboarding step:', error);
    return { message: 'Failed to save onboarding step.', success: false };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/onboardingFetchers.ts` might be used to retrieve existing onboarding state if a user resumes an incomplete onboarding.

- **Data Retrieval**: `getOnboardingStatus(userId: string)`.
- **Efficiency**: Cache status appropriately.
- **Consistency**: Standardized access to onboarding progress.

```typescript
// Example: lib/fetchers/onboardingFetchers.ts
import { unstable_noStore as noStore } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { OnboardingStatus } from '@/types/onboarding'; // Assuming types/onboarding.ts

export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
  noStore(); // Onboarding status might change frequently during the process
  try {
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: userId },
    //   select: { hasCompletedOnboarding: true, currentOnboardingStep: true }
    // });
    // if (!user) return null;
    // return {
    //   hasCompletedOnboarding: user.hasCompletedOnboarding,
    //   currentStep: user.currentOnboardingStep || 1,
    // };
    return { hasCompletedOnboarding: false, currentStep: 1 }; // Placeholder
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return null;
  }
}
```

### 6. Integration

- **Pages (`app/(auth)/onboarding/`)**: Host the onboarding wizard.
- **Feature Components (`features/onboarding/`)**: Manage the multi-step flow.
- **UI Components (`components/onboarding/`, `components/ui/`)**: Render individual steps and form elements.
- **Server Actions (`lib/actions/onboardingActions.ts`)**: Persist data for each step.
- **Fetchers (`lib/fetchers/onboardingFetchers.ts`)**: Retrieve current onboarding progress.
- **Types/Validations**: `types/onboarding.ts`, `validations/onboarding.ts` (to be created or use existing like `auth.ts`).

---

## Analytics Domain

### 1. Domain Architecture Overview

The Analytics domain is responsible for presenting data insights, visualizations, and reports to users, typically within a tenant's context (e.g., for an organization).

- **Frontend**: Primarily uses Server Components located in `app/(tenant)/[orgId]/analytics/` to fetch and display analytical data. Client Components from `components/analytics/` are used for interactive charts or data tables.
- **Backend**: Data is primarily retrieved via Fetcher functions. Server Actions might be used for triggering report generation or saving custom view preferences.

### 2. UI Components (Dumb Components)

UI components for Analytics are in `components/analytics/` and `components/shared/ui/`.

- **Responsibilities**: Rendering charts (e.g., using a library like Recharts or Chart.js), data tables, metric cards, and filter controls.
- **Stateless & Reusable**: Chart components take data and configuration as props. Table components render rows based on input data.
- **Examples**:
    - `BarChart`: A reusable bar chart component. (e.g., `components/analytics/performance-metrics.tsx` might use such a component)
    - `MetricCard`: Displays a single key metric. (e.g., `components/dashboard/dashboard-cards.tsx` could be adapted or similar used here)
    - `DateRangePicker`: For filtering data by time period.

```tsx
// Example: components/analytics/SimpleBarChart.tsx
'use client'; // Charting libraries often require client components

import React from 'react';
// Assuming a charting library like Recharts
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsDataPoint } from '@/types/analytics'; // From types/analytics.ts

interface SimpleBarChartProps {
  data: AnalyticsDataPoint[]; // Example data structure
}

export function SimpleBarChart({ data }: SimpleBarChartProps) {
  if (!data || data.length === 0) return <p>No data available for chart.</p>;

  return (
    <div style={{ width: '100%', height: 300 }}> {/* ResponsiveContainer would handle this */}
      {/* <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer> */}
      <p>Chart Placeholder: Displaying {data.length} data points.</p>
    </div>
  );
}
```

### 3. Business Logic (Features)

Feature components in `features/analytics/` (or directly within `app/(tenant)/[orgId]/analytics/page.tsx`) orchestrate the display of analytics dashboards.

- **Encapsulation**: Combining various charts, tables, and filters to present a cohesive analytics view (e.g., `DriverPerformanceDashboardFeature`).
- **Form Handling**: Forms for custom report parameters or saving view configurations would use Server Actions.
- **Complex Interactions**: Dynamic filtering, drill-downs in charts, real-time data updates (if applicable, potentially using polling or WebSockets via API routes).

```tsx
// Example: features/analytics/DriverPerformanceDashboard.tsx (Can be a Server Component)
import React from 'react';
import { getDriverPerformanceData } from '@/lib/fetchers/analyticsFetchers';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart'; // Client component
// import { PerformanceDataTable } from '@/components/analytics/PerformanceDataTable'; // Another component

interface DriverPerformanceDashboardProps {
  orgId: string;
  dateRange: { from: string; to: string };
}

export async function DriverPerformanceDashboard({ orgId, dateRange }: DriverPerformanceDashboardProps) {
  const performanceData = await getDriverPerformanceData(orgId, dateRange);

  return (
    <div>
      <h2>Driver Performance</h2>
      {/* Filters could be here, potentially client components that trigger re-renders or navigation */}
      <SimpleBarChart data={performanceData.chartData} />
      {/* <PerformanceDataTable data={performanceData.tableData} /> */}
    </div>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/analyticsActions.ts` are less common for pure display but can be used for tasks like saving user preferences for dashboards or triggering asynchronous report generation.

- **`'use server';`**: Standard.
- **Data Mutations**: Saving a user's custom analytics view configuration.
- **Business Rule Enforcement**: Validating parameters for report generation.
- **Integration**: Called from settings within the analytics dashboard.

```typescript
// Example: lib/actions/analyticsActions.ts
'use server';

import { revalidateTag } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { auth } from '@clerk/nextjs/server';

export async function saveDashboardPreferences(orgId: string, preferences: any): Promise<{ success: boolean; error?: string }> {
  const { userId } = auth();
  if (!userId) return { success: false, error: "User not authenticated." };

  try {
    // await prisma.userDashboardPreference.upsert({
    //   where: { userId_orgId_dashboardType: { userId, orgId, dashboardType: 'driver_performance' } },
    //   update: { preferences },
    //   create: { userId, orgId, dashboardType: 'driver_performance', preferences },
    // });
    console.log(`Preferences for org ${orgId} by user ${userId} saved:`, preferences);
    revalidateTag(`dashboard-preferences-${userId}-${orgId}`);
    return { success: true };
  } catch (error) {
    console.error('Error saving dashboard preferences:', error);
    return { success: false, error: 'Failed to save preferences.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/analyticsFetchers.ts` are crucial for retrieving data to populate charts and tables.

- **Data Retrieval**: Functions like `getSalesRevenueOverTime(orgId, range)`, `getVehicleUtilizationStats(orgId, range)`.
- **Efficiency**: Data aggregation and complex queries are performed on the database side. Results are cached using Next.js fetch caching or `revalidateTag`.
- **Consistency**: Standardized way to access analytical data.

```typescript
// Example: lib/fetchers/analyticsFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { AnalyticsDataPoint, DriverPerformanceData } from '@/types/analytics'; // From types/analytics.ts
import { unstable_cache as cache } from 'next/cache';


export async function getDriverPerformanceData(
  orgId: string, 
  dateRange: { from: string; to: string }
): Promise<DriverPerformanceData> {
  // Use unstable_cache for fine-grained caching with tags
  return cache(async () => {
    console.log(`Fetching driver performance data for org ${orgId} in range ${dateRange.from}-${dateRange.to}`);
    // const data = await prisma.load.groupBy({
    //   by: ['driverId'],
    //   where: { orgId, completedAt: { gte: new Date(dateRange.from), lte: new Date(dateRange.to) } },
    //   _sum: { revenue: true },
    //   _count: { id: true },
    // });
    // Transform data for chart and table
    return { 
      chartData: [{ name: 'Driver A', value: 5000 }, { name: 'Driver B', value: 7500 }], // Placeholder
      tableData: [{ driverId: 'A', totalRevenue: 5000, loadCount: 10 }] // Placeholder
    };
  }, [`driver-performance-${orgId}-${dateRange.from}-${dateRange.to}`], {
    tags: [`analytics-org-${orgId}`, `driver-performance-${orgId}`],
    revalidate: 3600, // Revalidate every hour
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/analytics/`)**: Server Components that fetch initial data using Fetchers and render Feature components or specific analytic views.
- **Feature Components (`features/analytics/`)**: Orchestrate the display of dashboards, combining various UI components.
- **UI Components (`components/analytics/`, `components/ui/`)**: Render charts, tables, filters.
- **Server Actions (`lib/actions/analyticsActions.ts`)**: Handle preference saving or report generation triggers.
- **Fetchers (`lib/fetchers/analyticsFetchers.ts`)**: Provide aggregated and processed data for display.
- **Types/Validations**: `types/analytics.ts`, `validations/analytics.ts` (if forms for settings/reports exist).

---

## Compliance Domain

### 1. Domain Architecture Overview

The Compliance domain focuses on managing regulatory requirements, such as Hours of Service (HOS) logs, vehicle inspections, driver qualifications, and document management.

- **Frontend**: Routes under `app/(tenant)/[orgId]/compliance/` display compliance statuses, logs, and document lists. Interactive forms for uploading documents or logging events use Client Components.
- **Backend**: Server Actions handle document uploads, log entries, and status updates. Fetchers retrieve compliance data for display.

### 2. UI Components (Dumb Components)

Located in `components/compliance/` and `components/shared/ui/`.

- **Responsibilities**: Displaying HOS logs (`HosLogViewer`), tables of compliance documents (`ComplianceDocumentsTable`), vehicle/driver compliance status indicators.
- **Stateless & Reusable**: Components take data (e.g., list of documents, log entries) as props.
- **Examples**:
    - `HosLogEntryCard`: Displays a single HOS log event.
    - `DocumentStatusBadge`: Shows if a document is valid, expiring, or expired.
    - `FileUploadArea`: A generic component for dragging & dropping files.

```tsx
// Example: components/compliance/DocumentStatusBadge.tsx
import React from 'react';
import { ComplianceDocumentStatus } from '@/types/compliance'; // From types/compliance.ts

interface DocumentStatusBadgeProps {
  status: ComplianceDocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  let color = 'gray';
  if (status === 'valid') color = 'green';
  if (status === 'expiring_soon') color = 'orange';
  if (status === 'expired') color = 'red';

  return (
    <span style={{ backgroundColor: color, color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
      {status.replace('_', ' ')}
    </span>
  );
}
```

### 3. Business Logic (Features)

Features in `features/compliance/` or pages like `app/(tenant)/[orgId]/compliance/documents/page.tsx` manage compliance-related workflows.

- **Encapsulation**: `ManageDriverDocumentsFeature` could allow viewing, uploading, and setting reminders for a driver's documents.
- **Form Handling**: Forms for uploading new documents or updating compliance information use Server Actions, with client-side UX enhancements.
- **Complex Interactions**: Displaying timelines of HOS events, managing document expiry notifications.

```tsx
// Example: features/compliance/UploadDocumentFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { uploadComplianceDocumentAction } from '@/lib/actions/complianceActions';
import { SubmitButton } from '@/components/ui/submit-button';

interface UploadDocumentFeatureProps {
  orgId: string;
  entityType: 'driver' | 'vehicle';
  entityId: string;
}

export function UploadDocumentFeature({ orgId, entityType, entityId }: UploadDocumentFeatureProps) {
  const [state, formAction, isPending] = useActionState(uploadComplianceDocumentAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      
      <div>
        <label htmlFor="documentType">Document Type</label>
        <input type="text" name="documentType" id="documentType" required />
      </div>
      <div>
        <label htmlFor="file">File</label>
        <input type="file" name="file" id="file" required />
      </div>
      <div>
        <label htmlFor="expiryDate">Expiry Date (Optional)</label>
        <input type="date" name="expiryDate" id="expiryDate" />
      </div>
      
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>Document uploaded successfully!</p>}
      <SubmitButton buttonText="Upload Document" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/complianceActions.ts` handle mutations related to compliance data.

- **`'use server';`**: Standard.
- **Data Mutations**: Uploading documents (potentially to cloud storage like S3, then saving metadata), creating HOS log entries, updating vehicle inspection records.
- **Business Rule Enforcement**: Validating document types, checking for required fields, ensuring HOS rules are met.
- **Integration**: Called from document upload forms or HOS logging interfaces. `revalidatePath` or `revalidateTag` updates relevant views.

```typescript
// Example: lib/actions/complianceActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { prisma } from '@/lib/database/prisma';
// import { uploadToS3 } from '@/lib/s3storage'; // Assumed S3 upload utility
import { complianceDocumentSchema } from '@/validations/compliance'; // From validations/compliance.ts
import { auth } from '@clerk/nextjs/server';

export async function uploadComplianceDocumentAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; docId?: string }> {
  const { userId, orgId: userOrgId } = auth(); // Clerk's orgId might be different from app's tenant orgId
  if (!userId) return { success: false, error: "User not authenticated." };

  const submittedOrgId = formData.get('orgId') as string;
  // Validate user belongs to submittedOrgId or has rights

  const validatedFields = complianceDocumentSchema.safeParse({
    // Extract fields from formData, including file handling
    orgId: submittedOrgId,
    entityType: formData.get('entityType'),
    entityId: formData.get('entityId'),
    documentType: formData.get('documentType'),
    expiryDate: formData.get('expiryDate') ? new Date(formData.get('expiryDate') as string) : undefined,
    // file: formData.get('file') // File handling is more complex
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", /* fieldErrors: validatedFields.error.flatten().fieldErrors */ };
  }
  
  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    return { success: false, error: "File is required." };
  }

  try {
    // const fileUrl = await uploadToS3(file); // Upload file to S3
    const fileUrl = `https://fake-s3.com/${file.name}`; // Placeholder

    // const newDocument = await prisma.complianceDocument.create({
    //   data: { ...validatedFields.data, fileUrl, uploadedByUserId: userId },
    // });
    const newDocId = "doc_" + Date.now(); // Placeholder
    console.log("Document uploaded:", validatedFields.data, fileUrl);

    revalidatePath(`/tenant/${submittedOrgId}/compliance/documents`);
    return { success: true, docId: newDocId };
  } catch (error) {
    console.error('Error uploading compliance document:', error);
    return { success: false, error: 'Failed to upload document.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/complianceFetchers.ts` retrieve compliance data for display.

- **Data Retrieval**: `getDriverComplianceStatus(driverId)`, `getVehicleHOSLogs(vehicleId, range)`, `listComplianceDocuments(orgId, entityType, entityId)`.
- **Efficiency**: Queries filter by organization, entity, and date ranges. Caching is important for frequently accessed data.
- **Consistency**: Standardized access to compliance records.

```typescript
// Example: lib/fetchers/complianceFetchers.ts
import { unstable_noStore as noStore } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { ComplianceDocument } from '@/types/compliance'; // From types/compliance.ts
import { unstable_cache as cache } from 'next/cache';

export async function listComplianceDocuments(
  orgId: string,
  entityType: 'driver' | 'vehicle',
  entityId: string
): Promise<ComplianceDocument[]> {
  return cache(async () => {
    // const documents = await prisma.complianceDocument.findMany({
    //   where: { orgId, entityType, entityId },
    //   orderBy: { uploadedAt: 'desc' },
    // });
    // return documents;
    return [{ // Placeholder
      id: "doc1", orgId, entityType, entityId, documentType: "License", 
      fileUrl: "http://example.com/license.pdf", uploadedAt: new Date(), 
      uploadedByUserId: "user1", status: "valid"
    }];
  }, [`compliance-docs-${orgId}-${entityType}-${entityId}`], {
    tags: [`compliance-docs-${orgId}`],
    revalidate: 3600,
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/compliance/`)**: Display compliance dashboards and lists, using Fetchers for data.
- **Feature Components (`features/compliance/`)**: Manage workflows like document uploads or HOS log reviews.
- **UI Components (`components/compliance/`)**: Render specific compliance data elements.
- **Server Actions (`lib/actions/complianceActions.ts`)**: Handle data mutations like uploads and log entries.
- **Fetchers (`lib/fetchers/complianceFetchers.ts`)**: Provide compliance data to Server Components.
- **Types/Validations**: `types/compliance.ts`, `validations/compliance.ts`.

---

## Dispatch Domain

### 1. Domain Architecture Overview

The Dispatch domain is central to managing transportation logistics, including creating and assigning loads, tracking shipments, and managing driver assignments.

- **Frontend**: Routes under `app/(tenant)/[orgId]/dispatch/` provide interfaces for dispatch boards, load creation forms, and shipment tracking. Client Components are used for interactive elements like drag-and-drop dispatch boards or real-time map updates.
- **Backend**: Server Actions handle load creation, updates, and assignments. Fetchers retrieve load, driver, and vehicle data for display on dispatch interfaces.

### 2. UI Components (Dumb Components)

Located in `components/dispatch/` and `components/shared/ui/`.

- **Responsibilities**: Displaying load information (`LoadCard`), forms for load details (`LoadForm`), elements of a dispatch board.
- **Stateless & Reusable**: `LoadCard` takes load data as props. Form components are composed of generic inputs.
- **Examples**:
    - `LoadCard`: Displays summary information for a single load. (As in `components/dispatch/load-card.tsx`)
    - `DriverAssignmentDropdown`: A dropdown to select a driver for a load.
    - `LocationPickerInput`: An input field with map integration for selecting pickup/delivery locations.

```tsx
// Example: components/dispatch/LoadStatusBadge.tsx
import React from 'react';
import { LoadStatus } from '@/types/dispatch'; // From types/dispatch.ts

interface LoadStatusBadgeProps {
  status: LoadStatus;
}

export function LoadStatusBadge({ status }: LoadStatusBadgeProps) {
  // ... logic to determine color based on status ...
  const color = status === 'PENDING' ? 'blue' : status === 'IN_TRANSIT' ? 'orange' : 'green';
  return (
    <span style={{ backgroundColor: color, color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
      {status}
    </span>
  );
}
```

### 3. Business Logic (Features)

Features in `features/dispatch/` or pages like `app/(tenant)/[orgId]/dispatch/board/page.tsx` manage dispatch operations.

- **Encapsulation**: `InteractiveDispatchBoardFeature` could allow drag-and-drop assignment of loads to drivers. `CreateLoadFeature` would guide users through creating a new load.
- **Form Handling**: `LoadForm` (from `components/dispatch/load-form.tsx`) uses Server Actions for creating/updating loads.
- **Complex Interactions**: Real-time updates on a dispatch board, route optimization suggestions, managing multi-stop loads.

```tsx
// Example: features/dispatch/CreateLoadFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { createLoadAction } from '@/lib/actions/dispatchActions';
import { LoadForm } from '@/components/dispatch/LoadForm'; // Assuming LoadForm is a client component or can be used in one
import { SubmitButton } from '@/components/ui/submit-button';

interface CreateLoadFeatureProps {
  orgId: string;
  availableDrivers: Array<{ id: string; name: string }>; // Simplified
  availableVehicles: Array<{ id: string; name: string }>; // Simplified
}

export function CreateLoadFeature({ orgId, availableDrivers, availableVehicles }: CreateLoadFeatureProps) {
  const [state, formAction, isPending] = useActionState(createLoadAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      {/* LoadForm component would contain all the fields */}
      {/* This is a simplified representation; LoadForm itself might handle its fields and structure */}
      <LoadForm 
        initialData={null} 
        availableDrivers={availableDrivers} 
        availableVehicles={availableVehicles} 
      />
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.fieldErrors && /* display field errors */}
      {state?.loadId && <p style={{ color: 'green' }}>Load created successfully! ID: {state.loadId}</p>}
      <SubmitButton buttonText="Create Load" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/dispatchActions.ts` handle mutations for loads and assignments.

- **`'use server';`**: Standard.
- **Data Mutations**: Creating new loads, updating load statuses (e.g., "picked_up", "delivered"), assigning loads to drivers/vehicles.
- **Business Rule Enforcement**: Validating load details, checking driver/vehicle availability, ensuring compliance with business rules (e.g., weight limits).
- **Integration**: Called from load creation forms or dispatch board interactions. `revalidatePath` or `revalidateTag` updates dispatch views.

```typescript
// Example: lib/actions/dispatchActions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { prisma } from '@/lib/database/prisma';
import { loadSchema } from '@/validations/dispatch'; // From validations/dispatch.ts
import { auth } from '@clerk/nextjs/server';

export async function createLoadAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any; loadId?: string }> {
  const { userId, orgId: userOrgId } = auth();
  if (!userId) return { success: false, error: "User not authenticated." };
  
  const submittedOrgId = formData.get('orgId') as string;
  // Add orgId validation against userOrgId or user's permissions

  const rawData = Object.fromEntries(formData);
  // Convert date strings to Date objects if necessary before validation
  // rawData.pickupDate = new Date(rawData.pickupDate);
  // rawData.deliveryDate = new Date(rawData.deliveryDate);

  const validatedFields = loadSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // const newLoad = await prisma.load.create({
    //   data: { ...validatedFields.data, orgId: submittedOrgId, createdByUserId: userId },
    // });
    const newLoadId = "load_" + Date.now(); // Placeholder
    console.log("Load created:", validatedFields.data);

    revalidatePath(`/tenant/${submittedOrgId}/dispatch`);
    revalidateTag(`loads-${submittedOrgId}`);
    return { success: true, loadId: newLoadId };
  } catch (error) {
    console.error('Error creating load:', error);
    return { success: false, error: 'Failed to create load.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/dispatchFetchers.ts` retrieve data for dispatch boards and load details.

- **Data Retrieval**: `getActiveLoads(orgId)`, `getLoadDetails(loadId)`, `getAvailableDriversForLoad(orgId, loadRequirements)`.
- **Efficiency**: Queries filter by status, date, location. Real-time needs might require different strategies (e.g., polling, subscriptions if using GraphQL/WebSockets).
- **Consistency**: Standardized access to dispatch-related data.

```typescript
// Example: lib/fetchers/dispatchFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { Load } from '@/types/dispatch'; // From types/dispatch.ts
import { unstable_cache as cache } from 'next/cache';

export async function getActiveLoads(orgId: string): Promise<Load[]> {
  return cache(async () => {
    // const loads = await prisma.load.findMany({
    //   where: { orgId, status: { notIn: ['DELIVERED', 'CANCELLED'] } },
    //   orderBy: { createdAt: 'desc' },
    //   // include: { driver: true, vehicle: true } // Include related data
    // });
    // return loads;
    return [{ // Placeholder
      id: "load1", orgId, customerName: "Customer X", status: "PENDING",
      pickupLocation: "City A", deliveryLocation: "City B", 
      pickupDate: new Date(), deliveryDate: new Date(),
      // driver: { id: "driver1", name: "John Doe" } 
    }];
  }, [`active-loads-${orgId}`], {
    tags: [`loads-${orgId}`],
    revalidate: 60, // Revalidate every minute for active loads
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/dispatch/`)**: Display dispatch boards, load lists, and creation forms.
- **Feature Components (`features/dispatch/`)**: Manage interactive dispatch boards or complex load creation flows.
- **UI Components (`components/dispatch/`)**: Render load cards, form elements, parts of the dispatch board.
- **Server Actions (`lib/actions/dispatchActions.ts`)**: Handle load creation, updates, and assignments.
- **Fetchers (`lib/fetchers/dispatchFetchers.ts`)**: Provide data for dispatch views.
- **Types/Validations**: `types/dispatch.ts`, `validations/dispatch.ts`.

---

## Drivers Domain

### 1. Domain Architecture Overview

The Drivers domain is concerned with managing all information related to drivers, including their profiles, qualifications, assignments, and performance.

- **Frontend**: Routes under `app/(tenant)/[orgId]/drivers/` allow for viewing driver lists, individual driver profiles, and forms for adding or editing driver information.
- **Backend**: Server Actions handle the creation and updating of driver profiles. Fetchers retrieve driver data for display and for use in other domains like Dispatch.

### 2. UI Components (Dumb Components)

Located in `components/drivers/` and `components/shared/ui/`.

- **Responsibilities**: Displaying driver information (`DriverCard`), lists of drivers, forms for driver details.
- **Stateless & Reusable**: `DriverCard` (from `components/drivers/driver-card.tsx`) takes driver data as props.
- **Examples**:
    - `DriverProfileView`: Shows detailed information about a driver.
    - `DriverLicenseInfo`: Displays license number, expiry, and class.
    - `AddDriverFormFields`: Inputs for driver's personal details, contact, license.

```tsx
// Example: components/drivers/DriverStatusIndicator.tsx
import React from 'react';
import { DriverAvailabilityStatus } from '@/types/drivers'; // From types/drivers.ts

interface DriverStatusIndicatorProps {
  status: DriverAvailabilityStatus;
}

export function DriverStatusIndicator({ status }: DriverStatusIndicatorProps) {
  let color = 'gray';
  if (status === 'available') color = 'green';
  if (status === 'on_load') color = 'orange';
  if (status === 'unavailable') color = 'red';

  return (
    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, marginRight: '8px' }} title={status} />
  );
}
```

### 3. Business Logic (Features)

Features in `features/drivers/` or pages like `app/(tenant)/[orgId]/drivers/[driverId]/page.tsx` manage driver-related operations.

- **Encapsulation**: `ManageDriverProfileFeature` could allow viewing and editing all aspects of a driver's profile, including qualifications and documents (linking to Compliance).
- **Form Handling**: Forms for adding new drivers or editing existing ones use Server Actions.
- **Complex Interactions**: Managing driver schedules, assigning qualifications, tracking performance metrics (linking to Analytics).

```tsx
// Example: features/drivers/AddDriverFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { addDriverAction } from '@/lib/actions/driverActions'; // Corrected to driverActions
import { SubmitButton } from '@/components/ui/submit-button';
// Assume AddDriverFormFields component exists

export function AddDriverFeature({ orgId }: { orgId: string }) {
  const [state, formAction, isPending] = useActionState(addDriverAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      {/* <AddDriverFormFields /> */}
      <div>
        <label htmlFor="firstName">First Name</label>
        <input type="text" name="firstName" id="firstName" required />
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input type="text" name="lastName" id="lastName" required />
      </div>
      {/* ... other driver fields ... */}
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.fieldErrors && /* display field errors */}
      {state?.driverId && <p style={{ color: 'green' }}>Driver added successfully! ID: {state.driverId}</p>}
      <SubmitButton buttonText="Add Driver" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/driverActions.ts` handle mutations for driver data.

- **`'use server';`**: Standard.
- **Data Mutations**: Creating new driver profiles, updating driver details, changing driver status (e.g., "active", "inactive").
- **Business Rule Enforcement**: Validating driver information (e.g., license validity), ensuring required qualifications are met.
- **Integration**: Called from driver management forms. `revalidatePath` or `revalidateTag` updates driver lists and profiles.

```typescript
// Example: lib/actions/driverActions.ts
'use server';

import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { driverSchema } from '@/validations/drivers'; // From validations/drivers.ts
import { auth } from '@clerk/nextjs/server';

export async function addDriverAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any; driverId?: string }> {
  const { userId, orgId: userOrgId } = auth();
  if (!userId) return { success: false, error: "User not authenticated." };

  const submittedOrgId = formData.get('orgId') as string;
  // Add orgId validation

  const rawData = Object.fromEntries(formData);
  const validatedFields = driverSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // const newDriver = await prisma.driver.create({
    //   data: { ...validatedFields.data, orgId: submittedOrgId },
    // });
    const newDriverId = "driver_" + Date.now(); // Placeholder
    console.log("Driver added:", validatedFields.data);

    revalidatePath(`/tenant/${submittedOrgId}/drivers`);
    revalidateTag(`drivers-${submittedOrgId}`);
    return { success: true, driverId: newDriverId };
  } catch (error) {
    console.error('Error adding driver:', error);
    return { success: false, error: 'Failed to add driver.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/driverFetchers.ts` retrieve driver information.

- **Data Retrieval**: `getAllDrivers(orgId)`, `getDriverById(driverId)`, `getDriverAssignments(driverId)`.
- **Efficiency**: Queries filter by organization and status. Data is cached.
- **Consistency**: Standardized access to driver profiles.

```typescript
// Example: lib/fetchers/driverFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { Driver } from '@/types/drivers'; // From types/drivers.ts
import { unstable_cache as cache } from 'next/cache';

export async function getAllDrivers(orgId: string): Promise<Driver[]> {
  return cache(async () => {
    // const drivers = await prisma.driver.findMany({
    //   where: { orgId, status: 'ACTIVE' }, // Example filter
    //   orderBy: { lastName: 'asc' },
    // });
    // return drivers;
    return [{ // Placeholder
      id: "driver1", orgId, firstName: "John", lastName: "Doe", 
      email: "john.doe@example.com", phone: "555-1234", status: "ACTIVE",
      availabilityStatus: "available"
    }];
  }, [`all-drivers-${orgId}`], {
    tags: [`drivers-${orgId}`],
    revalidate: 3600,
  })();
}

export async function getDriverById(driverId: string): Promise<Driver | null> {
  return cache(async () => {
    // const driver = await prisma.driver.findUnique({
    //   where: { id: driverId },
    //   // include: { qualifications: true, documents: true } // Example includes
    // });
    // return driver;
    if (driverId === "driver1") { // Placeholder
        return {
            id: "driver1", orgId: "org123", firstName: "John", lastName: "Doe",
            email: "john.doe@example.com", phone: "555-1234", status: "ACTIVE",
            availabilityStatus: "available"
        };
    }
    return null;
  }, [`driver-${driverId}`], {
    tags: [`driver-${driverId}`],
    revalidate: 3600,
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/drivers/`)**: Display driver lists and profiles, using Fetchers.
- **Feature Components (`features/drivers/`)**: Manage adding/editing driver profiles.
- **UI Components (`components/drivers/`)**: Render driver cards, profile details, form fields.
- **Server Actions (`lib/actions/driverActions.ts`)**: Handle creation and updates of driver data.
- **Fetchers (`lib/fetchers/driverFetchers.ts`)**: Provide driver data to various parts of the application.
- **Types/Validations**: `types/drivers.ts`, `validations/drivers.ts`.

---

## IFTA Domain

### 1. Domain Architecture Overview

The IFTA (International Fuel Tax Agreement) domain handles the tracking of fuel purchases and mileage traveled in different jurisdictions for tax reporting purposes.

- **Frontend**: Routes under `app/(tenant)/[orgId]/ifta/` provide interfaces for entering trip logs, fuel purchases, and generating IFTA reports.
- **Backend**: Server Actions record trip data and fuel purchases. Fetchers retrieve this data for reporting. Complex calculations for IFTA reports might be handled in Server Actions or dedicated utility functions.

### 2. UI Components (Dumb Components)

Located in `components/ifta/` and `components/shared/ui/`.

- **Responsibilities**: Displaying IFTA report tables (`IftaReportTable`), forms for trip logs (`IftaTripTable`) and fuel purchases.
- **Stateless & Reusable**: Components for entering jurisdictional mileage or fuel purchase details.
- **Examples**:
    - `JurisdictionMileageInputRow`: A row in a form for entering miles per state/province.
    - `FuelPurchaseFormFields`: Inputs for date, location, gallons, cost of fuel.
    - `IftaSummaryTable`: Displays calculated taxes owed or refunded per jurisdiction.

```tsx
// Example: components/ifta/FuelPurchaseCard.tsx
import React from 'react';
import { FuelPurchase } from '@/types/ifta'; // From types/ifta.ts

interface FuelPurchaseCardProps {
  purchase: FuelPurchase;
}

export function FuelPurchaseCard({ purchase }: FuelPurchaseCardProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
      <p>Date: {new Date(purchase.date).toLocaleDateString()}</p>
      <p>Jurisdiction: {purchase.jurisdiction}</p>
      <p>Gallons: {purchase.gallons}</p>
      <p>Cost: ${purchase.cost.toFixed(2)}</p>
    </div>
  );
}
```

### 3. Business Logic (Features)

Features in `features/ifta/` or pages like `app/(tenant)/[orgId]/ifta/reports/page.tsx` manage IFTA data entry and reporting.

- **Encapsulation**: `GenerateIftaReportFeature` could guide users through selecting a reporting period and then display the generated report.
- **Form Handling**: Forms for logging trips and fuel purchases use Server Actions.
- **Complex Interactions**: Calculating taxable miles, fuel consumed per jurisdiction, and tax liabilities based on varying rates.

```tsx
// Example: features/ifta/LogTripFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { logIftaTripAction } from '@/lib/actions/iftaActions';
import { SubmitButton } from '@/components/ui/submit-button';
// Assume TripLogFormFields component exists

export function LogTripFeature({ orgId, vehicleId }: { orgId: string; vehicleId: string }) {
  const [state, formAction, isPending] = useActionState(logIftaTripAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      {/* <TripLogFormFields /> */}
      {/* Fields for date, origin, destination, miles per jurisdiction etc. */}
      <div>
        <label htmlFor="tripDate">Trip Date</label>
        <input type="date" name="tripDate" id="tripDate" required />
      </div>
      {/* ... other trip log fields ... */}
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.tripId && <p style={{ color: 'green' }}>Trip logged successfully! ID: {state.tripId}</p>}
      <SubmitButton buttonText="Log Trip" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/iftaActions.ts` handle mutations for IFTA data.

- **`'use server';`**: Standard.
- **Data Mutations**: Creating trip logs, recording fuel purchases.
- **Business Rule Enforcement**: Validating data entries (e.g., ensuring mileage adds up), applying correct jurisdiction codes.
- **Integration**: Called from IFTA data entry forms. `revalidatePath` or `revalidateTag` updates IFTA data views.

```typescript
// Example: lib/actions/iftaActions.ts
'use server';

import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { iftaTripSchema } from '@/validations/ifta'; // From validations/ifta.ts
import { auth } from '@clerk/nextjs/server';

export async function logIftaTripAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any; tripId?: string }> {
  const { userId, orgId: userOrgId } = auth();
  if (!userId) return { success: false, error: "User not authenticated." };
  
  const submittedOrgId = formData.get('orgId') as string;
  // Add orgId validation

  const rawData = Object.fromEntries(formData);
  // Process jurisdictional mileage data if it's complex (e.g., JSON string or multiple fields)
  const validatedFields = iftaTripSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // const newTrip = await prisma.iftaTripLog.create({
    //   data: { ...validatedFields.data, orgId: submittedOrgId },
    // });
    const newTripId = "ifta_trip_" + Date.now(); // Placeholder
    console.log("IFTA trip logged:", validatedFields.data);

    revalidatePath(`/tenant/${submittedOrgId}/ifta`);
    revalidateTag(`ifta-trips-${submittedOrgId}`);
    return { success: true, tripId: newTripId };
  } catch (error) {
    console.error('Error logging IFTA trip:', error);
    return { success: false, error: 'Failed to log IFTA trip.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/iftaFetchers.ts` retrieve data for IFTA reports.

- **Data Retrieval**: `getIftaTripsForPeriod(orgId, period)`, `getFuelPurchasesForPeriod(orgId, period)`.
- **Efficiency**: Queries aggregate data by jurisdiction and filter by reporting period.
- **Consistency**: Standardized access to IFTA records.

```typescript
// Example: lib/fetchers/iftaFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { IftaTripLog, FuelPurchase } from '@/types/ifta'; // From types/ifta.ts
import { unstable_cache as cache } from 'next/cache';

export async function getIftaTripsForPeriod(orgId: string, startDate: Date, endDate: Date): Promise<IftaTripLog[]> {
  return cache(async () => {
    // const trips = await prisma.iftaTripLog.findMany({
    //   where: { orgId, tripDate: { gte: startDate, lte: endDate } },
    //   orderBy: { tripDate: 'asc' },
    // });
    // return trips;
    return [{ // Placeholder
      id: "trip1", orgId, vehicleId: "vehicle1", tripDate: new Date(),
      totalMiles: 200, jurisdictionalMiles: [{ jurisdiction: "CA", miles: 100 }, { jurisdiction: "NV", miles: 100 }]
    }];
  }, [`ifta-trips-${orgId}-${startDate.toISOString()}-${endDate.toISOString()}`], {
    tags: [`ifta-trips-${orgId}`],
    revalidate: 86400, // Daily revalidation for report data
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/ifta/`)**: Provide interfaces for data entry and report generation.
- **Feature Components (`features/ifta/`)**: Manage IFTA reporting workflows.
- **UI Components (`components/ifta/`)**: Render forms and tables for IFTA data.
- **Server Actions (`lib/actions/iftaActions.ts`)**: Record trip logs and fuel purchases.
- **Fetchers (`lib/fetchers/iftaFetchers.ts`)**: Provide data for IFTA reports.
- **Types/Validations**: `types/ifta.ts`, `validations/ifta.ts`.

---

## Settings Domain

### 1. Domain Architecture Overview

The Settings domain allows users to configure various aspects of the application, including company profile, user preferences, notification settings, and integrations. This is typically specific to a tenant/organization.

- **Frontend**: Routes under `app/(tenant)/[orgId]/settings/` provide forms and toggles for managing these configurations. Client Components are used for interactive settings forms.
- **Backend**: Server Actions handle the saving of settings. Fetchers retrieve current settings for display.

### 2. UI Components (Dumb Components)

Located in `components/settings/` and `components/shared/ui/`.

- **Responsibilities**: Displaying forms for various settings sections (e.g., `CompanySettingsForm`, `NotificationSettingsToggles`).
- **Stateless & Reusable**: Form field components are generic. Specific settings forms compose these.
- **Examples**:
    - `ProfileUpload`: Component for uploading a company logo or user avatar.
    - `ToggleSwitch`: A reusable switch for boolean settings.
    - `ApiKeyInput`: An input field for managing API keys for integrations.

```tsx
// Example: components/settings/ThemeSelector.tsx
'use client'; // Theme selection is interactive

import React from 'react';

interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <select value={currentTheme} onChange={(e) => onThemeChange(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

### 3. Business Logic (Features)

Features in `features/settings/` or pages like `app/(tenant)/[orgId]/settings/profile/page.tsx` manage different settings categories.

- **Encapsulation**: `ManageCompanyProfileFeature` would allow editing company details. `ConfigureNotificationPreferencesFeature` would handle notification toggles.
- **Form Handling**: Settings forms use Server Actions to persist changes. `useActionState` can provide feedback on save operations.
- **Complex Interactions**: Managing third-party integrations, which might involve OAuth flows or API key validation.

```tsx
// Example: features/settings/CompanyProfileSettings.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { updateCompanyProfileAction } from '@/lib/actions/settingsActions';
import { SubmitButton } from '@/components/ui/submit-button';
import { CompanyProfile } from '@/types/settings'; // Assuming types/settings.ts

interface CompanyProfileSettingsProps {
  orgId: string;
  initialProfile: CompanyProfile | null;
}

export function CompanyProfileSettings({ orgId, initialProfile }: CompanyProfileSettingsProps) {
  const [state, formAction, isPending] = useActionState(updateCompanyProfileAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      <div>
        <label htmlFor="companyName">Company Name</label>
        <input type="text" name="companyName" id="companyName" defaultValue={initialProfile?.companyName || ''} required />
      </div>
      {/* ... other company profile fields ... */}
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>Profile updated successfully!</p>}
      <SubmitButton buttonText="Save Profile" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/settingsActions.ts` handle saving various settings.

- **`'use server';`**: Standard.
- **Data Mutations**: Updating company profile, user preferences, notification settings.
- **Business Rule Enforcement**: Validating input data for settings.
- **Integration**: Called from settings forms. `revalidatePath` or `revalidateTag` ensures updated settings are reflected.

```typescript
// Example: lib/actions/settingsActions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { companyProfileSchema } from '@/validations/settings'; // Assuming validations/settings.ts
import { auth } from '@clerk/nextjs/server';

export async function updateCompanyProfileAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any }> {
  const { userId, orgId: userOrgId } = auth(); // Clerk's orgId
  if (!userId) return { success: false, error: "User not authenticated." };

  const submittedOrgId = formData.get('orgId') as string; // App's tenant orgId
  // Validate user has permission to update settings for submittedOrgId

  const rawData = Object.fromEntries(formData);
  const validatedFields = companyProfileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // await prisma.organizationProfile.update({ // Assuming a model for org profile
    //   where: { orgId: submittedOrgId },
    //   data: validatedFields.data,
    // });
    console.log("Company profile updated for org:", submittedOrgId, validatedFields.data);

    revalidatePath(`/tenant/${submittedOrgId}/settings/profile`);
    revalidateTag(`profile-${submittedOrgId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating company profile:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/settingsFetchers.ts` retrieve current settings configurations.

- **Data Retrieval**: `getCompanyProfile(orgId)`, `getUserNotificationPreferences(userId, orgId)`.
- **Efficiency**: Settings data is usually small and can be cached effectively.
- **Consistency**: Standardized access to settings.

```typescript
// Example: lib/fetchers/settingsFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { CompanyProfile, UserNotificationPreferences } from '@/types/settings'; // Assuming types/settings.ts
import { unstable_cache as cache } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function getCompanyProfile(orgId: string): Promise<CompanyProfile | null> {
  return cache(async () => {
    // const profile = await prisma.organizationProfile.findUnique({
    //   where: { orgId },
    // });
    // return profile;
    return { orgId, companyName: "Fleet Fusion Inc.", address: "123 Main St" }; // Placeholder
  }, [`profile-${orgId}`], {
    tags: [`profile-${orgId}`],
    revalidate: 3600,
  })();
}

export async function getUserNotificationPreferences(orgId: string): Promise<UserNotificationPreferences | null> {
  const { userId } = auth();
  if (!userId) return null;

  return cache(async () => {
    // const preferences = await prisma.userNotificationPreference.findUnique({
    //   where: { userId_orgId: { userId, orgId } },
    // });
    // return preferences || { emailNotifications: true, smsNotifications: false }; // Default
    return { userId, orgId, emailNotifications: true, smsNotifications: false }; // Placeholder
  }, [`notifications-${userId}-${orgId}`], {
    tags: [`notifications-${userId}-${orgId}`],
    revalidate: 3600,
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/settings/`)**: Organize different settings sections, using Fetchers for initial data.
- **Feature Components (`features/settings/`)**: Manage forms and interactions for specific settings categories.
- **UI Components (`components/settings/`)**: Render form elements and display current settings.
- **Server Actions (`lib/actions/settingsActions.ts`)**: Save updated settings.
- **Fetchers (`lib/fetchers/settingsFetchers.ts`)**: Provide current settings data.
- **Types/Validations**: `types/settings.ts`, `validations/settings.ts` (to be created or defined).

---

## Vehicles Domain

### 1. Domain Architecture Overview

The Vehicles domain is responsible for managing the fleet's vehicles, including their details, specifications, maintenance records, and current status.

- **Frontend**: Routes under `app/(tenant)/[orgId]/vehicles/` allow users to view vehicle lists, individual vehicle details, and forms for adding or editing vehicles and logging maintenance.
- **Backend**: Server Actions handle the creation and updating of vehicle information and maintenance logs. Fetchers retrieve vehicle data for display and for use in other domains like Dispatch or Compliance.

### 2. UI Components (Dumb Components)

Located in `components/vehicles/` and `components/shared/ui/`.

- **Responsibilities**: Displaying vehicle information (`VehicleCard`), lists of vehicles, forms for vehicle details and maintenance logs.
- **Stateless & Reusable**: `VehicleCard` takes vehicle data as props.
- **Examples**:
    - `VehicleDetailsView`: Shows comprehensive information about a vehicle.
    - `MaintenanceLogEntry`: Displays a single maintenance record.
    - `AddVehicleFormFields`: Inputs for make, model, VIN, year, etc.

```tsx
// Example: components/vehicles/VehicleStatusTag.tsx
import React from 'react';
import { VehicleStatus } from '@/types/vehicles'; // Assuming types/vehicles.ts

interface VehicleStatusTagProps {
  status: VehicleStatus;
}

export function VehicleStatusTag({ status }: VehicleStatusTagProps) {
  let color = 'gray';
  if (status === 'active') color = 'green';
  if (status === 'in_maintenance') color = 'orange';
  if (status === 'inactive') color = 'red';

  return (
    <span style={{ backgroundColor: color, color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
      {status.replace('_', ' ')}
    </span>
  );
}
```

### 3. Business Logic (Features)

Features in `features/vehicles/` or pages like `app/(tenant)/[orgId]/vehicles/[vehicleId]/page.tsx` manage vehicle-related operations.

- **Encapsulation**: `ManageVehicleDetailsFeature` could allow viewing and editing vehicle specs, assigning it to drivers, and viewing its maintenance history.
- **Form Handling**: Forms for adding new vehicles or logging maintenance use Server Actions.
- **Complex Interactions**: Scheduling maintenance, tracking vehicle utilization (linking to Analytics), managing vehicle documents (linking to Compliance).

```tsx
// Example: features/vehicles/AddVehicleFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { addVehicleAction } from '@/lib/actions/vehicleActions'; // Corrected to vehicleActions
import { SubmitButton } from '@/components/ui/submit-button';
// Assume AddVehicleFormFields component exists

export function AddVehicleFeature({ orgId }: { orgId: string }) {
  const [state, formAction, isPending] = useActionState(addVehicleAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="orgId" value={orgId} />
      {/* <AddVehicleFormFields /> */}
      <div>
        <label htmlFor="make">Make</label>
        <input type="text" name="make" id="make" required />
      </div>
      <div>
        <label htmlFor="model">Model</label>
        <input type="text" name="model" id="model" required />
      </div>
      {/* ... other vehicle fields ... */}
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.fieldErrors && /* display field errors */}
      {state?.vehicleId && <p style={{ color: 'green' }}>Vehicle added successfully! ID: {state.vehicleId}</p>}
      <SubmitButton buttonText="Add Vehicle" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/vehicleActions.ts` handle mutations for vehicle data.

- **`'use server';`**: Standard.
- **Data Mutations**: Creating new vehicle records, updating vehicle details, logging maintenance events, changing vehicle status.
- **Business Rule Enforcement**: Validating vehicle information (e.g., VIN format), ensuring maintenance schedules are followed.
- **Integration**: Called from vehicle management forms. `revalidatePath` or `revalidateTag` updates vehicle lists and details.

```typescript
// Example: lib/actions/vehicleActions.ts
'use server';

import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
import { vehicleSchema } from '@/validations/vehicles'; // From validations/vehicles.ts
import { auth } from '@clerk/nextjs/server';

export async function addVehicleAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any; vehicleId?: string }> {
  const { userId, orgId: userOrgId } = auth();
  if (!userId) return { success: false, error: "User not authenticated." };

  const submittedOrgId = formData.get('orgId') as string;
  // Add orgId validation

  const rawData = Object.fromEntries(formData);
  const validatedFields = vehicleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    // const newVehicle = await prisma.vehicle.create({
    //   data: { ...validatedFields.data, orgId: submittedOrgId },
    // });
    const newVehicleId = "vehicle_" + Date.now(); // Placeholder
    console.log("Vehicle added:", validatedFields.data);

    revalidatePath(`/tenant/${submittedOrgId}/vehicles`);
    revalidateTag(`vehicles-${submittedOrgId}`);
    return { success: true, vehicleId: newVehicleId };
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return { success: false, error: 'Failed to add vehicle.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/vehicleFetchers.ts` retrieve vehicle information.

- **Data Retrieval**: `getAllVehicles(orgId)`, `getVehicleById(vehicleId)`, `getVehicleMaintenanceHistory(vehicleId)`.
- **Efficiency**: Queries filter by organization and status. Data is cached.
- **Consistency**: Standardized access to vehicle profiles.

```typescript
// Example: lib/fetchers/vehicleFetchers.ts
// import { prisma } from '@/lib/database/prisma';
import { Vehicle } from '@/types/vehicles'; // Assuming types/vehicles.ts
import { unstable_cache as cache } from 'next/cache';

export async function getAllVehicles(orgId: string): Promise<Vehicle[]> {
  return cache(async () => {
    // const vehicles = await prisma.vehicle.findMany({
    //   where: { orgId, status: 'active' }, // Example filter
    //   orderBy: { make: 'asc' },
    // });
    // return vehicles;
    return [{ // Placeholder
      id: "vehicle1", orgId, make: "Freightliner", model: "Cascadia", year: 2022, vin: "123XYZ", status: "active"
    }];
  }, [`all-vehicles-${orgId}`], {
    tags: [`vehicles-${orgId}`],
    revalidate: 3600,
  })();
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle | null> {
  return cache(async () => {
    // const vehicle = await prisma.vehicle.findUnique({
    //   where: { id: vehicleId },
    //   // include: { maintenanceLogs: true, assignedDriver: true } // Example includes
    // });
    // return vehicle;
    if (vehicleId === "vehicle1") { // Placeholder
        return {
            id: "vehicle1", orgId: "org123", make: "Freightliner", model: "Cascadia", 
            year: 2022, vin: "123XYZ", status: "active"
        };
    }
    return null;
  }, [`vehicle-${vehicleId}`], {
    tags: [`vehicle-${vehicleId}`],
    revalidate: 3600,
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/vehicles/`)**: Display vehicle lists and details, using Fetchers.
- **Feature Components (`features/vehicles/`)**: Manage adding/editing vehicles and logging maintenance.
- **UI Components (`components/vehicles/`)**: Render vehicle cards, details, form fields.
- **Server Actions (`lib/actions/vehicleActions.ts`)**: Handle creation and updates of vehicle data.
- **Fetchers (`lib/fetchers/vehicleFetchers.ts`)**: Provide vehicle data to various parts of the application.
- **Types/Validations**: `types/vehicles.ts`, `validations/vehicles.ts`.

---

## Admin Domain

### 1. Domain Architecture Overview

The Admin domain is responsible for system-level administration tasks, which could include managing tenants (organizations), platform-wide user management (if applicable beyond Clerk's scope), system settings, and monitoring. This assumes an admin role within a specific tenant or a super-admin for the platform. For this example, we'll focus on tenant-level admin features.

- **Frontend**: Routes under `app/(tenant)/[orgId]/admin/` provide interfaces for managing users within the organization, organization settings, and potentially billing/subscription details.
- **Backend**: Server Actions handle administrative operations like inviting users to an organization, changing user roles, or updating organization-level settings. Fetchers retrieve data for admin dashboards.

### 2. UI Components (Dumb Components)

Located in `components/admin/` (if specific) or `components/settings/`, `components/shared/ui/`.

- **Responsibilities**: Displaying tables of users within the organization, forms for inviting users or changing roles, interfaces for managing organization subscriptions.
- **Stateless & Reusable**: Components for user role selection, tables displaying user lists.
- **Examples**:
    - `UserManagementTable`: Displays a list of users within the organization with options to edit roles or status.
    - `InviteUserForm`: Form to send an invitation to a new user to join the organization.
    - `RoleSelectorDropdown`: A dropdown to assign roles to users.

```tsx
// Example: components/admin/UserRoleBadge.tsx
import React from 'react';
// Assuming roles are simple strings like 'admin', 'dispatcher', 'driver'

interface UserRoleBadgeProps {
  role: string;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  let color = 'blue'; // Default
  if (role === 'admin') color = 'purple';
  if (role === 'driver') color = 'green';
  
  return (
    <span style={{ backgroundColor: color, color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
      {role}
    </span>
  );
}
```

### 3. Business Logic (Features)

Features in `features/admin/` or pages like `app/(tenant)/[orgId]/admin/users/page.tsx` manage administrative tasks.

- **Encapsulation**: `ManageOrganizationUsersFeature` could allow admins to invite, remove, and change roles of users within their organization.
- **Form Handling**: Forms for inviting users or modifying organization settings use Server Actions.
- **Complex Interactions**: Managing role-based access control (RBAC) configurations, audit logging of admin actions.

```tsx
// Example: features/admin/InviteUserFeature.tsx
'use client';

import React from 'react';
import { useActionState } from 'react';
import { inviteUserToOrgAction } from '@/lib/actions/adminActions';
import { SubmitButton } from '@/components/ui/submit-button';

interface InviteUserFeatureProps {
  orgId: string;
}

export function InviteUserFeature({ orgId }: InviteUserFeatureProps) {
  const [state, formAction, isPending] = useActionState(inviteUserToOrgAction, null);

  return (
    <form action={formAction}>
      <h4>Invite New User</h4>
      <input type="hidden" name="orgId" value={orgId} />
      <div>
        <label htmlFor="email">Email Address</label>
        <input type="email" name="email" id="email" required />
      </div>
      <div>
        <label htmlFor="role">Role</label>
        <select name="role" id="role" defaultValue="viewer" required>
          <option value="admin">Admin</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="driver">Driver</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      
      {state?.error && <p style={{ color: 'red' }}>Error: {state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>Invitation sent successfully!</p>}
      <SubmitButton buttonText="Send Invitation" />
    </form>
  );
}
```

### 4. Server Actions

Server Actions in `lib/actions/adminActions.ts` handle administrative operations.

- **`'use server';`**: Standard.
- **Data Mutations**: Inviting users to an organization (potentially integrating with Clerk invitations), changing user roles within the organization, updating organization-level settings or subscription details.
- **Business Rule Enforcement**: Validating admin privileges before performing actions, ensuring role assignments are valid.
- **Integration**: Called from admin interface forms. `revalidatePath` or `revalidateTag` updates user lists or organization settings views.

```typescript
// Example: lib/actions/adminActions.ts
'use server';

import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/database/prisma';
// import { clerkClient, auth } from '@clerk/nextjs/server'; // For Clerk interactions
import { z } from 'zod';

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.string(), // Consider an enum for roles
  orgId: z.string(),
});

export async function inviteUserToOrgAction(
  prevState: any, 
  formData: FormData
): Promise<{ success: boolean; error?: string; fieldErrors?: any }> {
  // const { userId, orgId: adminOrgId, sessionClaims } = auth(); // Current admin's auth info
  // if (!userId || !sessionClaims?.metadata?.role?.includes('admin') || adminOrgId !== formData.get('orgId')) {
  //   return { success: false, error: "Unauthorized or mismatched organization." };
  // }

  const validatedFields = inviteUserSchema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { success: false, error: "Invalid data.", fieldErrors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { email, role, orgId } = validatedFields.data;

  try {
    // Example: Using Clerk to create an organization invitation
    // await clerkClient.organizations.createOrganizationInvitation({
    //   organizationId: orgId,
    //   inviterUserId: userId,
    //   emailAddress: email,
    //   role: role, // Clerk roles might be 'org:admin', 'org:member'
    // });

    // Or, if managing roles internally:
    // await prisma.userOrganizationRole.create({ data: { email, orgId, role }});
    console.log(`Invitation sent to ${email} for role ${role} in org ${orgId}`);

    revalidatePath(`/tenant/${orgId}/admin/users`);
    return { success: true };
  } catch (error: any) {
    console.error('Error inviting user:', error);
    // Handle specific Clerk errors if applicable, e.g., error.errors[0].message
    return { success: false, error: error.message || 'Failed to send invitation.' };
  }
}
```

### 5. Fetchers

Fetchers in `lib/fetchers/adminFetchers.ts` retrieve data for admin interfaces.

- **Data Retrieval**: `getOrganizationUsers(orgId)`, `getOrganizationSubscriptionDetails(orgId)`, `getSystemAuditLogs(orgId, range)`.
- **Efficiency**: Queries filter by organization. Data is cached. Access control is critical.
- **Consistency**: Standardized access to administrative data.

```typescript
// Example: lib/fetchers/adminFetchers.ts
// import { prisma } from '@/lib/database/prisma';
// import { clerkClient, auth } from '@clerk/nextjs/server';
import { OrganizationUser } from '@/types/admin'; // Assuming types/admin.ts
import { unstable_cache as cache } from 'next/cache';

export async function getOrganizationUsers(orgId: string): Promise<OrganizationUser[]> {
  // const { sessionClaims } = auth();
  // if (!sessionClaims?.metadata?.role?.includes('admin')) { // Basic role check
  //   // Or check if current user is admin of the *specific* orgId
  //   return []; 
  // }

  return cache(async () => {
    // Example: Fetching members from Clerk
    // const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId });
    // const users = memberships.map(mem => ({
    //   id: mem.publicUserData?.userId || '',
    //   firstName: mem.publicUserData?.firstName || '',
    //   lastName: mem.publicUserData?.lastName || '',
    //   email: mem.publicUserData?.identifier || '', // This might not be email directly
    //   role: mem.role, 
    // }));
    // return users;

    // Placeholder if managing users internally:
    // const users = await prisma.user.findMany({
    //   where: { memberships: { some: { orgId: orgId } } },
    //   select: { id: true, firstName: true, lastName: true, email: true, memberships: { where: { orgId } } }
    // });
    // return users.map(u => ({ ...u, role: u.memberships[0].role }));
    return [{ // Placeholder
      id: "user123", firstName: "Admin", lastName: "User", email: "admin@example.com", role: "admin", orgId
    }];
  }, [`org-users-${orgId}`], {
    tags: [`org-users-${orgId}`],
    revalidate: 3600,
  })();
}
```

### 6. Integration

- **Pages (`app/(tenant)/[orgId]/admin/`)**: Display admin dashboards and management interfaces, using Fetchers.
- **Feature Components (`features/admin/`)**: Manage user invitations, role changes, or organization settings updates.
- **UI Components (`components/admin/`, `components/shared/ui/`)**: Render tables, forms, and selectors for admin tasks.
- **Server Actions (`lib/actions/adminActions.ts`)**: Handle administrative operations.
- **Fetchers (`lib/fetchers/adminFetchers.ts`)**: Provide data for admin views.
- **Types/Validations**: `types/admin.ts`, `validations/admin.ts` (to be created or defined). Clerk types would also be relevant.

---
