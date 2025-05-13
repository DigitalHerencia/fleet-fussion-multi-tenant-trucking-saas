# FleetFusion Technical Requirements

## 1. Architecture
- **Framework:** Next.js 15 (App Router, React Server Components by default)
- **Language:** TypeScript 5 (strict mode, modern type features)
- **Database:** PostgreSQL (Drizzle ORM, multi-tenant, UUID PKs)
- **Authentication:** Clerk (orgs, users, webhooks, multi-tenancy)
- **Styling:** Tailwind CSS 4, CSS tokens, dark mode via class
- **API:** Only for auth, webhooks, 3rd-party integrations, and public APIs
- **Mutations:** All CRUD via React 19 Server Actions in `lib/actions/`
- **Feature Structure:**
  - `app/` for routes, layouts, pages
  - `components/` for dumb UI
  - `features/` for smart, domain-tied UI
  - `lib/` for logic, fetchers, actions
  - `types/` for shared types
  - `db/` for schema and migrations
  - `docs/` for documentation

## 2. Security
- Strict Content Security Policy (CSP) with all required Clerk and Vercel endpoints
- Secure headers via middleware
- Multi-tenant data isolation (companyId everywhere)
- Input validation and error handling on all actions

## 3. Integrations
- **Clerk:**
  - Org and user lifecycle
  - Webhook sync to DB
  - Production keys in production
- **Vercel:**
  - Hosting
  - Analytics

## 4. Testing
- Unit and integration tests for actions, fetchers, and components
- E2E tests for onboarding, dispatch, compliance, and critical flows

## 5. Production Readiness
- No mock data or stubs
- Full error handling and validation
- Complete business logic for all flows
- Documentation for all features and architecture

## 6. Developer Experience
- Modern, modular, and scalable codebase
- Clear separation of concerns
- Minimal Tailwind config, CSS-first theming
- All code and docs in English
