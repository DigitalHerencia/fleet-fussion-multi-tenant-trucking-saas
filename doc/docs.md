* **Developer Docs**: Split into `PRD.md`, `TECHNICAL_SPEC.md`, and `APPENDIX.md`—with structured sections, tables, and architecture notes.
* **User Docs**: GitHub-flavored markdown covering QuickStart, FAQ, Troubleshooting, Reference Sheets for each role (admin, dispatcher, driver, compliance officer), and module-level guides.

## Developer Documentation

# FleetFusion Product Requirements Document (PRD)

## Overview

FleetFusion is a modern, multi-tenant fleet management platform for logistics and transportation companies. It provides robust tools for dispatching, driver management, vehicle tracking, regulatory compliance, IFTA reporting, analytics, and more. The platform is built using Next.js 15 (for web interface), TypeScript 5, and leverages a PostgreSQL database (via Drizzle ORM). User authentication and organization management are handled through Clerk's service, enabling multi-organization (multi-tenant) support out-of-the-box.

## Target Users

* **Fleet Owners / Managers:** Oversee all operations and need an all-in-one view of fleet performance.
* **Dispatchers:** Plan and assign loads to drivers and vehicles, and monitor delivery progress.
* **Drivers:** Execute deliveries and interact with the system to get assignments and record statuses.
* **Compliance Officers:** Ensure that all drivers and vehicles meet regulatory requirements (document expiration, hours of service, etc.).
* **Accountants/IFTA Clerks:** Handle fuel tax reporting (IFTA) and other financial record-keeping related to fleet operations.

## Core Features

* **Multi-Tenancy:** Each company (tenant) has isolated data and user management. Users belong to organizations so that data never leaks across companies.
* **User Management & Authentication:** Integration with Clerk for user sign-up, login, and organization (company) invites. Role-based access control ensures users see and do only what their role permits.
* **Driver Management:** Maintain driver profiles including licenses, contact info, and compliance statuses. Track each driver’s status (active, on leave, etc.) and keep important documents (license, medical certificate) on file with expiry alerts.
* **Vehicle Management:** Keep a registry of vehicles with details like VIN, plate, maintenance records, and inspection dates. Assign vehicles to loads and track their availability and service status.
* **Dispatch & Load Management:** Create and dispatch loads (shipments) with origins, destinations, cargo details, etc. Assign drivers and vehicles to each load. Provide dispatchers with a dashboard to monitor active loads, track progress in real time, and make adjustments.
* **Compliance Management:** Store and manage compliance documents (e.g., driver licenses, insurance, inspection forms). Provide a compliance dashboard with alerts for upcoming expirations and an audit log of compliance-related activities.
* **IFTA Reporting:** Assist with International Fuel Tax Agreement (IFTA) compliance by tracking miles driven per jurisdiction and fuel purchases. Generate periodic IFTA reports that can be used for filings.
* **Analytics & Reporting:** Offer dashboards and reports for key metrics like fleet utilization, on-time delivery rate, fuel efficiency, and costs. Allow filtering and drill-down to investigate specific aspects of operations.
* **Settings & Configuration:** Allow admins to configure company-wide settings such as user roles, notification preferences, and possibly billing information. This includes managing which users have which roles within the platform.

## User Stories

* *As a fleet manager, I want to easily onboard my company into FleetFusion and invite my team members, so that we can start using the system quickly.*
* *As a dispatcher, I want to create a new load and assign it to a driver and vehicle, so that I can schedule a delivery for a customer.*
* *As a driver, I want to see the deliveries assigned to me and update the status (picked up, delivered) and upload proof of delivery, so that the office knows the job status in real time.*
* *As a compliance officer, I want to be notified when a required document (like a vehicle inspection or a driver’s license) is about to expire, so I can take action to renew it and stay compliant.*
* *As an accountant, I want to generate a fuel tax report for last quarter’s operations, so that I can file our IFTA report accurately and on time.*

## Success Metrics

* **Reduced Onboarding Time:** How quickly a new company can fully set up their fleet and users in the system (goal: within one day of signing up).
* **Operational Efficiency:** Reduction in manual paperwork and phone calls (e.g., percentage of dispatches managed digitally through the system).
* **Compliance Adherence:** Fewer compliance violations (e.g., no driver is on the road with an expired license or vehicle inspection, as tracked by the system alerts).
* **User Engagement:** Active usage by dispatchers and drivers (measured by logins per day or loads completed through the system) indicating the platform becomes a core part of daily operations.
* **Retention & Satisfaction:** Companies continue to use FleetFusion over time (low churn rate) and report satisfaction (via feedback or NPS scores) due to time saved and improved oversight.

*See the [Technical Specification](TECHNICAL_SPEC.md) for the technical architecture and design that support these product requirements.*

# FleetFusion Technical Specification

## Architecture Overview

* **Framework:** Next.js 15 using the App Router and React 19. The project primarily uses React Server Components for rendering, which allows efficient server-side data fetching and minimal client-side overhead.
* **Language & Runtime:** TypeScript 5 for all frontend and backend code, enforcing strict typing. The Node.js runtime is utilized via Vercel serverless functions for backend logic.
* **Database:** PostgreSQL is used as the primary data store, with schema and queries managed through the Drizzle ORM. The database is hosted on Neon (a cloud Postgres provider). All data is partitioned by company (multi-tenant design).
* **Authentication & Users:** Clerk is integrated for authentication, user management, and organization (tenant) management. Clerk provides a drop-in auth UI and handles user sessions, while FleetFusion uses Clerk’s organization feature to separate data by company.
* **UI & Styling:** The UI is built with reusable components and styled using Tailwind CSS 4. Design tokens and a utility-first approach ensure consistent styling. The app supports dark mode (via a CSS class strategy).
* **Project Structure:** The codebase is organized for clarity and scalability:

  * `app/` – Next.js routes, including pages and layouts (organized by feature or section of the app).
  * `components/` – Reusable presentational (dumb) components that are not tied to a single domain.
  * `features/` – Domain-specific (smart) components and hooks for each feature (e.g., dispatch, compliance, etc.), often composed of general components plus feature-specific logic.
  * `lib/` – Shared library code, such as utility functions, custom hooks, and especially **server actions** and **fetchers** (subdirectories like `lib/actions` and `lib/fetchers` contain all server-side mutation and data retrieval logic).
  * `types/` – TypeScript type definitions that are shared across the app (e.g., domain models, API response shapes).
  * `db/` – Database schema (in `schema.ts` using Drizzle ORM definitions) and migration files.
  * `docs/` – Documentation (product specs, technical docs, guides).
* **API Routes:** Next.js API routes under `app/api/` are used sparingly. Only a few endpoints exist, primarily for webhook handling (e.g., Clerk webhooks) and any third-party callbacks or public APIs. Most internal actions use server actions instead of REST endpoints.
* **State Management:** There is minimal use of client-side state libraries since React's built-in Context and server-side state cover most needs. Temporary UI state is managed with React hooks within client components.

## Security

* **Content Security Policy (CSP):** A strict CSP is configured to only allow required sources (including those needed for Clerk and Vercel analytics). This helps prevent XSS attacks by disallowing unauthorized scripts or resources.
* **Secure Headers:** The application sets security-related HTTP headers via Next.js middleware or Vercel configuration. These include headers like `X-Frame-Options`, `X-XSS-Protection`, and `Strict-Transport-Security` to enforce secure browsing contexts.
* **Authentication & Access Control:** FleetFusion relies on Clerk's secure session tokens (JWTs) which include organization context. Server-side checks and middleware ensure that only authenticated users (with valid roles/permissions) can access protected routes or perform actions.
* **Multi-Tenant Isolation:** Every database query or mutation enforces a `companyId` filter (either implicitly via the relationships or explicitly in query conditions). This prevents any data leakage between tenant organizations. Additionally, the UI is scoped per organization (users can only see their company's data).
* **Input Validation & Error Handling:** All form submissions and API payloads are validated using schemas (e.g., Zod schemas for request bodies). This ensures that the data meets expected formats and prevents bad data from causing runtime errors or security issues (like SQL injection or crashes). Errors are caught and handled gracefully, with user-friendly messages or fallback UI states.

## Integrations

* **Clerk Authentication:** Third-party authentication is fully handled by Clerk. This covers user sign-up, email verification, password management, and organization invite workflows. The integration uses Clerk’s Next.js SDK for front-end components and server-side helpers. Clerk webhooks notify FleetFusion of changes, which are processed to sync with the internal database (see Appendix for details).
* **Vercel Platform:** Deployment and hosting are through Vercel. The app takes advantage of Vercel's serverless functions for API routes and edge network for global CDN caching of assets. Vercel Analytics might be used for traffic and performance insights. The project is configured to build and deploy automatically via Vercel on new commits to the main branch (continuous deployment).
* **Future Integrations:** *(Placeholders for potential integrations)* The architecture allows adding integrations such as map APIs (for route tracking) or ELD devices (for driver logs) by creating new API routes or server actions for those external services.

## Testing

* **Unit Testing:** Key utilities and logic in `lib/` (like validation schemas, calculation functions, etc.) include unit tests. These ensure that individual functions behave correctly given various inputs.
* **Integration Testing:** The server actions and critical components are tested in integration, meaning a test might call an action with a fake request context and verify it interacts with the database (often using a test database or transaction rollback strategy) as expected.
* **End-to-End (E2E) Testing:** End-to-end tests simulate user workflows in a staging environment or using tools like Playwright/Cypress. Major user flows such as the onboarding process, dispatch creation, and compliance document upload are covered. These tests ensure that all pieces (frontend, backend, database, third-party auth) work together correctly.
* **Automated CI Checks:** All tests are run in CI for each commit. Linting (ESLint) and type-checking (TypeScript compiler) are also part of the pipeline to catch errors early. Only code that passes all checks is deployed to production.

## Deployment

* **Environment Setup:** Before deployment, ensure that all necessary environment variables are set (Clerk API keys, database URL, etc.). The repository provides an `.env.example` listing required keys. In production (Vercel), these variables are configured in the project settings. In development, a `.env.local` file is used.
* **Vercel Deployment:** The application is deployed on Vercel, which handles building and serving the Next.js app. Commits to the main branch trigger Vercel to build and deploy the latest version. Vercel handles scaling, SSL (HTTPS), and CDN distribution automatically.
* **CI/CD Pipeline:** A GitHub Actions workflow is set up to automate testing and deployment:

  * On push or merge to `main`, the workflow runs the test suite and build process.
  * If tests pass, it uses Vercel's CLI or API (with stored credentials) to initiate a deployment of the new build.
  * This ensures that only validated code is deployed. (Additionally, branch protections may require that pull requests pass all CI checks before merging.)
* **Post-Deployment Monitoring:** After deployment, admins or developers verify core functionality. Integration with monitoring tools (e.g., Sentry for error tracking) helps catch runtime exceptions or performance issues in production. Vercel’s dashboard and logs are also used to monitor each deployment and can roll back to a previous deployment if a serious issue is discovered.

*For more detailed diagrams, data flows, and integration configurations (e.g., Clerk authentication flows, multi-tenancy enforcement, and CI/CD setup), see the [Appendix](APPENDIX.md).*

# Appendix

## Authentication and Clerk Integration

**Environment & Configuration:** FleetFusion uses [Clerk](https://clerk.com/) for authentication and organization management. In development, a Clerk instance (e.g., `driving-gelding-14.clerk.accounts.dev`) is configured, and a separate instance (with production keys) is used in production. Key environment variables include:

| Environment Variable                | Description                          | Example value                              |
| ----------------------------------- | ------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend (publishable) API key | `pk_live_...` (prod) / `pk_test_...` (dev) |
| `CLERK_SECRET_KEY`                  | Clerk backend secret API key         | `sk_live_...` (prod) / `sk_test_...` (dev) |
| `CLERK_WEBHOOK_SECRET`              | Secret for verifying Clerk webhooks  | `whsec_xxx...`                             |
| `NEXT_PUBLIC_APP_URL`               | Base URL of the application          | `https://fleet-fusion.vercel.app` (prod)   |

Make sure to configure the Clerk dashboard with the correct allowed domains and redirect URLs for both development and production. For example, when developing locally with an ngrok tunnel, add the ngrok domain to Clerk allowed origins and set the webhook URL to your ngrok address (e.g., `https://<subdomain>.ngrok-free.app/api/clerk/webhook-handler`).

**Onboarding Flow:** New users who sign up are guided through an onboarding process:

* The first user of an organization creates a company via an **Onboarding Wizard** (after sign-up) where they provide company details (name, DOT number, address, etc.).
* On submitting the onboarding form, FleetFusion updates the user's Clerk organization metadata (marking onboarding as complete and storing the company info in Clerk).
* After onboarding, the user (an Admin) is redirected to the main dashboard. The onboarding page is protected so that it cannot be accessed again once completed.
* During onboarding, role-based access control (RBAC/ABAC) is initialized: the user creating the org becomes the Admin by default.

**Roles and Permissions:** Clerk Organizations in FleetFusion define roles for each user within a company (organization). The main roles include:

* **Admin (org\:admin):** Full access, including managing users, settings, and billing.
* **Dispatcher (org\:dispatcher):** Can create and manage loads, assign drivers to vehicles, and monitor dispatch operations.
* **Driver (org\:driver):** Can view their own assigned loads, update load status (pickup/delivery), upload relevant documents, and log hours of service.
* **Compliance Officer (org\:compliance):** Can manage compliance documents (upload and review) and view compliance dashboards/reports.
* **Member (org\:member):** A default non-privileged role for basic access (if needed for additional team members with view-only or limited permissions).
* *(System roles:* **org\:sys\_**\*): These special permissions are used internally by Clerk for organization management (e.g., managing organization profiles, memberships, etc.). FleetFusion leverages these under the hood when syncing org data, but they are not assigned to end users directly.

FleetFusion uses an Attribute-Based Access Control (ABAC) approach:

* A user's JWT session token (from Clerk) includes their organization ID (`org.id`), role (`org.role`), and a list of permission strings (`org_membership.permissions`) derived from that role.
* The application checks these claims in Next.js Middleware and within server-side actions to enforce access control. For instance, an Admin role is required to access admin-only API routes or pages like the user management screen.
* All permission strings and their mappings to roles are defined in a central file (`lib/constants/permissions.ts`), making it easy to update roles or add new permissions. This central mapping is the source of truth for what each role can do.

**Forgot Password Flow:** FleetFusion extends Clerk's standard password-reset capability:

* The sign-in page includes a **Forgot Password?** link, leading to a dedicated **Forgot Password** page.
* The Forgot Password page uses Clerk's `useSignIn()` hook with a two-step flow: first, the user enters their email to request a reset code (sent via email); second, they submit that code along with a new password to complete the reset.
* On success, the user is redirected to the FleetFusion dashboard. This custom flow provides a seamless in-app experience for password resets, rather than using Clerk’s default hosted page.

**Sign Out:** The application uses Clerk's sign-out functionality via a custom **SignOutButton** component:

* The component invokes `useClerk()` from Clerk’s React library and calls `signOut({ redirectUrl: '/' })` on click, which ends the session and returns the user to the public homepage.
* This button is included in the protected dashboard navigation. It ensures that user session cookies are properly cleared and (with `redirectUrl`) that the user lands on a logged-out page.

**Webhook Integration:** Clerk webhooks keep FleetFusion’s database in sync with Clerk’s data:

* A webhook handler endpoint exists at `/api/clerk/webhook-handler`. Clerk is configured to send events like `organization.created`, `organizationMembership.created`, `organizationMembership.deleted`, and `user.created` to this endpoint.
* The webhook handler verifies each incoming event using the `CLERK_WEBHOOK_SECRET` to ensure authenticity.
* On receiving events, the handler performs the corresponding database updates:

  * For example, when an organization is created via Clerk (during onboarding), the handler will create a new entry in the `companies` table with the Clerk org ID and company name.
  * When a user joins an organization, a new `company_users` record is inserted, linking that user (by Clerk user ID) to the company (with a role).
  * If a user or membership is removed, the handler will mark records accordingly (or delete, depending on design) to keep data consistent.
* This design means the Neon PostgreSQL database always reflects the current state of organizations, members, and users as known by Clerk.

## Multi-Tenancy and Data Isolation

FleetFusion is designed as a multi-tenant application, meaning multiple companies (tenants) share the platform but have isolated data:

* **Organization-to-Company Mapping:** Each Clerk Organization corresponds to a record in the `companies` database table. The Clerk `org.id` is stored as an identifier in that table (`clerkOrgId`), allowing lookups from auth context to database records.
* **Company Context in Application:** Once logged in, a user selects (or is defaulted to) an active company context (if they belong to more than one organization). This context is passed through the app (via a React context provider and Next.js middleware) so that every page and action knows the current `companyId`.
* **Scoped Database Queries:** All database queries performed via the Drizzle ORM include a `where companyId = ...` clause for tables that contain tenant data. For convenience, relationships in Drizzle are set up such that, for example, fetching a driver by ID will inherently require matching the `companyId` of that driver to the `companyId` of the current session.
* **Front-End Routing:** The Next.js application can enforce that certain routes or layouts are organization-specific. For instance, a user might have a company switcher in the UI, and the selection could be reflected in the URL (e.g., `/dashboard?companyId=X` or a subdomain per company pattern). In FleetFusion’s case, a simpler approach uses the session’s org context without needing subdomains.
* **Cascade Deletion & Data Integrity:** To maintain data isolation, if a company were ever deleted (for example, if a tenant leaves the service and requests data removal), all related records (drivers, vehicles, loads, etc. with that `companyId`) should also delete via cascade rules in the database. The schema uses `ON DELETE CASCADE` on foreign key constraints for this purpose. This prevents orphaned records that belong to a non-existent tenant.
* **Testing Multi-Tenancy:** The development/test environments consider multi-tenant scenarios (e.g., ensuring one user's data is not accessible by another in tests). We create seed data in separate organizations to verify that queries and UI elements properly segregate information.

## Data Flow and State Management

FleetFusion leverages Next.js 15 with React 19 features to manage data flow efficiently between the server and client:

* **React Server Components (RSC):** Most pages and components that fetch data are implemented as Server Components. They fetch the necessary data on the server (via direct database calls or via helper functions in `lib/fetchers/*`) before rendering the UI, which improves performance and SEO.
* **Server Actions:** All create, update, or delete operations (mutations) are handled via Next.js React Server Actions (server-side form actions). These functions (located in `lib/actions/*`) run on the server, ensuring secure and direct data processing without exposing sensitive logic to the client. For example, there might be a `addVehicle` action in `lib/actions/vehicle-actions.ts` that inserts a new vehicle into the database and can be called by a form submission.
* **Client Components for Interactivity:** Components that require interactivity (like dynamic tables, form inputs, or maps) are client components. They receive data via props (already fetched by a parent server component) or via context. This pattern avoids unnecessary data fetching on the client and leverages the server-rendered data.
* **React Context:** Global app context is used for things like the current company (tenant) and user information. `CompanyContext` provides the active `companyId` throughout the component tree, so nested components can access it without prop drilling. Similarly, other contexts might provide theme or user preferences if needed.
* **Minimal Client State Libraries:** Because of heavy use of server-side rendering and context, the need for client state management libraries (like Redux or MobX) is greatly reduced. Local component state and Context cover most use cases. If any asynchronous data updating is needed client-side (for example, real-time updates or background refresh of certain data), lightweight solutions or the built-in React querying (with useSWR or similar) could be considered, but by design the app avoids this for initial page loads.

Below is a simplified data flow diagram demonstrating how data moves in FleetFusion:

```plaintext
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│ Server Component◄─────┤ lib/fetchers   ◄─────┤   Database    │
│   (Next.js)    │     │   (Data Fetch) │     │  (PostgreSQL)  │
└───────┬────────┘     └────────────────┘     └────────────────┘
        │                                             ▲
        │ Props                                       │
        ▼                                             │
┌────────────────┐     ┌────────────────┐     ┌──────┴─────────┐
│                │     │                │     │                │
│ Client Component─────►   Server Action─────►     Mutation    │
│   (React)      │     │   (Form Submit) │     │ (Database Ops)│
└────────────────┘     └────────────────┘     └────────────────┘
```

In the above diagram:

* Data is fetched on the server (left side) through `lib/fetchers` functions and passed as props to the relevant components.
* When a user triggers a mutation (e.g., submitting a form to add a new driver), a Server Action handles it on the server, performs the database mutation, and the page can then re-fetch or update to reflect the change.
* The separation ensures that initial page loads are fast and complete (no loading spinners for data), and that secure operations are not exposed to the client beyond the minimal necessary interface.

**No Redundant Client Fetches:** Thanks to server-side data loading, the app avoids heavy use of client-side data fetching for primary data. Patterns like using `useEffect` to load data on page mount are not needed for most pages, reducing complexity and potential bugs. This also simplifies compliance with CSP, as fewer external calls are made from the browser.

## Database Schema Reference

FleetFusion uses PostgreSQL with the Drizzle ORM to define and manage the database schema. Key aspects of the schema include:

* **Companies & Users:**

  * **companies** – Stores each tenant company's information (name, address, etc.) along with a unique identifier (Clerk org ID) linking it to the auth layer.
  * **company\_users** – Maps users to companies with their roles. Each entry links a Clerk user ID to a company ID and includes role metadata (e.g., admin, dispatcher).
* **Core Fleet Entities:**

  * **drivers** – Contains driver profiles (name, license info, etc.) and is linked to a companyId.
  * **vehicles** – Contains vehicle records (make, model, VIN, etc.) and is linked to a companyId.
  * **loads** – Represents a dispatch load/shipment, including fields for origin, destination, cargo details, assigned driver, assigned vehicle, schedule times, status, and is linked to a companyId.
* **Compliance & Documents:**

  * **documents** – A general table for uploaded documents (could be used for storing file meta like URL, upload date).
  * **compliance\_documents** – (If distinct from documents) Stores specific compliance record entries, such as a record of a driver's license or a vehicle inspection, possibly linking to an entry in `documents` for the file itself. Also linked to the relevant driver/vehicle and companyId.
  * **hos\_logs** – Hours-of-service logs for drivers (each entry could record driver, start/end times of driving, status type, etc., linked to companyId and driverId).
  * **maintenance\_records** – Records of vehicle maintenance or inspections performed (date, type of service, notes), linked to vehicleId and companyId.
* **Common Fields & Conventions:**

  * All primary keys are UUIDs (universally unique identifiers). This ensures uniqueness across distributed systems and avoids sequential ID predictability.
  * Timestamps (`createdAt`, `updatedAt`) are included in most tables to track when records are added or modified. Drizzle ORM can auto-manage these or they can be set via triggers.
  * Foreign key relations are set with `ON DELETE CASCADE` for any child records that should be removed if a parent is deleted (e.g., deleting a driver could cascade delete their HOS logs or compliance docs; deleting a company cascades to all its data).
* **Referential Integrity:** The schema design, combined with Clerk integration, ensures that for example:

  * A `company_users` record should not exist without a corresponding `companies` entry.
  * A `loads` entry with a `driverId` and `vehicleId` should reference valid entries in `drivers` and `vehicles` that belong to the same company.
  * Drizzle's schema definitions and TypeScript types help enforce these relationships in code, while the database enforces them at runtime.

Developers can refer to the `db/schema.ts` file for the complete and authoritative schema definitions including all fields and relationships. Additionally, migration files (if using Drizzle's migrations or an external tool) provide a history of schema changes.

## Deployment and CI/CD

FleetFusion is deployed as a modern web application with continuous integration and deployment practices:

* **Hosting:** The production environment is hosted on Vercel, which provides a convenient platform for Next.js applications. The default production domain is `fleet-fusion.vercel.app` (a custom domain can be configured as needed).
* **Environment Management:** Sensitive configuration is provided via environment variables. During deployment, these are set in Vercel's dashboard (for production) and via `.env.local` files for local development. It’s crucial to set production Clerk keys, the Neon database URL, and any third-party API keys in the Vercel environment before deploying.
* **Manual Deployment:** Initially, one can deploy FleetFusion by connecting the GitHub repo to Vercel and using the Vercel UI to trigger a deployment. In this flow, Vercel will install dependencies and run `next build` to compile the app. Ensure the project settings on Vercel (build command, output directory, etc.) are properly configured (Next.js defaults are usually auto-detected).
* **Continuous Deployment (CD):** The project is configured for automatic deployments. Whenever changes are pushed to the `main` branch (after passing tests), Vercel will automatically build and deploy the new version. This provides a seamless deployment process, where code merges result in live updates to the app.
* **Continuous Integration (CI):** GitHub Actions handle testing and integration steps:

  * A typical workflow might run on every pull request and push to `main`. It will install dependencies, run `eslint` for linting, run `tsc` for type checks, and execute all tests.
  * Only if these steps succeed can code be merged or deployed. This prevents broken builds or obvious bugs from reaching production.
* **Vercel Integration via CI:** In addition to Vercel’s own git integration, the CI workflow can deploy to Vercel by using Vercel’s API tokens. Secrets such as `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are stored in GitHub and used by the action to authenticate with Vercel’s API. This way, the CI can programmatically trigger deployments after tests pass.
* **Post-Deployment Verification:** After deploying, it’s recommended to perform a quick smoke test:

  * Visit the production site and ensure pages are loading.
  * Test login and a few key user flows (e.g., create a load, sign out, etc.) to confirm that the production environment (with its environment variables) is configured correctly (especially Clerk, since incorrect domains or keys would affect auth).
  * Check Vercel's function logs or monitoring tools for any runtime errors that might not have appeared in testing.
* **Rollback Strategy:** Vercel keeps previous deployments available. If a new deployment has a critical issue, the team can use Vercel's "Rollback" feature to instantly revert to the last good deployment. Additionally, maintaining good version control practices (like tagging releases) helps in quickly identifying a stable commit to redeploy if needed.

By adhering to these DevOps practices, FleetFusion achieves a robust deployment pipeline with minimal downtime, quick iteration cycles for developers, and confidence that each release has been tested and is easy to monitor.

---

## User Documentation

# FleetFusion User Documentation

Welcome to the FleetFusion user documentation. This collection of guides will help you get started with FleetFusion and understand how to use its features effectively. The documentation is organized into the following sections:

* **Quickstart:** Start here for a basic setup and usage walkthrough – see [Quickstart](./QUICKSTART.md).
* **Role Guides:** Detailed guides for specific user roles:

  * [Admin Guide](./ROLE_GUIDES/Admin.md)
  * [Dispatcher Guide](./ROLE_GUIDES/Dispatcher.md)
  * [Driver Guide](./ROLE_GUIDES/Driver.md)
  * [Compliance Officer Guide](./ROLE_GUIDES/ComplianceOfficer.md)
* **Module Guides:** Learn about each major module and feature:

  * [Dispatch Management Guide](./MODULE_GUIDES/dispatch.md)
  * [Vehicle Management Guide](./MODULE_GUIDES/vehicles.md)
  * [Driver Management Guide](./MODULE_GUIDES/drivers.md)
  * [Compliance Management Guide](./MODULE_GUIDES/compliance.md)
  * [IFTA Reporting Guide](./MODULE_GUIDES/ifta.md)
  * [Analytics Guide](./MODULE_GUIDES/analytics.md)
  * [Settings Guide](./MODULE_GUIDES/settings.md)
* **Additional Resources:**

  * [FAQ](./FAQ.md) – Frequently Asked Questions about FleetFusion.
  * [Troubleshooting](./TROUBLESHOOTING.md) – Solutions to common issues and errors.

# FleetFusion Quickstart Guide

This quickstart guide will walk you through setting up FleetFusion for the first time and performing basic tasks to get your fleet management up and running.

1. **Sign Up and Onboard:** Visit the FleetFusion application URL and create an account. During sign-up, you'll provide your email and set a password. Once registered, you will be prompted to **onboard** your company:

   * Enter your company details (name, address, DOT/MC number if applicable, etc.).
   * The platform will create your organization space. As the first user, you will be assigned the **Admin** role for your company.
2. **Invite Team Members:** After onboarding, invite other users to join your organization:

   * Go to **Settings** > **Users & Roles** and click **Invite User**.
   * Send invitations to dispatchers, drivers, compliance officers, or other admins by entering their emails and assigning roles.
   * Invited users will receive an email with a link to join your company on FleetFusion.
3. **Add Vehicles:** Populate your fleet data by adding vehicles:

   * Navigate to the **Vehicles** module and click **Add Vehicle**.
   * Enter the vehicle details (make, model, year, VIN, license plate, etc.).
   * Save the vehicle. Repeat for all vehicles in your fleet.
4. **Add Drivers:** Add your drivers into the system:

   * Go to the **Drivers** module and click **Add Driver**.
   * Fill in the driver's information (name, contact details, license info, etc.).
   * Save the profile. The driver will now appear in the Drivers list.
5. **Create Your First Load (Dispatch):** With vehicles and drivers in place, you can schedule the first delivery:

   * Open the **Dispatch** module and click **New Load**.
   * Enter the shipment details (pickup location, drop-off location, cargo description, schedule times).
   * Assign a driver and a vehicle from the dropdown lists of those you added.
   * Save the load. It will now be visible on the dispatch board for tracking.
6. **Track and Manage Operations:**

   * As drivers pick up and deliver loads, they (or you, depending on workflow) should update the load status in the Dispatch module to reflect progress.
   * Navigate to the **Analytics** module to view any available dashboards and get an overview of operational metrics (once you have some data in the system).
   * Check the **Compliance** module to ensure all necessary documents for drivers and vehicles are uploaded (licenses, inspection reports, insurance, etc.). Upload any missing documents via **Compliance** > **Upload Document**.
7. **Explore Further:** Familiarize yourself with other modules and settings:

   * Visit the **IFTA Reporting** module if you need to track fuel usage and mileage by state/province for tax purposes.
   * Check out **Settings** for additional configurations like company preferences or to manage roles and company profile information.
   * Refer to the [Admin Guide](./ROLE_GUIDES/Admin.md) and other role-specific guides for specialized tasks and best practices as you start using FleetFusion.

Now you have the basics covered. Your FleetFusion environment is set up with core data, and you're ready to manage your fleet operations. For more detailed instructions on specific features, refer to the module guides and role guides listed in the documentation.

# Frequently Asked Questions (FAQ)

Below are answers to some common questions about using FleetFusion:

### How do I upload a compliance document?

1. Go to the **Compliance** module from the dashboard.
2. Click **Upload Document**.
3. Select the document type (e.g., driver license, insurance, inspection) and fill in the required details.
4. Attach your file and submit.

**Tip:** You can view the status of uploaded documents (Active, Expiring Soon, Expired) in the Compliance dashboard.

---

### How do I reset my password?

1. On the sign-in page, click **Forgot Password?**.
2. Enter your registered email address.
3. Check your email and follow the instructions to set a new password.

---

### How do I invite new users?

1. Go to **Settings** > **Users & Roles** in the dashboard.
2. Click **Invite User**.
3. Enter the user's email and assign a role.
4. Send the invitation. The user will receive an email with a link to join your company on FleetFusion.

---

### What do the document status labels mean?

* **Active:** The document is valid and up to date.
* **Expiring Soon:** The document will expire in the near future (e.g., within 30 days). It should be renewed soon.
* **Expired:** The document has passed its expiration date and is no longer valid. A new, valid document must be uploaded to remain compliant.

# Troubleshooting Guide

This guide addresses some common issues and their resolutions in FleetFusion.

### Cannot upload a document?

* **Check file requirements:** Ensure the file type is allowed (e.g., PDF, JPG) and that the file size does not exceed the system limit.
* **Complete all fields:** Verify that all required information (document type, expiration date, etc.) is provided in the upload form.
* **Contact support:** If the issue persists after checking the above, there may be a system issue. Reach out to your system administrator or FleetFusion support for assistance.

---

### Not receiving email invitations or password reset emails?

* **Inspect spam/junk folder:** The email might have been filtered by your email provider. Check your spam or junk folder for the invitation or reset email.
* **Verify the email address:** Confirm that the email was entered correctly (typos in the address can cause delivery failures).
* **Resend or contact support:** If the email is still not found, try resending the invitation or password reset. If it still does not arrive, contact support as there may be an email delivery issue.

# Admin Guide

## Overview

Administrators (Admins) have full access to FleetFusion and oversee the entire fleet management system for their company. An Admin is typically responsible for initial system setup, managing users and roles, and configuring company-wide settings.

## Key Responsibilities

* **User Management:** Invite new users, assign roles (Dispatcher, Driver, Compliance Officer), and remove or update users as needed.
* **Company Settings:** Update company profile information and preferences (such as company details, branding, or default settings).
* **Access & Permissions:** Ensure each team member has appropriate access; only Admins can grant roles or change other users’ roles.
* **Oversight:** View system audit logs and activities to monitor usage and security. Admins may also handle high-level tasks like managing billing or subscriptions if applicable.

## Guide

**Inviting a New User:**

1. Navigate to **Settings** > **Users & Roles** in the FleetFusion dashboard.
2. Click **Invite User**.
3. Enter the user's email address and select the appropriate role (e.g., Dispatcher, Driver, Compliance Officer).
4. Send the invitation. The invited user will receive an email with instructions to join your organization.

**Managing Company Information:**

1. Go to **Settings** > **Company Profile** (or **Company Settings**).
2. Update any necessary fields such as company name, address, contact information, or preferences (e.g., time zone, unit settings).
3. Click **Save** to apply changes. These settings apply to all users in your organization.

**Reviewing Audit Logs (if available):**

* If FleetFusion provides an **Audit Logs** or **Activity** section (usually under **Settings** or an Admin dashboard), navigate there to review recent actions in the system (e.g., user logins, data changes).
* Use audit logs to troubleshoot or ensure compliance with internal policies by seeing who did what and when.

**Billing Management:**

* If your organization’s plan or billing info is managed through FleetFusion, an Admin can access the **Billing** section (often under **Settings**).
* Review subscription details, update payment information, or download invoices as needed. *(If billing is not handled in-app, this section may direct you to a separate billing portal or require contacting FleetFusion support.)*

## Tips

* Only assign the **Admin** role to trusted users who require full access. Admins can make system-wide changes.
* Regularly review the list of users and their roles in **Settings** to ensure permissions are up-to-date with any staffing changes.
* Use the [Settings Guide](../MODULE_GUIDES/settings.md) for detailed information on configuration options and managing users and roles.

# Dispatcher Guide

## Overview

Dispatchers coordinate and schedule the fleet’s operations. In FleetFusion, a dispatcher primarily uses the Dispatch module to create and manage loads, assign drivers and vehicles, and monitor delivery statuses in real-time.

## Key Responsibilities

* **Load Planning:** Create new loads/orders that need to be transported.
* **Driver & Vehicle Assignment:** Assign available drivers and appropriate vehicles to each load.
* **Schedule Management:** Set pickup and delivery times and adjust schedules as necessary.
* **Status Monitoring:** Track the progress of active loads and update statuses or reassign resources if issues arise.
* **Communication:** Relay information to drivers regarding their assignments (via internal notes or external communication, as needed).

## Guide

**Creating and Assigning a Load:**

1. Navigate to the **Dispatch** module from the dashboard.
2. Click **New Load** to create a load.
3. Enter load details such as origin, destination, cargo description, and pickup/delivery times.
4. Assign a driver and a vehicle to the load from the available dropdown lists of drivers and vehicles.
5. Save the load. It will now appear on the dispatch board or list with its initial status (e.g., "Scheduled" or "Pending").

**Managing Active Loads:**

* Monitor the Dispatch dashboard for status updates (e.g., when a driver marks a load as picked up or delivered).
* If a driver is unable to complete a load or if schedule changes occur, use the dispatch interface to edit the load:

  * Update the load’s details or timing.
  * Reassign the load to a different driver or vehicle if necessary (Tip: in some views you can drag and drop a load to a new assignment or use an **Edit** dialog to change the driver/vehicle).

**Adjusting Schedules:**

* For any delays or early completions, update the load's record:

  * Change the delivery or pickup times as needed.
  * Add notes to the load (if the system allows) to inform others of changes or special instructions.
* Ensure that drivers are informed of any schedule changes (the system might send notifications, but a direct call or message can be used for urgent changes).

## Tips

* Use filtering options in the Dispatch module to quickly find loads by status, driver, date, or destination, especially as the number of loads grows.
* Pay attention to color-coding or status labels on the dispatch board (for example, overdue loads might be highlighted).
* Refer to the [Dispatch Management Guide](../MODULE_GUIDES/dispatch.md) for detailed instructions on using the dispatch interface and features.

# Driver Guide

## Overview

Drivers use FleetFusion to stay informed about their assignments and to record important information during their trips. A Driver user can see their dispatches, update load statuses, and manage their own compliance tasks like hours-of-service logs or document uploads.

## Key Responsibilities

* **View Assignments:** Check upcoming and current loads assigned to them, including details like addresses, schedules, and instructions.
* **Status Updates:** Mark loads as in-progress (e.g., picked up) or completed (delivered) as they carry out deliveries.
* **Document Uploads:** Upload necessary documents such as Proof of Delivery (POD) receipts, fuel receipts, or inspection reports related to their trips.
* **Hours of Service (HOS) Logging:** Record driving hours and breaks if the platform supports HOS tracking, to comply with regulations.

## Guide

**Viewing and Managing Loads:**

1. Log in to FleetFusion. The dashboard will display your current and upcoming assignments (loads).
2. Click on a load to view its details, including origin/destination, scheduled times, and any notes or special instructions.
3. Update the load status as you progress:

   * When you depart for pickup, mark the load as **In Transit** or similar.
   * Upon delivery, mark the load as **Delivered** or **Completed**.
   * These updates inform dispatchers and the system of real-time progress.

**Uploading Documents (e.g., Proof of Delivery):**

1. After completing a load (or as required), you may need to upload a document. In the load details page, look for an option to **Upload Document** (or specifically **Upload POD**).
2. Select the file from your device (for example, a signed delivery receipt or a photo of the delivered goods).
3. Choose the document type if prompted (e.g., "Proof of Delivery") and add any notes required.
4. Submit the upload. The document will be attached to the load record for dispatchers and compliance officers to review.

**Logging Hours (if applicable):**

* If FleetFusion provides an HOS logging feature, access it via the **Compliance** or **Logs** section in your dashboard.
* Record your duty status changes (e.g., Driving, On Duty, Off Duty) with start and stop times as required by HOS rules.
* Always keep these logs up to date. If the system is connected to an ELD device, some logs might auto-populate, but you may need to certify or adjust them.

## Tips

* Keep your assigned load information up to date. Timely status updates help dispatchers respond quickly to any delays or issues.
* If using a mobile device, take advantage of FleetFusion’s mobile-friendly interface (if available) to update statuses and upload documents on the go.
* If you encounter any issues with your assignment details or the app (e.g., you can’t update a status), contact your dispatcher or Admin for assistance.

# Compliance Officer Guide

## Overview

Compliance officers focus on ensuring that all fleet operations meet regulatory requirements. In FleetFusion, a Compliance Officer uses the platform to track and manage all compliance-related documents and records, keeping the company ready for inspections or audits at any time.

## Key Responsibilities

* **Document Management:** Ensure that all required documents (driver licenses, medical certificates, vehicle inspection reports, insurance policies, etc.) are stored in the system and kept up to date.
* **Monitoring Expirations:** Regularly review document statuses and receive alerts for any that are expiring soon or have expired.
* **Regulatory Reporting:** Prepare for audits by retrieving necessary records and, if available, generate compliance reports for authorities (e.g., a list of expired items, IFTA reports).
* **Policy Enforcement:** Oversee that drivers and other staff are following safety and compliance protocols (for example, drivers logging hours properly or vehicles undergoing scheduled inspections).

## Guide

**Uploading and Updating Compliance Documents:**

1. Go to the **Compliance** module on the dashboard. You will see an overview list of compliance documents and their status (Active, Expiring Soon, Expired).
2. To add a new document (for example, a renewed driver's license or updated insurance card), click **Upload Document**.
3. Choose the document type from the list (such as *Driver’s License*, *Insurance*, *Inspection Report*, etc.).
4. Enter the required details (e.g., expiration date, associated driver or vehicle) and attach the document file.
5. Submit to save. The document will now appear in the list, and its status will be tracked automatically based on the expiration date you provided.

**Reviewing Compliance Status:**

* On the main Compliance dashboard, check for any items marked **Expiring Soon** or **Expired** (these are usually highlighted or filtered to grab your attention).
* Click on those items to view details and determine what action is needed:

  * If a driver’s license is expiring, reach out to that driver to get an updated license and upload it.
  * If a vehicle inspection is expired, schedule an inspection and update the record once completed.
* You can use filters or search in the Compliance module to find specific documents by type (e.g., show all insurance policies) or by personnel/vehicle.

**Preparing for Audits:**

* If an audit or inspection is upcoming, use FleetFusion to retrieve all necessary documentation:

  * Ensure all driver qualification files are present (licenses, medical cards).
  * Ensure all vehicle records are in order (recent inspections, maintenance logs).
  * Export or print documents if needed. (If FleetFusion offers a report or export feature, use it to generate a bundle of compliance documents or a report of compliance status).
* Review the **Audit Log** (if provided in the system) to see a history of compliance-related actions (e.g., document uploads, edits) in case an auditor inquires about changes or updates.

## Tips

* Schedule a periodic review (e.g., weekly or monthly) of the Compliance module to catch upcoming expirations well in advance.
* Communicate with drivers and the fleet manager proactively when documents need renewal. FleetFusion’s **Expiring Soon** status is a helpful alert, but direct communication ensures everyone is aware.
* Refer to the [Compliance Management Guide](../MODULE_GUIDES/compliance.md) for detailed features of the Compliance module and instructions on using its tools effectively.

# Dispatch Management Guide

## Overview

Manage loads, assignments, and real-time status tracking in the Dispatch module.

## Key Features

* Create and assign loads
* Track load status in real time

## How to Use

1. Go to the **Dispatch** module from the dashboard.
2. Click **New Load** to create a load.
3. Assign drivers and vehicles to the load.
4. Monitor status updates on the dispatch board as drivers update their progress.

## Tips

* Use filters to quickly find specific loads by driver, date, or status.
* Drag and drop loads (if supported) to reassign or reschedule them easily.

# Vehicle Management Guide

## Overview

Manage vehicle info, maintenance records, inspections, and assignments.

## Key Features

* Add or edit vehicle profiles (with details like VIN, license plate, etc.)
* Log maintenance and inspection events for each vehicle
* Assign vehicles to drivers or loads and track availability

## How to Use

1. Go to the **Vehicles** module from the dashboard.
2. Click **Add Vehicle** to register a new vehicle.
3. Fill in the vehicle details (make, model, year, VIN, license plate, etc.) and save.
4. For existing vehicles, click on a vehicle in the list to view or edit its details. Update maintenance or inspection information as needed (there may be fields or sub-sections for adding a maintenance record or noting the last inspection date).

## Tips

* Keep vehicle records up to date with the latest maintenance and inspection info to ensure compliance and optimal operation.
* Before assigning a vehicle to a new load, check its status (e.g., not under maintenance) to avoid scheduling conflicts.

# Driver Management Guide

## Overview

Manage driver info, licensing, hours-of-service (HOS) logs, and document alerts in the Drivers module.

## Key Features

* Add and edit driver profiles (personal info, license details, etc.)
* Track license and document status for each driver
* Monitor HOS compliance and alerts for expiring certifications

## How to Use

1. Go to the **Drivers** module from the dashboard.
2. Click **Add Driver** to create a new driver profile.
3. Enter the driver's information (name, contact details, license number, expiration date, etc.) and save.
4. For existing drivers, click on a driver in the list to view or update their profile. You can upload important documents like a scanned license or certification in their profile if needed.

## Tips

* Use the alerts or status indicators in the Drivers module to stay ahead of expiring licenses or certifications. FleetFusion may highlight drivers in need of updated documents.
* Encourage drivers to keep their own information updated and to inform you of any changes (address, license renewal) so you can update the system accordingly.

# Compliance Management Guide

## Overview

Manage regulatory compliance documents and ensure all driver and vehicle records are up to date for audits.

## Key Features

* Upload and store compliance documents (licenses, permits, inspection reports, etc.)
* Track document statuses and expiration dates with automatic alerts
* View audit logs of compliance activities and generate compliance reports (if available)

## How to Use

1. Go to the **Compliance** module from the dashboard.
2. To upload a document, click **Upload Document**. Select the type of document (e.g., Driver License, Vehicle Inspection, Insurance), fill in required details (such as associated driver/vehicle and expiration date), attach the file, and submit.
3. The compliance dashboard will list all uploaded documents along with their status:

   * **Active:** Currently valid.
   * **Expiring Soon:** Close to expiring (highlighted to draw attention).
   * **Expired:** Past expiration and needs update.
4. Use filters or search within the Compliance module to find specific documents by type or by the person/vehicle they are associated with.
5. If needed, click on a document entry to view more details or to update it (for example, after renewing a document, you can update the record with the new expiration date and file).

## Tips

* Regularly check the Compliance dashboard for any **Expiring Soon** items and address them before they expire (schedule renewals, inform drivers, etc.).
* Keep digital copies of all critical documents in FleetFusion so that you can easily retrieve them during a compliance audit.
* The Compliance module works hand-in-hand with the Drivers and Vehicles modules. Ensure that when adding a driver or vehicle, you also input their key compliance info (license expiration, last inspection date) so the system can start tracking those right away.

# IFTA Reporting Guide

## Overview

Automate mileage and fuel tracking for IFTA (International Fuel Tax Agreement) reporting.

## Key Features

* Track miles driven and fuel purchased by jurisdiction
* Generate IFTA reports for tax filing periods

## How to Use

1. Go to the **IFTA** module from the dashboard.
2. Enter trip data and fuel purchase information as required:

   * Record trips with distance traveled in each state/province.
   * Log fuel purchases with quantity and location (state/province).
3. After inputting data for the period, use the module’s report function to **Generate IFTA Report** (if available).
4. The system will compile the total miles and fuel by jurisdiction and produce a report that can be used for filing your quarterly IFTA return.

## Tips

* Input trip and fuel data regularly (e.g., weekly) rather than waiting until the end of the quarter. This ensures the information is accurate and up-to-date.
* Double-check the report against your fuel receipts and mileage logs for accuracy before filing.
* Keep records of generated reports and underlying data in case of audits or discrepancies.

# Analytics Guide

## Overview

Use real-time dashboards for performance and financial metrics in the Analytics module.

## Key Features

* View fleet utilization, on-time performance, fuel efficiency, and other operational charts
* Filter data by date range, specific vehicle, or driver to drill down

## How to Use

1. Open the **Analytics** module from the dashboard.
2. By default, you’ll see a dashboard with key metrics (e.g., total loads delivered this month, average delivery time, fuel consumption, etc.).
3. Use filter controls (date pickers, drop-downs for vehicle or driver selection) to refine the data. For example, select a specific month or a particular driver to see their performance metrics.
4. Hover over charts for detailed values or click on segments (if interactive) to see more details.
5. If needed, export charts or reports using the provided option (such as a **Download** or **Export** button) for use in presentations or meetings.

## Tips

* Regularly review the Analytics dashboard to identify trends (like improving or worsening delivery times or fuel costs) and make informed decisions.
* Utilize the filters to compare performance – for example, how one driver’s on-time delivery rate compares to another’s, or fuel economy differences between vehicles.
* If a particular metric is outside of expected ranges, investigate by looking at the underlying data (FleetFusion might allow you to click through to see the related records, or you may use the Dispatch/IFTA modules for deeper analysis).

# Settings Guide

## Overview

Manage company information, system preferences, and user roles in the Settings module.

## Key Features

* Update company profile details (name, address, contact info)
* Set preferences like time zone, units of measurement, or notification settings
* Manage users and roles (invite users, assign roles, deactivate accounts)

## How to Use

1. Go to the **Settings** module from the dashboard. You will see sub-sections or tabs for different categories (Company Info, Users & Roles, Preferences, etc.).
2. **Company Info:** Review and edit your company’s details. Update fields such as company name, address, phone number, logo (if applicable), then save changes.
3. **Users & Roles:** Manage your team’s access:

   * View the list of all users in your organization and their roles.
   * To invite a new user, click **Invite User** and follow the steps (enter email, assign role).
   * To change a user’s role or deactivate a user, select the user from the list and use the edit options (role dropdown, active/inactive toggle).
4. **Preferences/Settings:** Adjust system-wide settings:

   * Set your time zone and regional settings so that dates/times and units (miles vs. kilometers, gallons vs. liters) are tailored to your region.
   * Configure notification preferences (for example, which email notifications or alerts are enabled for load assignments, document expirations, etc.).
   * If available, adjust branding settings like uploading a company logo or choosing a theme color for the interface.

## Tips

* Only Admins can access and change Settings. If you are not an Admin and need a change, contact your Admin.
* Keep the company profile updated, as this information might appear on reports or notifications (for instance, the company name and address on IFTA reports).
* When inviting users, double-check the email address and role. New users will only have access to what their role permits, so assign roles carefully based on job function. (See the Admin Guide for more about roles and permissions.)
