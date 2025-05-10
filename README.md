# FleetFusion (multi-tenant SaaS)

FleetFusion is a modern, production-ready, multi-tenant SaaS platform for comprehensive fleet management, built with Next.js 15, React 19 Server Components, Drizzle ORM, and PostgreSQL on Neon. It is designed for trucking companies to efficiently manage vehicles, drivers, loads, compliance, and analytics with a scalable, modular, and secure architecture.

---

## Live Deployment

- **Production:** [https://vercel.com/digital-herencia/fleet-fusion](https://vercel.com/digital-herencia/fleet-fusion)
- **Build & Chat:** [https://v0.dev/chat/projects/OURP0qOTyib](https://v0.dev/chat/projects/OURP0qOTyib)

---

## Key Features

- **Dispatch Management:** Interactive board for load creation, assignment, and real-time status tracking.
- **Vehicle Management:** Track vehicle details, maintenance, inspections, and compliance documents.
- **Driver Management:** Manage driver info, licensing, HOS, performance, and document alerts.
- **Compliance:** Centralized compliance dashboard, document management, and automated alerts.
- **IFTA Reporting:** Automated miles/fuel tracking, tax calculation, and report export.
- **Analytics:** Real-time dashboards for performance, utilization, and financial metrics.
- **Role-Based Access:** Admin, Dispatcher, Driver, Compliance Officer, and Account Manager roles.
- **Multi-Tenancy:** Company-level data isolation and organization-based access.
- **Modern UI:** Responsive, accessible, dark/light mode, and mobile-friendly.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19 (Server Components), Tailwind CSS 4
- **Backend:** Node.js/Edge, React Server Actions, Next.js API Routes
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **Auth:** Clerk (organization-based, RBAC)
- **Storage:** Vercel Blob Storage
- **Monitoring:** Vercel Analytics
- **Testing:** Vitest, React Testing Library, Playwright

---

## Project Structure

- `app/` – Pages, layouts, and routes (App Router)
- `components/` – Reusable UI components
- `features/` – Feature modules (dispatch, vehicles, drivers, etc.)
- `lib/` – Domain logic, fetchers, actions, utils
- `types/` – Shared TypeScript types
- `public/` – Static assets
- `config/` – Tailwind, Next.js, PostCSS, etc.

---

## Development Workflow

- **Run locally:** `npm run dev`
- **Dev with Clerk webhooks:** `npm run dev:ngrok`
- **Testing:** `npm test` (unit/integration), `npx playwright test` (e2e)
- **CI/CD:** Automated with GitHub Actions and Vercel

---

## Clerk Webhook Setup

- Endpoint: `/api/clerk/webhook-handler`
- Subscribed to all organization, user, and session events

---

## Modern Fullstack Best Practices

- Server-first rendering with React Server Components
- Data fetching/mutation via Server Actions (not API routes)
- Zod validation for all forms
- Feature-driven, modular architecture
- Strict TypeScript, ESLint, Prettier
- Accessibility (WCAG 2.1 AA), responsive design, and dark mode

---

## Documentation

- [Product Requirements (PRD)](.github/PRD.md)
- [Technical Requirements](.github/TECHNICAL_REQUIREMENTS.md)

---

For more details, see the PRD and Technical Requirements in `.github/`.
