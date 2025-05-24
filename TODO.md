# ✅ **FleetFusion Project Setup TODO**

---

## 🗂️ Task Overview:

This task involves restructuring your Next.js 15, React 19, TypeScript 5, TailwindCSS 4, and ShadCN UI project to create a modern, fully-featured multi-tenant ABAC SaaS Transportation Management System (TMS). Your target users are freight and logistics SMEs in Southern New Mexico.

Ensure a complete integration using Clerk for Attribute-Based Access Control (ABAC) authentication and Neon PostgreSQL as your primary database, synchronized via Clerk webhooks.

---

## ✅ **Order of Completion & Detailed Instructions:**

### 1️⃣ **Setup and Scaffolding:**

* **Restructure my directory clearly by domain**, adapting this structure to align with modern standards:

  ```
  /
  ├── public/            # Marketing & legal: terms, privacy, refund, pricing, about, features, services, contact, blog
  ├── app/               # Next.js App Router: routes, pages, layouts
  ├── components/        # Dumb, reusable UI components (e.g., buttons, inputs)
  ├── features/          # Smart UI components with business logic (e.g., <UserProfile />, <OrderForm />)
  ├── lib/               # Core business logic, utilities, data fetching, server actions
  │   ├── actions/       # Server Actions for mutations (e.g., createUser, updateOrder)
  │   ├── fetchers/      # Data fetching functions (e.g., getProducts, getOrderDetails)
  │   ├── utils/         # Utility functions (e.g., formatters, validators)
  │   ├── database/      # Database schema, migrations, connection, queries (Drizzle ORM)
  │   └── webhooks/      # Webhook handlers (e.g., Clerk, Stripe)
  ├── styles/            # Global styles, Tailwind CSS base, CSS custom properties/tokens
  ├── types/             # Shared TypeScript type definitions and interfaces
  ├── config/            # Configuration files (e.g., Tailwind, Next.js, PostCSS, Drizzle)
  ├── db/                # Database related files (e.g., schema, migrations, seeds) - consider merging relevant parts into lib/database/ and config/
  ├── middleware.ts      # Next.js middleware for routing, authentication
  ├── next.config.mjs    # Next.js configuration
  ├── tailwind.config.ts # Tailwind CSS configuration
  ├── tsconfig.json      # TypeScript configuration
  └── README.md          # Project documentation
  ```
* **Initialize Drizzle ORM** and set up the database schema in `lib/database/schema.ts`.
    * Define tables for `companies`, `users`, `roles`, `permissions`, `vehicles`, `drivers`, `loads`, `documents`, `settings`, `subscriptions`, `audit_logs`, etc.
    * Ensure relationships between tables are correctly defined (e.g., a `company` has many `users`, a `user` has one `role`).
* **Configure Drizzle Kit** for migrations in `drizzle.config.ts`.
* **Set up Neon PostgreSQL** as the database provider.
    * Store connection string securely in environment variables.
* **Integrate Clerk for authentication**:
    * Configure Clerk for multi-tenancy using organizations.
    * Implement ABAC (Attribute-Based Access Control) using Clerk roles and permissions.
    * Set up Clerk webhooks to synchronize user and organization data with your Neon database (`/app/api/webhooks/clerk/route.ts` and `lib/webhooks/clerk.ts`).
        * On `organization.created`, create a corresponding `company` in your database.
        * On `user.created`, associate the user with their `company` and assign a default role.
        * Handle other relevant events like `user.updated`, `organization.updated`, `organizationMembership.created`, etc.
* **Implement basic UI components** using ShadCN UI and Tailwind CSS:
    * Create a consistent layout structure (`app/(protected)/layout.tsx`, `app/(public)/layout.tsx`).
    * Develop navigation components (`components/main-nav.tsx`, `components/user-nav.tsx`).
    * Style forms, buttons, tables, and other common UI elements.
* **Set up Tailwind CSS 4** according to the new CSS-first theming approach:
    * Define design tokens (CSS custom properties for colors, spacing, radius, etc.) in `app/globals.css` within `:root`.
    * Use `hsl(var(--token))` for colors in Tailwind utility classes.
    * Ensure `darkMode: 'class'` is enabled in `tailwind.config.ts`.
* **Create initial pages** for key areas:
    * Public: Landing, About, Pricing, Contact
    * Auth: Sign In, Sign Up
    * App (Protected): Dashboard, Settings

### 2️⃣ **Core Feature Development (TMS Specific):**

*   **Company/Tenant Management:**
    *   Allow users to manage their company profile (details, logo, primary color).
    *   Implement logic for tenant isolation in database queries.
*   **User Management (within a tenant):**
    *   Allow admins to invite, view, and manage users within their organization.
    *   Assign and manage user roles and permissions (e.g., admin, dispatcher, driver, compliance).
*   **Vehicle Management:**
    *   CRUD operations for vehicles (tractors, trailers).
    *   Track vehicle details (VIN, make, model, year, status, registration, insurance).
*   **Driver Management:**
    *   CRUD operations for drivers.
    *   Track driver details (CDL, contact info, employment status, compliance documents).
*   **Load Management (Dispatch):**
    *   CRUD operations for loads.
    *   Track load details (origin, destination, shipper, consignee, dates, cargo, rate).
    *   Implement a dispatch board/calendar view.
*   **Document Management:**
    *   Allow uploading and managing documents related to vehicles, drivers, loads (e.g., BOLs, PODs, insurance, registration).
*   **Compliance Management:**
    *   Track HOS (Hours of Service) for drivers.
    *   Manage vehicle maintenance schedules and records.
    *   IFTA reporting features.
*   **Basic Analytics/Dashboard:**
    *   Display key metrics for fleet operations (e.g., vehicle utilization, driver performance, load profitability).

### 3️⃣ **Advanced Features & Integrations:**

*   **Subscription & Billing:**
    *   Integrate Stripe for subscription management (free, pro, enterprise tiers).
    *   Implement logic to restrict features based on subscription tier.
*   **Real-time Tracking (Optional):**
    *   Integrate with ELD/GPS providers for real-time vehicle tracking.
*   **Accounting Integration (Optional):**
    *   Allow exporting data for accounting software (e.g., QuickBooks).
*   **Reporting Module:**
    *   Generate custom reports for various aspects of the TMS.
*   **Notifications:**
    *   Implement in-app and email notifications for important events (e.g., new load assignment, expiring documents).

### 4️⃣ **Testing, Deployment & Polish:**

*   **Write unit and integration tests** for critical business logic (Server Actions, fetchers, utilities).
*   **Implement end-to-end tests** for key user flows.
*   **Set up CI/CD pipeline** for automated testing and deployment (e.g., using Vercel, GitHub Actions).
*   **Optimize for performance and scalability.**
*   **Thoroughly test ABAC rules** to ensure data security and isolation.
*   **Refine UI/UX** based on user feedback.
*   **Create comprehensive documentation** (user guides, API docs).

---

## 📝 **Notes & Reminders:**

*   Prioritize server-first rendering with React Server Components (RSC).
*   Use Server Actions for all mutations and form submissions.
*   Keep API routes (`/app/api/*`) minimal (auth, webhooks, 3rd-party integrations).
*   Follow TypeScript best practices (strict mode, `satisfies` for configs).
*   Maintain a clean and modular codebase.
*   Document everything!

Let's build an amazing TMS! 🚀