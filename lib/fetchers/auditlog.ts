import { db } from "@/db/db";
import { cache } from "react";
import logger from "@/lib/utils/logger";

export const getAuditLogs = cache(async function getAuditLogs(
  companyId: string,
) {
  logger.debug("getAuditLogs called", { companyId });
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
});
