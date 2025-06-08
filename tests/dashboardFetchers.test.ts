import { describe, it, expect, vi } from 'vitest';

// Mock next/cache unstable_cache to simply execute the function
vi.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
}));

// Mock prisma client with sample counts
vi.mock('@/lib/database/db', () => ({
  default: {
    load: { count: vi.fn().mockResolvedValue(3) },
    driver: { count: vi.fn().mockResolvedValue(4) },
    vehicle: { count: vi.fn().mockResolvedValue(5) },
    complianceAlert: { count: vi.fn().mockResolvedValue(2) },
  },
}));

import { getDashboardMetrics } from '../lib/fetchers/dashboardFetchers';

describe('getDashboardMetrics', () => {
  it('returns metrics counts', async () => {
    const metrics = await getDashboardMetrics('org1');
    expect(metrics).toEqual({ loads: 3, drivers: 4, vehicles: 5, alerts: 2 });
  });
});
