# FleetFusion Developer Wiki

Welcome to the FleetFusion developer knowledge repository. This wiki serves as the comprehensive
guide for developers, architects, and stakeholders working on the FleetFusion multi-tenant SaaS
platform.

## Quick Navigation

### 🏗️ Architecture & Design

- [**Technical Architecture**](./Architecture.md) - System overview, patterns, and design decisions
- [**Domain Model**](./Domains.md) - Business domains and bounded contexts
- [**Database Schema**](./Database.md) - Complete schema, relationships, and constraints
- [**RBAC & Security**](./Security.md) - Role-based access control and multi-tenancy

### 🚀 Development

- [**Getting Started**](./Getting-Started.md) - Setup, environment, and first run
- [**API Documentation**](./API-Documentation.md) - Server actions, fetchers, and endpoints
- [**Design System**](./Design-System.md) - UI components and design guidelines
- [**Dashboard Guide**](./Dashboard-Guide.md) - Dashboard implementation and best practices
- [**Authentication**](./Authentication.md) - Clerk integration and user management

### 📋 Operations

- [**Deployment**](./Deployment.md) - Vercel deployment and CI/CD
- [**Testing Strategy**](./Testing-Strategy.md) - Unit, integration, and E2E testing
- [**Environment Setup**](./Environment.md) - Configuration and secrets management
- [**Troubleshooting**](./Troubleshooting.md) - Common issues and solutions

### 📚 Reference

- [**Type Definitions**](./Types.md) - TypeScript interfaces and schemas
- [**Monitoring Guide**](./Monitoring.md) - Analytics, logging, and performance
- [**Changelog**](./Changelog.md) - Version history and updates
- [**Contributing**](./Contributing.md) - Development guidelines and standards

---

## Project Overview

**FleetFusion** is a modern, multi-tenant SaaS platform built for trucking companies to manage their
entire fleet operations. The platform provides comprehensive tools for vehicle management, driver
oversight, load dispatch, compliance tracking, and business analytics.

### Current Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Backend**: React Server Actions, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk with RBAC
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

### Key Features

- 🚦 Dispatch management with drag-and-drop
- 🚚 Vehicle fleet tracking and maintenance
- 👨‍✈️ Driver management and HOS compliance
- 📋 DOT compliance and document management
- ⛽ IFTA reporting and tax calculations
- 📊 Real-time analytics and reporting
- 🏢 Multi-tenant organization support
- 🔐 Role-based access control

---

## Architecture Principles

### Next.js 15 Patterns

- **Server-first**: Default to server components and server-side data fetching
- **Feature-driven**: Organize code by business domain, not technical layer
- **Type safety**: Comprehensive TypeScript with strict mode
- **Performance**: Optimized bundle sizes and runtime performance

### Multi-tenancy

- **Organization-based**: Each company operates as isolated tenant
- **RBAC enforcement**: Role-based permissions at data and UI levels
- **Scalable**: Designed for thousands of organizations

### Data Flow

- **Server Actions**: All mutations through typed server actions
- **Fetchers**: Domain-specific data fetching functions
- **Caching**: Strategic caching at multiple levels
- **Validation**: Zod schemas for all inputs and outputs

---

_Last updated: June 2025_
