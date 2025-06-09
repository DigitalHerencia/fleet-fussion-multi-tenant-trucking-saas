'use server';

import { unstable_cache } from 'next/cache';
import prisma from '@/lib/database/db';

/**
 * Fetch basic dashboard metrics with caching.
 * Metrics include active load, driver, vehicle counts and critical alerts.
 */
export const getDashboardMetrics = async (orgId: string) =>
  unstable_cache(
    async () => {
      const [loads, drivers, vehicles, alerts] = await Promise.all([        prisma.load.count({
          where: { organizationId: orgId, status: 'in_transit' },
        }),
        prisma.driver.count({
          where: { organizationId: orgId, status: 'active' },
        }),
        prisma.vehicle.count({
          where: { organizationId: orgId, status: 'active' },
        }),
        prisma.complianceAlert.count({
          where: { organizationId: orgId, severity: 'critical' },
        }),
      ]);

      return {
        loads,
        drivers,
        vehicles,
        alerts,
      } as const;
    },
    ['dashboard-metrics', orgId],
    {
      revalidate: 300,
      tags: [`dashboard-${orgId}`],
    }
  )();
