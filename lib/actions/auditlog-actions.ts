"use server";

import { db } from "@/db/db";
import { auditLogs } from "@/db/schema";
import {
  auditLogSchema,
  type AuditLogFormValues,
} from "@/lib/validation/auditlog-schema";
import { getCurrentCompanyId } from "@/lib/auth";
import logger from "@/lib/utils/logger";

export async function createAuditLog(data: AuditLogFormValues) {
  logger.debug("createAuditLog called", { data });
  const companyId = await getCurrentCompanyId();
  const parsed = auditLogSchema.safeParse(data);
  if (!parsed.success) {
    logger.warn("createAuditLog validation failed", { errors: parsed.error.flatten().fieldErrors });
    return {
      success: false,
      error: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const [log] = await db
      .insert(auditLogs)
      .values({ ...parsed.data, companyId })
      .returning();
    logger.info("createAuditLog success", { log });
    return { success: true, log };
  } catch (error) {
    logger.error("createAuditLog error", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create audit log",
      errors: { form: ["Failed to create audit log"] },
    };
  }
}

export async function getAuditLogs() {
  logger.debug("getAuditLogs called");
  const companyId = await getCurrentCompanyId();
  try {
    const result = await db.query.auditLogs.findMany({
      where: (l, { eq }) => eq(l.companyId, companyId),
    });
    logger.info("getAuditLogs success", { companyId });
    return result;
  } catch (error) {
    logger.error("getAuditLogs error", error);
    throw error;
  }
}
