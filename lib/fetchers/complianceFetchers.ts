'use server';

import prisma from '@/lib/database';
import { auth } from '@clerk/nextjs/server';
import { 
  ComplianceDocument, 
  HOSLog, 
  DVIRReport, 
  MaintenanceRecord, 
  SafetyEvent,
  ComplianceAlert,
  AuditLog,
  ComplianceDocumentFilter,
  ComplianceStats,
  ComplianceOverview,
  HOSFilter,
  DVIRFilter,
  MaintenanceFilter,
  SafetyEventFilter
} from '@/types/compliance';
import {
  complianceDocumentFilterSchema,
  hosFilterSchema,
  dvirFilterSchema,
  maintenanceFilterSchema,
  safetyEventFilterSchema
} from '@/validations/compliance';
import { checkPermissions } from '@/lib/auth/permissions';
import { z } from 'zod';

// Document Fetchers
export async function getComplianceDocuments(
  filter: z.infer<typeof complianceDocumentFilterSchema> = {}
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = complianceDocumentFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      driverId,
      vehicleId,
      expiresWithin,
      isExpired,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (driverId) {
      where.driverId = driverId;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (expiresWithin) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiresWithin);
      where.expiresAt = {
        lte: futureDate,
        gte: new Date()
      };
    }

    if (isExpired) {
      where.expiresAt = {
        lt: new Date()
      };
    }

    // Execute query with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.complianceDocument.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch compliance documents'
    };
  }
}

export async function getComplianceDocument(id: string) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const document = await prisma.complianceDocument.findFirst({
      where: { id, organizationId: orgId },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            licenseNumber: true
          }
        },
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
            make: true,
            model: true,
            year: true,
            vin: true
          }
        }
      }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return { success: true, data: document };
  } catch (error) {
    console.error('Error fetching compliance document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch compliance document'
    };
  }
}

// HOS Fetchers
export async function getHOSLogs(
  filter: z.infer<typeof hosFilterSchema> = {}
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = hosFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 50,
      driverId,
      vehicleId,
      dutyStatus,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (driverId) {
      where.driverId = driverId;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (dutyStatus) {
      where.dutyStatus = dutyStatus;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.startTime = { gte: startDate };
    } else if (endDate) {
      where.startTime = { lte: endDate };
    }

    // Execute query with pagination
    const [hosLogs, totalCount] = await Promise.all([
      prisma.hOSLog.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.hOSLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        hosLogs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching HOS logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch HOS logs'
    };
  }
}

export async function getDriverHOSStatus(driverId: string) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Get current and recent HOS data for the driver
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [currentStatus, recentLogs, violations] = await Promise.all([
      // Get most recent log entry
      prisma.hOSLog.findFirst({
        where: {
          driverId,
          organizationId: orgId
        },
        orderBy: { endTime: 'desc' },
        include: {
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        }
      }),
      // Get logs from past 7 days
      prisma.hOSLog.findMany({
        where: {
          driverId,
          organizationId: orgId,
          startTime: { gte: sevenDaysAgo }
        },
        orderBy: { startTime: 'asc' }
      }),
      // Get recent violations
      prisma.complianceAlert.findMany({
        where: {
          driverId,
          organizationId: orgId,
          type: 'hos_violation',
          createdAt: { gte: sevenDaysAgo }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate HOS metrics
    const todayLogs = recentLogs.filter(log => 
      log.startTime >= new Date(today.setHours(0, 0, 0, 0))
    );

    const drivingHoursToday = todayLogs
      .filter(log => log.dutyStatus === 'driving')
      .reduce((total, log) => total + log.duration, 0) / 60; // Convert to hours

    const onDutyHoursToday = todayLogs
      .filter(log => ['driving', 'on_duty_not_driving'].includes(log.dutyStatus))
      .reduce((total, log) => total + log.duration, 0) / 60; // Convert to hours

    const availableDrivingHours = Math.max(0, 11 - drivingHoursToday);
    const availableOnDutyHours = Math.max(0, 14 - onDutyHoursToday);

    return {
      success: true,
      data: {
        currentStatus,
        metrics: {
          drivingHoursToday,
          onDutyHoursToday,
          availableDrivingHours,
          availableOnDutyHours,
          isCompliant: violations.length === 0
        },
        recentViolations: violations
      }
    };
  } catch (error) {
    console.error('Error fetching driver HOS status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch driver HOS status'
    };
  }
}

// DVIR Fetchers
export async function getDVIRReports(
  filter: z.infer<typeof dvirFilterSchema> = {}
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = dvirFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      driverId,
      vehicleId,
      inspectionType,
      defectsFound,
      startDate,
      endDate,
      sortBy = 'inspectionDate',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (driverId) {
      where.driverId = driverId;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (inspectionType) {
      where.inspectionType = inspectionType;
    }

    if (defectsFound !== undefined) {
      where.defectsFound = defectsFound;
    }

    if (startDate && endDate) {
      where.inspectionDate = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.inspectionDate = { gte: startDate };
    } else if (endDate) {
      where.inspectionDate = { lte: endDate };
    }

    // Execute query with pagination
    const [dvirReports, totalCount] = await Promise.all([
      prisma.dVIRReport.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.dVIRReport.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        dvirReports,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching DVIR reports:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch DVIR reports'
    };
  }
}

// Maintenance Fetchers
export async function getMaintenanceRecords(
  filter: z.infer<typeof maintenanceFilterSchema> = {}
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = maintenanceFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      vehicleId,
      type,
      status,
      startDate,
      endDate,
      sortBy = 'serviceDate',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.serviceDate = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.serviceDate = { gte: startDate };
    } else if (endDate) {
      where.serviceDate = { lte: endDate };
    }

    // Execute query with pagination
    const [maintenanceRecords, totalCount] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.maintenanceRecord.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        maintenanceRecords,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch maintenance records'
    };
  }
}

// Safety Event Fetchers
export async function getSafetyEvents(
  filter: z.infer<typeof safetyEventFilterSchema> = {}
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = safetyEventFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      driverId,
      vehicleId,
      type,
      severity,
      startDate,
      endDate,
      sortBy = 'eventDate',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (driverId) {
      where.driverId = driverId;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (type) {
      where.type = type;
    }

    if (severity) {
      where.severity = severity;
    }

    if (startDate && endDate) {
      where.eventDate = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.eventDate = { gte: startDate };
    } else if (endDate) {
      where.eventDate = { lte: endDate };
    }

    // Execute query with pagination
    const [safetyEvents, totalCount] = await Promise.all([
      prisma.safetyEvent.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.safetyEvent.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        safetyEvents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching safety events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch safety events'
    };
  }
}

// Alert Fetchers
export async function getComplianceAlerts(
  page: number = 1,
  limit: number = 20,
  status?: 'unread' | 'read' | 'dismissed'
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (status) {
      where.status = status;
    }

    // Execute query with pagination
    const [alerts, totalCount] = await Promise.all([
      prisma.complianceAlert.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.complianceAlert.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching compliance alerts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch compliance alerts'
    };
  }
}

// Statistics and Analytics
export async function getComplianceStats() {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalDocuments,
      expiredDocuments,
      expiringDocuments,
      recentDVIRs,
      dvirsWithDefects,
      recentSafetyEvents,
      criticalSafetyEvents,
      unreadAlerts
    ] = await Promise.all([
      // Total active documents
      prisma.complianceDocument.count({
        where: {
          organizationId: orgId,
          status: 'active'
        }
      }),
      // Expired documents
      prisma.complianceDocument.count({
        where: {
          organizationId: orgId,
          expiresAt: { lt: new Date() }
        }
      }),
      // Documents expiring in next 30 days
      prisma.complianceDocument.count({
        where: {
          organizationId: orgId,
          expiresAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      // DVIR reports in last 30 days
      prisma.dVIRReport.count({
        where: {
          organizationId: orgId,
          inspectionDate: { gte: thirtyDaysAgo }
        }
      }),
      // DVIR reports with defects in last 30 days
      prisma.dVIRReport.count({
        where: {
          organizationId: orgId,
          inspectionDate: { gte: thirtyDaysAgo },
          defectsFound: true
        }
      }),
      // Safety events in last 30 days
      prisma.safetyEvent.count({
        where: {
          organizationId: orgId,
          eventDate: { gte: thirtyDaysAgo }
        }
      }),
      // Critical safety events in last 30 days
      prisma.safetyEvent.count({
        where: {
          organizationId: orgId,
          eventDate: { gte: thirtyDaysAgo },
          severity: 'critical'
        }
      }),
      // Unread alerts
      prisma.complianceAlert.count({
        where: {
          organizationId: orgId,
          status: 'unread'
        }
      })
    ]);

    return {
      success: true,
      data: {
        documents: {
          total: totalDocuments,
          expired: expiredDocuments,
          expiring: expiringDocuments,
          complianceRate: totalDocuments > 0 ? 
            ((totalDocuments - expiredDocuments) / totalDocuments * 100) : 100
        },
        dvir: {
          total: recentDVIRs,
          withDefects: dvirsWithDefects,
          defectRate: recentDVIRs > 0 ? (dvirsWithDefects / recentDVIRs * 100) : 0
        },
        safety: {
          totalEvents: recentSafetyEvents,
          criticalEvents: criticalSafetyEvents,
          criticalRate: recentSafetyEvents > 0 ? (criticalSafetyEvents / recentSafetyEvents * 100) : 0
        },
        alerts: {
          unread: unreadAlerts
        }
      }
    };
  } catch (error) {
    console.error('Error fetching compliance stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch compliance stats'
    };
  }
}

export async function getComplianceOverview() {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:read');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const [
      recentDocuments,
      urgentAlerts,
      recentDVIRs,
      upcomingMaintenance
    ] = await Promise.all([
      // Recent documents
      prisma.complianceDocument.findMany({
        where: { organizationId: orgId },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Urgent alerts
      prisma.complianceAlert.findMany({
        where: {
          organizationId: orgId,
          severity: 'high',
          status: 'unread'
        },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Recent DVIR reports
      prisma.dVIRReport.findMany({
        where: { organizationId: orgId },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true
            }
          }
        },
        orderBy: { inspectionDate: 'desc' },
        take: 5
      }),
      // Upcoming maintenance
      prisma.maintenanceRecord.findMany({
        where: {
          organizationId: orgId,
          status: 'scheduled',
          serviceDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        },
        include: {
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true
            }
          }
        },
        orderBy: { serviceDate: 'asc' },
        take: 5
      })
    ]);

    return {
      success: true,
      data: {
        recentDocuments,
        urgentAlerts,
        recentDVIRs,
        upcomingMaintenance
      }
    };
  } catch (error) {
    console.error('Error fetching compliance overview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch compliance overview'
    };
  }
}
