import { db } from "@/lib/database";

interface CreateAuditLogParams {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const createAuditLog = async (params: CreateAuditLogParams) => {
  try {
    await db.auditLog.create({
      data: {
        organizationId: params.tenantId,
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw the error to avoid disrupting the main operation
  }
};