# ✅ **FleetFusion Project Setup TODO (VS Code Copilot - Agentic Mode)**

---

## 🗂️ Task Overview:

This task involves restructuring your Next.js 15, React 19, TypeScript 5, TailwindCSS 4, and ShadCN UI project to create a modern, fully-featured multi-tenant ABAC SaaS Transportation Management System (TMS). Your target users are freight and logistics SMEs in Southern New Mexico.

Ensure a complete integration using Clerk for Attribute-Based Access Control (ABAC) authentication and Neon PostgreSQL as your primary database, synchronized via Clerk webhooks.

---

## ✅ **Order of Completion & Detailed Instructions:**

### 1️⃣ **Setup and Scaffolding:**

* **Restructure your directory clearly by domain**, following this precise structure:

  ```
  /
  ├── public/            # Marketing & legal: terms, privacy, refund, pricing, about, features, services, contact, blog
  ├── app/
  │   ├── globals.css    # TailwindCSS v4 custom CSS vars and class overrides (Dark Theme Only)
  │   ├── auth/          # Auth-related: sign-in, sign-up, sign-out, onboarding, org-selection, forgot-password, profile, billing
  │   └── tenant/        # Tenant-specific features: dashboard, dispatch, drivers, vehicles, compliance, ifta, analytics, settings
  ├── components/
  │   ├── shared/        # Dumb UI components only, utilizing ShadCN primitives
  │   └── domain/        # Domain-specific layouts & view shells for tenant/auth/public pages
  ├── features/          # Business logic and server-side actions per feature
  ├── lib/
  │   ├── fetchers/      # Data fetching utilities (GET)
  │   └── actions/       # Mutations and server actions (POST, PUT, DELETE)
  ├── types/             # TypeScript types, interfaces, and enums
  ├── validations/       # Zod validation schemas
  ├── db/                # Database utilities and connections (Neon PostgreSQL)
  └── middleware/        # Clerk ABAC logic, redirects, and UX flow control
  ```
* **Label each directory and file clearly and concisely** with descriptive, intuitive naming conventions.
* **Ensure thorough commenting** throughout to clearly explain purpose, data flow, and integration points.

---

### 2️⃣ **Authentication & Authorization (Clerk ABAC):**

* Implement Clerk for authentication with ABAC for tenant roles & permissions.
* Define clear roles (`admin`, `dispatcher`, `driver`, etc.) and custom session claims.
* Set up Clerk webhooks to synchronize roles and tenant data directly with Neon PostgreSQL, clearly documenting how webhook sync is managed.

---

### 3️⃣ **Database Integration (Neon PostgreSQL):**

* Configure Neon PostgreSQL connection pooling and ORM (Drizzle or Prisma).
* Structure schemas clearly by domain and tenant separation:

  ```
  tenants (
    id UUID PRIMARY KEY,
    org_id VARCHAR UNIQUE NOT NULL, -- Clerk Org ID
    name VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )

  users (
    id UUID PRIMARY KEY,
    clerk_user_id VARCHAR UNIQUE NOT NULL, -- Clerk User ID
    tenant_id UUID REFERENCES tenants(id),
    role VARCHAR NOT NULL, -- ABAC role
    ...
  )

  vehicles, drivers, dispatches, compliance, invoices, ifta_reports...
  ```
* Clearly document all schema relations, indexes, constraints, and synchronization processes.

---

### 4️⃣ **Tenant Pages UI Implementation (ShadCN UI Components):**

* Implement fully-featured, modular UI pages using React v19 and ShadCN v2 components:

  * **Dashboard:** Metrics, quick summaries, key operational data visualizations.
  * **Dispatch:** Real-time job assignments, scheduling, status tracking.
  * **Drivers:** Driver profiles, certifications, assignments, status updates.
  * **Vehicles:** Fleet management, maintenance tracking, vehicle status.
  * **Compliance:** Regulatory filings, documentation, alerts, and notifications.
  * **IFTA:** Fuel tax reporting interface and data collection.
  * **Analytics:** Operational analytics, visual data charts, and performance metrics.
  * **Settings:** User, tenant, billing, and notification preferences.
* Implement **custom sign-in/sign-up/onboarding flows** clearly integrated with Clerk.
* Include standard auth pages: sign-out, forgot-password, org-selection, profile management, and billing pages.
* **Document clearly each page/component**, describing its purpose, props, and context of use.

---

### 5️⃣ **TailwindCSS Styling & Dark Theme Accessibility:**

* **Implement accessible, visually legible dark-only theme** (no mode toggling).
* Document all TailwindCSS v4 customizations in `globals.css` clearly with:

  * Spacing scales
  * Font selections & sizes (headings, body, labels, inputs)
  * Custom CSS variables for consistent color scheme (background, primary, secondary, accent, destructive, success, warning, neutral shades)
* Use intuitive, accessible contrast ratios to handle UI complexities like tables, charts, and forms clearly and legibly.

Example documentation snippet:

| Variable          | Purpose          | Hex       | RGB          | Tailwind Class                |
| ----------------- | ---------------- | --------- | ------------ | ----------------------------- |
| `--color-bg`      | Page backgrounds | `#121212` | `18,18,18`   | `bg-bg`                       |
| `--color-primary` | Main brand color | `#3B82F6` | `59,130,246` | `text-primary` / `bg-primary` |

---

### 6️⃣ **Modularity, Reusability & Separation of Concerns:**

* Strictly maintain separation of concerns:

  * Dumb UI: `components/shared/`
  * Domain-specific UI shells/layouts: `components/domain/`
  * Logic (API calls, mutations): `features/`, `lib/fetchers`, `lib/actions`
  * Types, validation schemas: `types/`, `validations/`
  * Database integration and middleware clearly isolated and modular.

---

### 7️⃣ **Middleware and Redirect Logic:**

* Clearly document and implement middleware logic for:

  * Route protection based on ABAC roles (Clerk).
  * Client-side & server-side redirects for onboarding and unauthorized access flows.
* Explicitly note Clerk session handling and custom session claim checks for each middleware logic segment.

---

### 8️⃣ **Comprehensive Documentation:**

* Provide **clear, descriptive documentation** in markdown (`README.md`) covering:

  * Project structure overview & reasoning
  * Clerk ABAC integration steps
  * Neon PostgreSQL schema & webhook synchronization
  * TailwindCSS theming guidelines
  * ShadCN UI usage guidelines & component directory conventions
  * Middleware usage & logic clearly explained
  * Complete example setups for onboarding and tenant feature implementations

---

## ✅ **Final Checks (Completion Checklist):**

* [ ] Directory structure is strictly domain-driven as instructed.
* [ ] Clerk ABAC roles clearly defined, synced via webhook to Neon PostgreSQL.
* [ ] UI pages fully modular, accessible dark theme only, clearly documented.
* [ ] CSS customizations documented explicitly in `globals.css`.
* [ ] Middleware clearly handling redirects, ABAC permissions, session claims.
* [ ] All business logic and UI strictly separated, clearly organized.
* [ ] Comprehensive documentation provided clearly in markdown.

---

### 🛠️ **Additional Recommendations:**

* Setup continuous integration (CI/CD) with GitHub Actions & deployment to Vercel for streamlined workflow.
* Consider implementing detailed logging and analytics for robust operational insights and error handling.
* Future-proof your architecture by abstracting DB/API layers for easy scalability and maintainability.

---

# UI/UX Standardization TODO List

## 1. Typography System

<input disabled="" type="checkbox"> Create consistent text hierarchies

Standardize heading sizes across all components (especially in cards and dialogs)
Define specific text sizes for different UI contexts (cards, tables, forms)
Establish clear rules for font weights (currently inconsistent between components)

<input disabled="" type="checkbox"> Standardize text colors

Create reusable text color utility classes instead of inline text-muted-foreground
Document proper usage of text emphasis levels

## 2. Spacing System

<input disabled="" type="checkbox"> Establish spacing scale

Currently mixing gap-2, gap-4 inconsistently across components
Define spacing tokens (xs, sm, md, lg, xl) with consistent rem/px values
Create spacing documentation for different component types

<input disabled="" type="checkbox"> Standardize padding/margin patterns

Card padding is inconsistent (compare vehicle-card vs. other cards)
Modal/dialog internal spacing varies throughout the app
Create consistent spacing between related elements

## 3. Component Standardization

<input disabled="" type="checkbox"> Badge standardization

Create a consistent pattern for status badges instead of inline styling
Extract the getStatusColor logic into a shared utility
Standardize badge sizing (currently varies across components)

<input disabled="" type="checkbox"> Card patterns

Define standard card layouts for different content types
Standardize card header/content/footer spacing
Create consistent patterns for information display in cards

<input disabled="" type="checkbox"> Dialog/modal patterns

Standardize dialog content structure and spacing
Create reusable patterns for common dialog layouts
Improve scrollable content handling in dialogs

## 4. Layout Systems

<input disabled="" type="checkbox"> Grid system refinement

Standardize grid breakpoints across the application
Create consistent column patterns for similar content types
Refine responsive behavior of grid layouts

<input disabled="" type="checkbox"> Flex layout standardization

Create standard flex layout utilities for common patterns
Standardize gap spacing in flex layouts
Establish consistent alignment patterns

## 5. Color System

<input disabled="" type="checkbox"> Status color system

Extract all status color logic into a shared utility
Create consistent color tokens for status indicators
Document status color usage patterns

<input disabled="" type="checkbox"> Background color consistency

Standardize background colors for different UI regions
Create consistent hover/active state colors

## 6. UI Elements

<input disabled="" type="checkbox"> Icon usage

Standardize icon sizing (currently using multiple size classes)
Create consistent icon + text spacing patterns
Establish standard colors for different icon contexts

<input disabled="" type="checkbox"> Button standardization

Ensure consistent button styling across similar actions
Standardize icon placement in buttons
Create consistent hover/focus states

## 7. Component Architecture

<input disabled="" type="checkbox"> Extract repeated patterns

Create reusable "StatusBadge" component to replace custom badge styling
Build shared "InfoItem" component for label+value patterns
Develop standard "CardSection" components for common layouts

<input disabled="" type="checkbox"> Style composition

Leverage more CSS composition for repeated patterns
Consider using more variants in component definitions
Improve className handling for better maintainability


![alt text](.vscode/Screenshot_22-5-2025_21407_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)

![alt text](.vscode/Screenshot_22-5-2025_213859_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)

![alt text](.vscode/Screenshot_22-5-2025_213913_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)

![alt text](.vscode/Screenshot_22-5-2025_213927_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)

![alt text](.vscode/Screenshot_22-5-2025_213952_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)

![alt text](.vscode/Screenshot_22-5-2025_214035_kzmksml6rbxw1cpvf422.lite.vusercontent.net.jpeg)