# Testing Strategy

Comprehensive testing strategy for FleetFusion covering unit, integration, and end-to-end testing.

## Table of Contents
- [Overview](#overview)
- [Testing Philosophy](#testing-philosophy)
- [Test Setup](#test-setup)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [API Testing](#api-testing)
- [Database Testing](#database-testing)
- [Authentication Testing](#authentication-testing)
- [Performance Testing](#performance-testing)
- [Test Automation](#test-automation)

## Overview

FleetFusion currently has **zero test coverage** (as noted in the MVP audit). This strategy establishes a comprehensive testing framework using modern tools aligned with the Next.js 15 and React 19 stack.

### Testing Pyramid

```
    E2E Tests (Playwright)
      Integration Tests (Jest + RTL)
        Unit Tests (Jest + Vitest)
```

- **Unit Tests**: 70% - Test individual functions and components
- **Integration Tests**: 20% - Test API routes and database operations  
- **E2E Tests**: 10% - Test critical user journeys

## Testing Philosophy

### Principles
1. **Test Behavior, Not Implementation**: Focus on what the code does, not how
2. **Write Tests First**: Use TDD for new features
3. **Fast Feedback**: Unit tests should run in milliseconds
4. **Realistic Testing**: Integration tests use real database (test environment)
5. **User-Centric**: E2E tests follow actual user workflows

### Coverage Goals
- **Code Coverage**: 80% minimum
- **Branch Coverage**: 70% minimum
- **Critical Paths**: 100% coverage for authentication, payments, data mutations

## Test Setup

### Install Testing Dependencies

```bash
npm install --save-dev \
  jest \
  @jest/globals \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  playwright \
  @playwright/test \
  vitest \
  msw \
  prisma-test-utils
```

### Jest Configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Jest Setup File

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
  }),
  useOrganization: () => ({
    organization: { id: 'test-org', name: 'Test Org' },
  }),
  auth: () => ({
    userId: 'test-user',
    orgId: 'test-org',
  }),
}))

// Setup MSW
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Package.json Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit"
  }
}
```

## Unit Testing

### Component Testing

Test UI components using React Testing Library:

```typescript
// components/__tests__/VehicleCard.test.tsx
import { render, screen } from '@testing-library/react'
import { VehicleCard } from '../VehicleCard'
import { mockVehicle } from '../../mocks/vehicle'

describe('VehicleCard', () => {
  it('displays vehicle information correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} />)
    
    expect(screen.getByText(mockVehicle.makeModel)).toBeInTheDocument()
    expect(screen.getByText(mockVehicle.vinNumber)).toBeInTheDocument()
    expect(screen.getByText(mockVehicle.status)).toBeInTheDocument()
  })

  it('shows active status with correct styling', () => {
    const activeVehicle = { ...mockVehicle, status: 'ACTIVE' }
    render(<VehicleCard vehicle={activeVehicle} />)
    
    const statusBadge = screen.getByText('ACTIVE')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })
})
```

### Server Action Testing

Test server actions with mock database:

```typescript
// lib/actions/__tests__/drivers.test.ts
import { createDriver } from '../drivers'
import { prismaMock } from '../../mocks/prisma'
import { mockUser } from '../../mocks/user'

// Mock auth
jest.mock('../auth', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve(mockUser)),
  hasPermission: jest.fn(() => true),
}))

describe('Driver Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates driver successfully', async () => {
    const driverData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      licenseNumber: 'DL123456',
    }

    prismaMock.driver.create.mockResolvedValue({
      id: 'driver-1',
      ...driverData,
      organizationId: 'org-1',
    })

    const result = await createDriver('org-1', driverData)

    expect(result.success).toBe(true)
    expect(prismaMock.driver.create).toHaveBeenCalledWith({
      data: {
        ...driverData,
        organizationId: 'org-1',
      },
    })
  })

  it('fails with invalid input', async () => {
    const invalidData = { firstName: '' } // Missing required fields

    const result = await createDriver('org-1', invalidData)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid input')
  })
})
```

### Utility Function Testing

Test pure functions and utilities:

```typescript
// lib/utils/__tests__/validation.test.ts
import { validateDriverLicense, calculateMileage } from '../validation'

describe('Validation Utils', () => {
  describe('validateDriverLicense', () => {
    it('validates correct license format', () => {
      expect(validateDriverLicense('DL123456789')).toBe(true)
      expect(validateDriverLicense('CDL987654321')).toBe(true)
    })

    it('rejects invalid license format', () => {
      expect(validateDriverLicense('123')).toBe(false)
      expect(validateDriverLicense('')).toBe(false)
      expect(validateDriverLicense('INVALID')).toBe(false)
    })
  })

  describe('calculateMileage', () => {
    it('calculates distance between coordinates', () => {
      const start = { lat: 40.7128, lng: -74.0060 } // NYC
      const end = { lat: 34.0522, lng: -118.2437 } // LA
      
      const distance = calculateMileage(start, end)
      expect(distance).toBeCloseTo(2445, 0) // ~2445 miles
    })
  })
})
```

## Integration Testing

### API Route Testing

Test Next.js API routes with real database:

```typescript
// app/api/__tests__/drivers.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '../drivers/route'
import { prismaMock } from '../../../mocks/prisma'

describe('/api/drivers', () => {
  it('GET returns drivers for organization', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: { authorization: 'Bearer test-token' },
    })

    prismaMock.driver.findMany.mockResolvedValue([
      { id: 'driver-1', firstName: 'John', lastName: 'Doe' },
    ])

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.drivers).toHaveLength(1)
  })

  it('POST creates new driver', async () => {
    const driverData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: driverData,
      headers: { authorization: 'Bearer test-token' },
    })

    prismaMock.driver.create.mockResolvedValue({
      id: 'driver-2',
      ...driverData,
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
  })
})
```

### Database Integration Testing

Test database operations with test database:

```typescript
// lib/database/__tests__/integration.test.ts
import { PrismaClient } from '@prisma/client'
import { createTestDatabase, cleanupTestDatabase } from '../../test-utils'

const prisma = new PrismaClient()

describe('Database Integration', () => {
  beforeAll(async () => {
    await createTestDatabase()
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  beforeEach(async () => {
    // Clean up between tests
    await prisma.driver.deleteMany()
    await prisma.organization.deleteMany()
  })

  it('creates driver with organization relationship', async () => {
    // Create organization
    const org = await prisma.organization.create({
      data: {
        clerkId: 'clerk-org-1',
        name: 'Test Fleet',
        slug: 'test-fleet',
      },
    })

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        organizationId: org.id,
      },
    })

    expect(driver.organizationId).toBe(org.id)

    // Verify relationship
    const driverWithOrg = await prisma.driver.findUnique({
      where: { id: driver.id },
      include: { organization: true },
    })

    expect(driverWithOrg?.organization.name).toBe('Test Fleet')
  })
})
```

## End-to-End Testing

### Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/driver-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Driver Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/sign-in')
    await page.fill('[name="email"]', 'admin@testfleet.com')
    await page.fill('[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*\/dashboard/)
  })

  test('creates new driver', async ({ page }) => {
    await page.goto('/test-org/drivers')
    await page.click('text=Add Driver')

    // Fill form
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.fill('[name="licenseNumber"]', 'DL123456')

    // Submit
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=Driver created successfully')).toBeVisible()
    await expect(page.locator('text=John Doe')).toBeVisible()
  })

  test('edits existing driver', async ({ page }) => {
    await page.goto('/test-org/drivers')
    
    // Click edit on first driver
    await page.click('[data-testid="edit-driver-btn"]')

    // Update phone number
    await page.fill('[name="phone"]', '555-0123')
    await page.click('button[type="submit"]')

    // Verify update
    await expect(page.locator('text=Driver updated successfully')).toBeVisible()
  })
})
```

## API Testing

### Mock Service Worker Setup

Create `mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const server = setupServer(
  rest.get('/api/drivers', (req, res, ctx) => {
    return res(
      ctx.json({
        drivers: [
          { id: '1', firstName: 'John', lastName: 'Doe' },
          { id: '2', firstName: 'Jane', lastName: 'Smith' },
        ],
      })
    )
  }),

  rest.post('/api/drivers', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...req.body })
    )
  }),

  rest.get('/api/vehicles', (req, res, ctx) => {
    return res(
      ctx.json({
        vehicles: [
          { id: '1', makeModel: 'Freightliner Cascadia', status: 'ACTIVE' },
        ],
      })
    )
  })
)
```

## Database Testing

### Test Database Setup

Create `lib/test-utils/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function createTestDatabase() {
  // Reset test database
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
  
  // Run migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
}

export async function cleanupTestDatabase() {
  await prisma.$disconnect()
}

export async function createTestOrganization() {
  return await prisma.organization.create({
    data: {
      clerkId: 'test-org-clerk-id',
      name: 'Test Fleet Company',
      slug: 'test-fleet',
    },
  })
}

export async function createTestUser(organizationId: string) {
  return await prisma.user.create({
    data: {
      clerkId: 'test-user-clerk-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
      organizationId,
    },
  })
}
```

## Authentication Testing

### Clerk Mock Setup

Create `mocks/clerk.ts`:

```typescript
export const mockClerkUser = {
  id: 'user_test123',
  emailAddresses: [
    { emailAddress: 'test@example.com', id: 'email_test123' },
  ],
  firstName: 'Test',
  lastName: 'User',
  publicMetadata: {
    role: 'admin',
    organizationId: 'org_test123',
  },
}

export const mockClerkOrganization = {
  id: 'org_test123',
  name: 'Test Fleet Company',
  slug: 'test-fleet',
  membersCount: 5,
}

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({ user: mockClerkUser, isLoaded: true }),
  useOrganization: () => ({ 
    organization: mockClerkOrganization, 
    isLoaded: true 
  }),
  useAuth: () => ({ 
    userId: mockClerkUser.id, 
    orgId: mockClerkOrganization.id,
    isLoaded: true 
  }),
  auth: () => ({
    userId: mockClerkUser.id,
    orgId: mockClerkOrganization.id,
  }),
}))
```

## Performance Testing

### Load Testing Setup

Create `performance/load-test.js`:

```javascript
// Using Artillery for load testing
module.exports = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      { duration: 60, arrivalRate: 5 }, // Warm up
      { duration: 120, arrivalRate: 10 }, // Sustained load
      { duration: 60, arrivalRate: 20 }, // Peak load
    ],
  },
  scenarios: [
    {
      name: 'Driver Dashboard',
      flow: [
        { get: { url: '/api/drivers' } },
        { get: { url: '/api/vehicles' } },
        { get: { url: '/api/loads' } },
      ],
    },
    {
      name: 'Create Driver',
      flow: [
        {
          post: {
            url: '/api/drivers',
            json: {
              firstName: 'Load',
              lastName: 'Test',
              email: 'load@test.com',
            },
          },
        },
      ],
    },
  ],
}
```

## Test Automation

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fleetfusion_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        run: npx prisma migrate dev
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/fleetfusion_test

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Install Playwright browsers
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Install and configure Husky:

```bash
npm install --save-dev husky lint-staged

# Setup pre-commit hook
npx husky add .husky/pre-commit "lint-staged"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests",
      "git add"
    ]
  }
}
```

This comprehensive testing strategy provides:

1. **Complete coverage** of all application layers
2. **Modern tooling** aligned with Next.js 15 and React 19
3. **Realistic testing** with actual database integration
4. **Automated workflows** for continuous integration
5. **Performance monitoring** for scalability assurance

The strategy addresses the current zero test coverage and establishes a robust foundation for maintaining code quality as the application grows.
