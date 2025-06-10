'use server';

import { auth } from '@clerk/nextjs/server';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/database/db';
import { SystemRoles } from '@/types/abac';
import type { DashboardMetrics, DashboardData, ActivityItem, DashboardKPI, QuickAction } from '@/types/dashboard';

export const getDashboardMetrics = unstable_cache(
  async (orgId: string): Promise<DashboardMetrics> => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findFirst({
      where: { clerkId: userId, organizationId: orgId },
    });
    if (!user) throw new Error('User not found or unauthorized');

    const [
      totalLoads,
      activeLoads,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      availableVehicles,
      maintenanceVehicles,
      alertsCount,
    ] = await Promise.all([
      db.load.count({ where: { organizationId: orgId } }),
      db.load.count({ 
        where: { 
          organizationId: orgId,
          status: { in: ['assigned', 'in_transit', 'at_pickup', 'at_delivery'] }
        }
      }),
      db.driver.count({ where: { organizationId: orgId } }),
      db.driver.count({ 
        where: { 
          organizationId: orgId,
          status: 'active'
        }
      }),
      db.vehicle.count({ where: { organizationId: orgId } }),
      db.vehicle.count({ 
        where: { 
          organizationId: orgId,
          status: 'active'
        }
      }),
      db.vehicle.count({ 
        where: { 
          organizationId: orgId,
          status: 'maintenance'
        }
      }),
      db.complianceAlert.count({ 
        where: { 
          organizationId: orgId,
          status: { not: 'resolved' }
        }
      }),
    ]);

    return {
      activeLoads,
      totalLoads,
      activeDrivers,
      totalDrivers,
      availableVehicles,
      totalVehicles,
      maintenanceVehicles,
      criticalAlerts: alertsCount,
      complianceScore: 85, // TODO: Calculate based on compliance metrics
      revenue: 0, // TODO: Calculate from completed loads
      fuelCosts: 0, // TODO: Calculate from expense records
    };
  },
  ['dashboard-metrics'],
  {
    revalidate: 300, // 5 minutes
    tags: ['dashboard'],
  }
);

export const getDashboardKPIs = async (orgId: string, metrics: DashboardMetrics): Promise<DashboardKPI[]> => {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await db.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
    select: { role: true },
  });
  if (!user) throw new Error('Unauthorized');

  const utilizationRate = metrics.totalVehicles > 0 
    ? Math.round(((metrics.totalVehicles - metrics.availableVehicles) / metrics.totalVehicles) * 100)
    : 0;

  const kpis: DashboardKPI[] = [
    {
      title: 'Active Loads',
      value: metrics.activeLoads,
      icon: 'Truck',
      color: 'blue',
      trend: 'up',
      change: 12,
    },
    {
      title: 'Available Drivers',
      value: metrics.activeDrivers,
      icon: 'Users',
      color: 'green',
      trend: 'neutral',
    },
    {
      title: 'Fleet Utilization',
      value: `${utilizationRate}%`,
      icon: 'Activity',
      color: 'purple',
      trend: 'up',
      change: 5,
    },
    {
      title: 'Active Alerts',
      value: metrics.criticalAlerts,
      icon: 'AlertTriangle',
      color: metrics.criticalAlerts > 0 ? 'red' : 'green',
    },
  ];

  return kpis;
};

export const getQuickActions = async (orgId: string): Promise<QuickAction[]> => {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await db.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
    select: { role: true },
  });
  if (!user) throw new Error('Unauthorized');
  const actions: QuickAction[] = [
    {
      title: 'Create Load',
      description: 'Add a new load to the system',
      href: `/${orgId}/loads/new`,
      icon: 'Plus',
      color: 'bg-blue-500',
      permission: ['admin', 'dispatcher'],
      priority: 'high',
      shortcut: 'Ctrl+N',
      category: 'dispatch',
    },
    {
      title: 'Assign Driver',
      description: 'Assign drivers to available loads',
      href: `/${orgId}/loads?assign=true`,
      icon: 'UserPlus',
      color: 'bg-green-500',
      permission: ['admin', 'dispatcher'],
      priority: 'high',
      shortcut: 'Ctrl+A',
      category: 'dispatch',
    },
    {
      title: 'Emergency Dispatch',
      description: 'Handle urgent load assignments',
      href: `/${orgId}/dispatch/emergency`,
      icon: 'AlertCircle',
      color: 'bg-red-500',
      permission: ['admin', 'dispatcher'],
      priority: 'high',
      badge: { text: 'URGENT', variant: 'destructive' },
      category: 'dispatch',
    },
    {
      title: 'Track Vehicles',
      description: 'Real-time vehicle tracking',
      href: `/${orgId}/tracking`,
      icon: 'MapPin',
      color: 'bg-indigo-500',
      permission: ['admin', 'dispatcher', 'compliance_officer'],
      priority: 'medium',
      shortcut: 'Ctrl+T',
      category: 'fleet',
    },
    {
      title: 'Compliance Alerts',
      description: 'Review safety and compliance issues',
            href: `/${orgId}/compliance/alerts`,
      icon: 'AlertCircle',
      color: 'bg-orange-500',
      permission: ['admin', 'compliance_officer'],
      category: 'compliance'
    },
    {
      title: 'Add Vehicle',
      description: 'Register new vehicle to fleet',
      href: `/${orgId}/vehicles/new`,
      icon: 'Truck',
      color: 'bg-purple-500',
      permission: ['admin'],
      priority: 'medium',
      category: 'fleet',
    },
    {
      title: 'IFTA Reports',
      description: 'Generate fuel tax reports',
      href: `/${orgId}/ifta`,
      icon: 'FileText',
      color: 'bg-teal-500',
      permission: ['admin', 'accountant'],
      priority: user.role === SystemRoles.ACCOUNTANT ? 'high' : 'low',
      category: 'financial',
    },
    {
      title: 'Driver HOS',
      description: 'Hours of Service monitoring',
      href: `/${orgId}/drivers/hos`,
      icon: 'Clock',
      color: 'bg-cyan-500',
      permission: ['admin', 'dispatcher', 'compliance_officer'],
      priority: 'medium',
      category: 'compliance',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed performance metrics',
      href: `/${orgId}/analytics`,
      icon: 'BarChart3',
      color: 'bg-emerald-500',
      permission: ['admin', 'dispatcher', 'compliance_officer', 'accountant'],
      priority: 'medium',
      category: 'admin',
    },
    {
      title: 'Settings',
      description: 'Manage organization settings',
      href: `/${orgId}/settings`,
      icon: 'Settings',
      color: 'bg-gray-500',
      permission: ['admin'],
      priority: 'low',
      category: 'admin',
    },
    {
      title: 'Quick Invoice',
      description: 'Generate invoice for completed load',
      href: `/${orgId}/billing/quick-invoice`,
      icon: 'DollarSign',
      color: 'bg-green-600',
      permission: ['admin', 'accountant'],
      priority: 'medium',
      shortcut: 'Ctrl+I',
      category: 'financial',
    },
    {
      title: 'Vehicle Inspection',
      description: 'Schedule or complete inspections',
      href: `/${orgId}/vehicles/inspections`,
      icon: 'CheckCircle',
      color: 'bg-blue-600',
      permission: ['admin', 'compliance_officer', 'driver'],
      priority: user.role === SystemRoles.DRIVER ? 'high' : 'medium',
      category: 'compliance',
    },
  ];

  return actions.filter(action => 
    action.permission.includes(user.role)
  );
};

export const getRecentActivity = unstable_cache(
  async (orgId: string): Promise<ActivityItem[]> => {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const user = await db.user.findFirst({
      where: { clerkId: userId, organizationId: orgId },
    });
    if (!user) throw new Error('Unauthorized');

    const auditLogs = await db.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    return auditLogs.map(log => ({
      id: log.id,
      type: log.entityType as ActivityItem['type'],
      title: log.action,
      description: `${log.action} on ${log.entityType}`,
      timestamp: log.timestamp,
      userId: log.userId || undefined,
      userName: 'User',
      severity: 'info' as const,
    }));
  },
  ['dashboard-activity'],
  {
    revalidate: 60, // 1 minute
    tags: ['dashboard', 'activity'],
  }
);

export const getDashboardData = async (orgId: string): Promise<DashboardData> => {
  const [metrics, recentActivity] = await Promise.all([
    getDashboardMetrics(orgId),
    getRecentActivity(orgId),
  ]);

  const [kpis, quickActions] = await Promise.all([
    getDashboardKPIs(orgId, metrics),
    getQuickActions(orgId),
  ]);

  // Get alerts (simplified for MVP)
  const alerts = await db.complianceAlert.findMany({
    where: {
      organizationId: orgId,
      status: { not: 'resolved' },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    metrics,
    kpis,
    quickActions,
    recentActivity,
    alerts: alerts.map(alert => ({
      id: alert.id,
      type: 'document_missing' as const,
      title: `Alert ${alert.id}`,
      description: alert.notes || 'Compliance alert',
      severity: 'medium' as const,
      entityId: alert.driverId || alert.vehicleId || '',
      entityType: alert.driverId ? 'driver' as const : 'vehicle' as const,
      createdAt: alert.createdAt,
    })),
  };
};

export const getRoleBasedDashboardData = async (orgId: string, userRole: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Get base dashboard data
  const baseData = await getDashboardData(orgId);
  
  // Filter KPIs and actions based on role
  const filteredKPIs = baseData.kpis.filter(kpi => {
    switch (userRole) {
      case 'driver':
        return ['Active Loads', 'Available Drivers'].includes(kpi.title);
      case 'compliance_officer':
        return ['Active Alerts', 'Fleet Utilization'].includes(kpi.title);
      case 'accountant':
        return ['Active Loads', 'Fleet Utilization'].includes(kpi.title);
      case 'viewer':
        return true; // Can see all KPIs but read-only
      default:
        return true; // Admin and dispatcher see all
    }
  });

  const filteredActions = baseData.quickActions.filter(action => 
    action.permission.includes(userRole)
  );

  return {
    ...baseData,
    kpis: filteredKPIs,
    quickActions: filteredActions,
  };
};
