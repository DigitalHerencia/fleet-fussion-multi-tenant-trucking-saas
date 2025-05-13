# FleetFusion Product Requirements Document (PRD)

## Overview
FleetFusion is a modern, multi-tenant fleet management platform for logistics and transportation companies. It provides robust tools for compliance, dispatch, driver management, vehicle tracking, IFTA reporting, analytics, and more. The platform is built with Next.js 15, TypeScript 5, Drizzle ORM, and Clerk for authentication and organization management.

## Target Users
- Fleet owners and managers
- Dispatchers
- Drivers
- Compliance officers
- Accountants

## Core Features
- **Multi-tenancy:** Each company (tenant) has isolated data and user management.
- **Authentication & Org Management:** Clerk integration for user and organization lifecycle.
- **Driver Management:** Add, update, and track drivers, licenses, and compliance.
- **Vehicle Management:** Track vehicles, maintenance, inspections, and assignments.
- **Dispatch:** Assign loads, manage routes, and monitor delivery status.
- **Compliance:** Document management, audit logs, and regulatory tracking.
- **IFTA Reporting:** Trip and fuel tracking for tax compliance.
- **Analytics:** Dashboards for operational and financial insights.
- **Settings:** Company, user, and system configuration.

## User Stories
- As a fleet manager, I want to onboard my company and invite my team.
- As a dispatcher, I want to assign loads to drivers and vehicles.
- As a driver, I want to view my assignments and upload documents.
- As a compliance officer, I want to track document expirations and audit logs.
- As an accountant, I want to generate IFTA and settlement reports.

## Success Metrics
- Time to onboard a new company
- Number of compliance issues resolved
- User engagement and retention
- Reduction in manual paperwork

---

# Technical Requirements

## Architecture
- **Framework:** Next.js 15 (App Router, RSC-first)
- **Language:** TypeScript 5 (strict mode)
- **Database:** PostgreSQL (Drizzle ORM)
- **Auth:** Clerk (orgs, users, webhooks)
- **Styling:** Tailwind CSS 4, CSS tokens
- **API:** /app/api/* for auth, webhooks, integrations only
- **Server Actions:** All CRUD/mutations via React 19 Server Actions in `lib/actions/`
- **Feature Structure:**
  - `app/` for routes, layouts, pages
  - `components/` for dumb UI
  - `features/` for smart, domain-tied UI
  - `lib/` for logic, fetchers, actions
  - `types/` for shared types
  - `db/` for schema and migrations
  - `docs/` for documentation

## Security
- Strict Content Security Policy (CSP)
- Secure headers via middleware
- Multi-tenant data isolation (companyId everywhere)
- Input validation and error handling

## Integrations
- Clerk (auth/orgs/webhooks)
- Vercel (hosting, analytics)

## Testing
- Unit and integration tests for actions, fetchers, and components
- E2E tests for critical flows (onboarding, dispatch, compliance)

---

# TODO (Development & Documentation)

## Remaining Development
- [ ] Complete all Server Actions for CRUD in `lib/actions/`
- [ ] Implement all fetchers in `lib/fetchers/`
- [ ] Finalize all feature UIs in `features/` (auditlog, compliance, dispatch, drivers, ifta, insurance, invoices, settings, settlements, vehicles)
- [ ] Add E2E and integration tests
- [ ] Polish onboarding and company switcher flows
- [ ] Harden error handling and input validation
- [ ] Optimize for performance and accessibility
- [ ] Productionize Clerk (switch to production keys, review org settings)
- [ ] Monitor and resolve any webhook delivery issues

## Documentation
- [ ] Write feature docs in `docs/` for each major domain (compliance, dispatch, drivers, ifta, etc.)
- [ ] Add architecture and data flow diagrams
- [ ] Document API endpoints and server actions
- [ ] Add onboarding and deployment guides
- [ ] Maintain a changelog and release notes

---

# Glory Notes
FleetFusion is a modern, scalable, and secure platform designed for the future of fleet management. Its architecture and codebase are a model for modern fullstack SaaS, with best-in-class practices for maintainability, security, and developer experience.
