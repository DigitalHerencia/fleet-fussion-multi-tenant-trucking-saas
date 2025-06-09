import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getExpiringDocuments } from '../lib/fetchers/complianceFetchers';
import prisma from '../lib/database/db';

vi.mock('../lib/database/db', () => ({
  __esModule: true,
  default: {
    complianceDocument: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'user1' }),
}));

describe('getExpiringDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns documents from prisma', async () => {
    const docs = [{ id: '1', title: 'Test', expirationDate: new Date() }];
    (prisma.complianceDocument.findMany as any).mockResolvedValue(docs);
    const res = await getExpiringDocuments('org1', 7);
    expect(prisma.complianceDocument.findMany).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });
});
