# Getting Started

Complete setup guide for FleetFusion development environment and deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Service Setup](#service-setup)
- [Database Setup](#database-setup)
- [Authentication Setup](#authentication-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or later (LTS recommended)
- **Package Manager**: npm (included with Node.js) or yarn
- **Git**: For version control
- **VS Code**: Recommended editor with TypeScript support

### Recommended VS Code Extensions

- TypeScript (built-in)
- Tailwind CSS IntelliSense
- Prisma
- ESLint
- Prettier

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/fleetfusion.git
cd fleetfusion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your service credentials (see
[Environment Configuration](#environment-configuration))

### 4. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed  # Optional: seed with sample data
```

### 5. Start Development Server

```bash
npm run dev
```

Application available at `http://localhost:3000`

## Environment Configuration

### Core Environment Variables

Copy `.env.example` to `.env` and configure:

#### Database (Neon)

```env
# Primary database connection (pooled)
DATABASE_URL=postgresql://username:password@endpoint-pooler.region.aws.neon.tech/database?sslmode=require

# Direct connection for migrations
DIRECT_URL=postgresql://username:password@endpoint.region.aws.neon.tech/database?sslmode=require
```

#### Authentication (Clerk)

```env
# Clerk authentication keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Clerk URLs
NEXT_PUBLIC_CLERK_FRONTEND_API=your-instance.clerk.accounts.dev
NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://your-domain.com/api/clerk/webhook-handler
```

#### File Storage (Vercel Blob)

```env
# Vercel Blob storage token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

#### Application Configuration

```env
# Environment
NODE_ENV=development

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=http://localhost:3000/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=http://localhost:3000/sign-up
NEXT_PUBLIC_CLERK_AFTER_LOGO_CLICK_URL=http://localhost:3000/

# Feature flags
ENABLE_ANALYTICS=true
ENABLE_EXPORT_FEATURES=true

# Debugging
LOG_LEVEL=debug
```

## Service Setup

### 1. Neon Database Setup

1. **Create Account**: Sign up at [neon.tech](https://neon.tech)

2. **Create Project**:

   - Navigate to dashboard
   - Click "Create Project"
   - Choose region closest to your users
   - Note the project ID

3. **Get Connection Strings**:

   - Go to project dashboard
   - Copy "Pooled connection" for `DATABASE_URL`
   - Copy "Direct connection" for `DIRECT_URL`

4. **Database Configuration**:
   ```sql
   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

### 2. Clerk Authentication Setup

1. **Create Account**: Sign up at [clerk.com](https://clerk.com)

2. **Create Application**:

   - Choose "Next.js" as framework
   - Select authentication methods (email, OAuth)
   - Note application ID

3. **Configure OAuth Providers**:

   - Go to "User & Authentication" → "Social providers"
   - Enable Google, GitHub, or other providers
   - Configure redirect URLs

4. **Setup Webhooks**:

   - Go to "Webhooks" in dashboard
   - Add endpoint: `https://your-domain.com/api/clerk/webhook-handler`
   - Select events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `organization.created`
     - `organizationMembership.created`
     - `organizationMembership.updated`
     - `organizationMembership.deleted`

5. **Organization Settings**:
   - Enable organizations in Clerk dashboard
   - Configure organization creation permissions
   - Set up organization roles and permissions

### 3. Vercel Blob Storage Setup

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)

2. **Create Project**: Import your GitHub repository

3. **Setup Blob Storage**:
   - Go to project dashboard
   - Navigate to "Storage" tab
   - Create new Blob store
   - Copy read/write token

## Database Setup

### Initial Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### Seed Database (Optional)

```bash
# Seed with sample data
npx prisma db seed
```

### Database Operations

```bash
# View data in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration-name

# Deploy migrations (production)
npx prisma migrate deploy
```

### Schema Overview

Key entities in the database:

- **Organizations**: Multi-tenant containers
- **Users**: Synced with Clerk authentication
- **Drivers**: Employee profiles with licensing
- **Vehicles**: Fleet inventory and maintenance
- **Loads**: Dispatch assignments and tracking
- **ComplianceRecords**: DOT compliance and safety

## Authentication Setup

### Role-Based Access Control

The system implements comprehensive RBAC:

| Role           | Access Level | Permissions                            |
| -------------- | ------------ | -------------------------------------- |
| **Admin**      | Full         | All operations across all modules      |
| **Dispatcher** | Operational  | Driver, vehicle, and load management   |
| **Driver**     | Limited      | View assigned loads and update status  |
| **Compliance** | Specialized  | Compliance records and reporting       |
| **Accountant** | Financial    | IFTA reporting and financial analytics |
| **Manager**    | Oversight    | Read access to analytics and reports   |
| **User**       | Basic        | Read-only access to most modules       |

### Permission Matrix

Detailed permissions are defined in `lib/auth/permissions.ts`:

```typescript
const ROLE_PERMISSIONS = {
  admin: ['*'], // All permissions
  dispatcher: ['drivers:read', 'drivers:write', 'vehicles:read', 'vehicles:write', 'loads:all'],
  driver: ['loads:read:own', 'profile:read', 'profile:write'],
  compliance_officer: ['compliance:all', 'drivers:read', 'vehicles:read'],
  accountant: ['ifta:all', 'analytics:read', 'financial:read'],
  manager: ['analytics:read', 'reports:read'],
  user: ['*:read'],
};
```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Database
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Project Structure

```
fleetfusion/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Main application
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── auth/             # Authentication utilities
│   ├── actions/          # Server actions
│   ├── fetchers/         # Data fetching functions
│   └── utils/            # Helper functions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── schemas/              # Zod validation schemas
```

### Development Guidelines

#### 1. Component Development

- Use React Server Components by default
- Client components only for interactivity
- Follow the component hierarchy in `/components`

#### 2. Data Fetching

- Server Actions for mutations
- Data fetchers for queries
- Implement proper error handling

#### 3. Styling

- Use Tailwind CSS utility classes
- Follow the design system in `/components/ui`
- Responsive design with mobile-first approach

#### 4. Type Safety

- Define types in `/types` directory
- Use Zod schemas for validation
- Leverage Prisma's generated types

## Testing

### Test Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user journeys

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Testing Tools

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking

## Deployment

### Vercel Deployment

1. **Connect Repository**:

   - Import project from GitHub
   - Configure build settings

2. **Environment Variables**:

   - Add all production environment variables
   - Use Vercel's secret management

3. **Database Migration**:

   ```bash
   # Deploy migrations
   npx prisma migrate deploy
   ```

4. **Domain Configuration**:
   - Add custom domain
   - Configure DNS settings
   - Enable HTTPS

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations deployed
- [ ] Clerk webhooks configured with production URLs
- [ ] Vercel Blob storage configured
- [ ] Domain and SSL configured
- [ ] Monitoring and logging setup

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check connection
npx prisma db pull

# Reset if needed
npx prisma migrate reset
```

#### 2. Clerk Webhook Issues

- Verify webhook URL is accessible
- Check webhook secret matches
- Validate event payload structure

#### 3. Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Type Errors

```bash
# Regenerate Prisma client
npx prisma generate

# Run type check
npm run type-check
```

### Getting Help

- Check the [Wiki](../wiki/Home.md) for detailed documentation
- Review [API Reference](../wiki/API-Reference.md) for endpoints
- See [Architecture](../wiki/Architecture.md) for system design
- Join the development Slack channel for support

### Performance Tips

- Use React Server Components for static content
- Implement proper caching strategies
- Optimize database queries with Prisma
- Use Next.js Image component for images
- Monitor Core Web Vitals

This getting started guide should get you up and running with FleetFusion development. For more
detailed information, refer to the specific documentation sections in the wiki.
