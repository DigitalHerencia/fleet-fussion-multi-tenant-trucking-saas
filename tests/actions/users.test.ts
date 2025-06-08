const vitest = await import('vitest')
const { describe, it, expect, beforeEach, vi } = vitest

vi.mock('@clerk/nextjs/server', () => {
  return {
    clerkClient: async () => ({
      invitations: {
        revokeInvitation: vi.fn(async () => ({})),
      },
    }),
    auth: vi.fn(async () => ({ userId: 'user1', orgId: 'org1' })),
    currentUser: vi.fn(async () => ({
      id: 'user1',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      publicMetadata: { role: 'admin', permissions: [{ action: 'manage', resource: 'user' }], organizationId: 'org1', onboardingComplete: true, isActive: true },
      firstName: 'Test',
      lastName: 'User',
      imageUrl: ''
    })),
  }
})

vi.mock('@/lib/database/db', () => ({ db: {} }))
vi.mock('@/lib/actions/auditActions', () => ({ logAuditEvent: vi.fn(async () => ({})) }))
vi.mock('@/lib/auth/auth', () => ({ getCurrentUser: vi.fn(async () => ({
  name: 'Test User',
  userId: 'user1',
  organizationId: 'org1',
  role: 'admin',
  permissions: [{ action: 'manage', resource: 'user' }],
  email: 'test@example.com',
  isActive: true,
  onboardingComplete: true,
  organizationMetadata: {} as any
})) }))

import { revokeInvitation } from '@/lib/actions/users'

describe('revokeInvitation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates invitation id', async () => {
    const result = await revokeInvitation('')
    expect(result.success).toBe(false)
  })

  it('returns success when revoked', async () => {
    const result = await revokeInvitation('inv_123')
    expect(result.success).toBe(true)
  })
})
