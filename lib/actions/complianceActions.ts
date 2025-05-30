'use server';

import prisma from '@/lib/database';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  ComplianceDocument,
  HosLog,
  DvirReport,
  MaintenanceRecord,
  SafetyEvent,
  ComplianceAlert,
  ComplianceOverview
} from '@/types/compliance';
import {
  createComplianceDocumentSchema,
  updateComplianceDocumentSchema,
  createHOSLogSchema,
  updateHOSLogSchema,
  createDVIRReportSchema,
  updateDVIRReportSchema,
  createMaintenanceRecordSchema,
  updateMaintenanceRecordSchema,
  createSafetyEventSchema,
  updateSafetyEventSchema,
  bulkUpdateComplianceDocumentsSchema,
  complianceDocumentFilterSchema
} from '@/validations/compliance';
import { checkPermissions } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/actions/auditActions';
import { z } from 'zod';

// Document Management Actions
export async function createComplianceDocument(data: z.infer<typeof createComplianceDocumentSchema>) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:create');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = createComplianceDocumentSchema.parse(data);

    // Check if document already exists for driver/vehicle if applicable
    if (validatedData.driverId || validatedData.vehicleId) {
      const existingDoc = await prisma.complianceDocument.findFirst({
        where: {
          organizationId: orgId,
          type: validatedData.type,
          driverId: validatedData.driverId || null,
          vehicleId: validatedData.vehicleId || null,
          expiresAt: {
            gte: new Date()
          }
        }
      });

      if (existingDoc && !validatedData.allowDuplicates) {
        throw new Error('A valid document of this type already exists');
      }
    }

    const document = await prisma.complianceDocument.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
        updatedBy: userId
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
            unitNumber: true,
            make: true,
            model: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'compliance_document',
      resourceId: document.id,
      details: {
        type: document.type,
        driverId: document.driverId,
        vehicleId: document.vehicleId
      },
      userId,
      organizationId: orgId
    });

    // Check if document is expiring soon and create alert
    if (document.expiresAt) {
      const daysUntilExpiry = Math.ceil(
        (document.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30) {
        await prisma.complianceAlert.create({
          data: {
            organizationId: orgId,
            type: 'document_expiring',
            severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
            title: `Document Expiring Soon`,
            message: `${document.type} expires in ${daysUntilExpiry} days`,
            relatedDocumentId: document.id,
            driverId: document.driverId,
            vehicleId: document.vehicleId,
            createdBy: userId
          }
        });
      }
    }

    revalidatePath('/[orgId]/compliance');
    return { success: true, data: document };
  } catch (error) {
    console.error('Error creating compliance document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create compliance document' 
    };
  }
}

export async function updateComplianceDocument(
  id: string, 
  data: z.infer<typeof updateComplianceDocumentSchema>
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:update');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = updateComplianceDocumentSchema.parse(data);

    // Get existing document
    const existingDocument = await prisma.complianceDocument.findFirst({
      where: { id, organizationId: orgId }
    });

    if (!existingDocument) {
      throw new Error('Document not found');
    }

    const updatedDocument = await prisma.complianceDocument.update({
      where: { id },
      data: {
        ...validatedData,
        updatedBy: userId,
        updatedAt: new Date()
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
            unitNumber: true,
            make: true,
            model: true
          }
        }
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'compliance_document',
      resourceId: id,
      details: {
        changes: validatedData,
        previousStatus: existingDocument.status
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance');
    return { success: true, data: updatedDocument };
  } catch (error) {
    console.error('Error updating compliance document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update compliance document' 
    };
  }
}

export async function deleteComplianceDocument(id: string) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:delete');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Get document for audit log
    const document = await prisma.complianceDocument.findFirst({
      where: { id, organizationId: orgId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    await prisma.complianceDocument.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog({
      action: 'DELETE',
      resource: 'compliance_document',
      resourceId: id,
      details: {
        type: document.type,
        driverId: document.driverId,
        vehicleId: document.vehicleId
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance');
    return { success: true };
  } catch (error) {
    console.error('Error deleting compliance document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete compliance document' 
    };
  }
}

// HOS Management Actions
export async function createHOSLog(data: z.infer<typeof createHOSLogSchema>) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:create');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = createHOSLogSchema.parse(data);

    // Check for overlapping logs
    const overlappingLog = await prisma.hOSLog.findFirst({
      where: {
        organizationId: orgId,
        driverId: validatedData.driverId,
        OR: [
          {
            startTime: {
              lte: validatedData.endTime
            },
            endTime: {
              gte: validatedData.startTime
            }
          }
        ]
      }
    });

    if (overlappingLog) {
      throw new Error('HOS log overlaps with existing entry');
    }

    const hosLog = await prisma.hOSLog.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
        updatedBy: userId
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
      }
    });

    // Check for HOS violations
    await checkHOSViolations(validatedData.driverId, orgId, userId);

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'hos_log',
      resourceId: hosLog.id,
      details: {
        driverId: hosLog.driverId,
        dutyStatus: hosLog.dutyStatus,
        duration: hosLog.duration
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance/hos');
    return { success: true, data: hosLog };
  } catch (error) {
    console.error('Error creating HOS log:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create HOS log' 
    };
  }
}

// DVIR Management Actions
export async function createDVIRReport(data: z.infer<typeof createDVIRReportSchema>) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:create');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = createDVIRReportSchema.parse(data);

    const dvirReport = await prisma.dVIRReport.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
        updatedBy: userId
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
            unitNumber: true,
            make: true,
            model: true
          }
        }
      }
    });

    // If defects found, create maintenance alerts
    if (validatedData.defectsFound && validatedData.defects && validatedData.defects.length > 0) {
      const criticalDefects = validatedData.defects.filter(d => d.severity === 'critical');
      
      if (criticalDefects.length > 0) {
        await prisma.complianceAlert.create({
          data: {
            organizationId: orgId,
            type: 'critical_defect',
            severity: 'high',
            title: 'Critical Vehicle Defects Found',
            message: `${criticalDefects.length} critical defects found during DVIR inspection`,
            dvirReportId: dvirReport.id,
            vehicleId: dvirReport.vehicleId,
            driverId: dvirReport.driverId,
            createdBy: userId
          }
        });
      }
    }

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'dvir_report',
      resourceId: dvirReport.id,
      details: {
        vehicleId: dvirReport.vehicleId,
        driverId: dvirReport.driverId,
        defectsFound: dvirReport.defectsFound,
        inspectionType: dvirReport.inspectionType
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance/dvir');
    return { success: true, data: dvirReport };
  } catch (error) {
    console.error('Error creating DVIR report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create DVIR report' 
    };
  }
}

// Maintenance Management Actions
export async function createMaintenanceRecord(data: z.infer<typeof createMaintenanceRecordSchema>) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:create');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = createMaintenanceRecordSchema.parse(data);

    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
        updatedBy: userId
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
      }
    });

    // Update vehicle last maintenance date
    await prisma.vehicle.update({
      where: { id: validatedData.vehicleId },
      data: { lastMaintenanceDate: validatedData.serviceDate }
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'maintenance_record',
      resourceId: maintenanceRecord.id,
      details: {
        vehicleId: maintenanceRecord.vehicleId,
        type: maintenanceRecord.type,
        cost: maintenanceRecord.cost
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance/maintenance');
    return { success: true, data: maintenanceRecord };
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create maintenance record' 
    };
  }
}

// Safety Event Management Actions
export async function createSafetyEvent(data: z.infer<typeof createSafetyEventSchema>) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:create');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = createSafetyEventSchema.parse(data);

    const safetyEvent = await prisma.safetyEvent.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
        updatedBy: userId
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
      }
    });

    // Create alert for high severity events
    if (validatedData.severity === 'high' || validatedData.severity === 'critical') {
      await prisma.complianceAlert.create({
        data: {
          organizationId: orgId,
          type: 'safety_event',
          severity: validatedData.severity === 'critical' ? 'high' : 'medium',
          title: `${validatedData.severity.toUpperCase()} Safety Event`,
          message: `${validatedData.type} reported - immediate attention required`,
          safetyEventId: safetyEvent.id,
          driverId: safetyEvent.driverId,
          vehicleId: safetyEvent.vehicleId,
          createdBy: userId
        }
      });
    }

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'safety_event',
      resourceId: safetyEvent.id,
      details: {
        type: safetyEvent.type,
        severity: safetyEvent.severity,
        driverId: safetyEvent.driverId,
        vehicleId: safetyEvent.vehicleId
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance/safety');
    return { success: true, data: safetyEvent };
  } catch (error) {
    console.error('Error creating safety event:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create safety event' 
    };
  }
}

// Bulk Operations
export async function bulkUpdateComplianceDocuments(
  data: z.infer<typeof bulkUpdateComplianceDocumentsSchema>
) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = await checkPermissions(userId, orgId, 'compliance:update');
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate input
    const validatedData = bulkUpdateComplianceDocumentsSchema.parse(data);

    const results = await Promise.allSettled(
      validatedData.documentIds.map(async (documentId) => {
        return prisma.complianceDocument.update({
          where: { 
            id: documentId,
            organizationId: orgId
          },
          data: {
            ...validatedData.updates,
            updatedBy: userId,
            updatedAt: new Date()
          }
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Create audit log
    await createAuditLog({
      action: 'BULK_UPDATE',
      resource: 'compliance_document',
      resourceId: 'bulk',
      details: {
        documentCount: validatedData.documentIds.length,
        successful,
        failed,
        updates: validatedData.updates
      },
      userId,
      organizationId: orgId
    });

    revalidatePath('/[orgId]/compliance');
    return { 
      success: true, 
      data: { successful, failed, total: validatedData.documentIds.length } 
    };
  } catch (error) {
    console.error('Error bulk updating compliance documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to bulk update compliance documents' 
    };
  }
}

// Alert Management
export async function markAlertAsRead(alertId: string) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    await prisma.complianceAlert.update({
      where: { 
        id: alertId,
        organizationId: orgId
      },
      data: {
        status: 'read',
        readBy: userId,
        readAt: new Date()
      }
    });

    revalidatePath('/[orgId]/compliance');
    return { success: true };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark alert as read' 
    };
  }
}

export async function dismissAlert(alertId: string) {
  try {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    await prisma.complianceAlert.update({
      where: { 
        id: alertId,
        organizationId: orgId
      },
      data: {
        status: 'dismissed',
        dismissedBy: userId,
        dismissedAt: new Date()
      }
    });

    revalidatePath('/[orgId]/compliance');
    return { success: true };
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to dismiss alert' 
    };
  }
}

// Helper Functions
async function checkHOSViolations(driverId: string, orgId: string, userId: string) {
  // Get driver's HOS logs for the past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const hosLogs = await prisma.hOSLog.findMany({
    where: {
      driverId,
      organizationId: orgId,
      startTime: {
        gte: sevenDaysAgo
      }
    },
    orderBy: { startTime: 'asc' }
  });

  // Check for various HOS violations
  const violations = [];

  // Check 11-hour driving limit
  const drivingHours = hosLogs
    .filter(log => log.dutyStatus === 'driving')
    .reduce((total, log) => total + log.duration, 0);

  if (drivingHours > 11 * 60) { // 11 hours in minutes
    violations.push({
      type: 'driving_limit_exceeded',
      severity: 'high' as const,
      message: `Driver exceeded 11-hour driving limit (${Math.round(drivingHours / 60 * 10) / 10} hours)`
    });
  }

  // Check 14-hour on-duty limit
  const onDutyHours = hosLogs
    .filter(log => ['driving', 'on_duty_not_driving'].includes(log.dutyStatus))
    .reduce((total, log) => total + log.duration, 0);

  if (onDutyHours > 14 * 60) { // 14 hours in minutes
    violations.push({
      type: 'on_duty_limit_exceeded',
      severity: 'high' as const,
      message: `Driver exceeded 14-hour on-duty limit (${Math.round(onDutyHours / 60 * 10) / 10} hours)`
    });
  }

  // Create alerts for violations
  for (const violation of violations) {
    await prisma.complianceAlert.create({
      data: {
        organizationId: orgId,
        type: 'hos_violation',
        severity: violation.severity,
        title: 'HOS Violation Detected',
        message: violation.message,
        driverId,
        createdBy: userId
      }
    });
  }
}
