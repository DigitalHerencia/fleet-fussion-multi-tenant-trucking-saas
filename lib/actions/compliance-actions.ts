"use server";

import { db } from "@/db/db";
import { complianceDocuments, hosLogs, complianceRecords } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { complianceSchema } from "@/lib/validation/compliance-schema";
import { uploadToVercelBlob } from "@/db/blob";
import { getCurrentCompanyId } from "@/lib/auth";
import type { ApiResult } from "@/types/api";
import logger from "@/lib/utils/logger";

// Zod schema for server-side validation
const hosLogSchema = z.object({
  driverId: z.string().uuid(),
  date: z.string().min(1),
  status: z.string().min(1),
  hoursLogged: z.coerce.number().min(0).max(24),
  notes: z.string().optional(),
});

type HosLogForm = z.infer<typeof hosLogSchema>;

const complianceDocSchema = z.object({
  documentType: z.string().min(1),
  expiryDate: z.string().optional(),
  status: z.string().min(1),
  documentUrl: z.string().optional(),
});

type ComplianceDocForm = z.infer<typeof complianceDocSchema>;

// Replace with your session-based lookup
async function getCompanyId(): Promise<string> {
  return getCurrentCompanyId();
}

export async function createHosLog(formData: FormData) {
  logger.debug("createHosLog called");
  try {
    const result = hosLogSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    const data = result.data as HosLogForm;
    const companyId = await getCompanyId();
    const [inserted] = await db
      .insert(hosLogs)
      .values({
        ...data,
        companyId,
        date: new Date(data.date),
        logType: data.status, // Map status to logType
        startTime: new Date(), // Required field, set default
      })
      .returning();
    logger.info("createHosLog success");
    return { success: true, log: inserted };
  } catch (error) {
    logger.error("createHosLog error", error);
    console.error("[ComplianceActions] createHosLog error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create HOS log",
      errors: { form: ["Failed to create HOS log"] },
    };
  }
}

export async function updateHosLog(id: string, formData: FormData) {
  logger.debug("updateHosLog called", { id });
  try {
    const result = hosLogSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    const data = result.data as HosLogForm;
    const companyId = await getCompanyId();
    await db
      .update(hosLogs)
      .set({
        date: new Date(data.date),
        logType: data.status,
        notes: data.notes,
        driverId: data.driverId,
      })
      .where(and(eq(hosLogs.id, id), eq(hosLogs.companyId, companyId)));
    logger.info("updateHosLog success", { id });
    return { success: true };
  } catch (error) {
    logger.error("updateHosLog error", error);
    console.error("[ComplianceActions] updateHosLog error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update HOS log",
      errors: { form: ["Failed to update HOS log"] },
    };
  }
}

export async function deleteHosLog(id: string) {
  logger.debug("deleteHosLog called", { id });
  try {
    const companyId = await getCompanyId();
    const result = await db
      .delete(hosLogs)
      .where(and(eq(hosLogs.id, id), eq(hosLogs.companyId, companyId)));
    if (!result) throw new Error();
    logger.info("deleteHosLog success", { id });
    return { success: true };
  } catch (error) {
    logger.error("deleteHosLog error", error);
    console.error("[ComplianceActions] deleteHosLog error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete HOS log",
      errors: { form: ["Failed to delete HOS log"] },
    };
  }
}

/**
 * Uploads a new compliance document for the current company.
 * Handles file upload, validation, and database insertion.
 * @param {FormData} formData - The form data containing document fields and file.
 * @returns {Promise<{success: boolean, document?: any, error?: string, errors?: any}>}
 */
export async function createComplianceDocument(
  formData: FormData,
): Promise<ApiResult<unknown>> {
  logger.debug("createComplianceDocument called");
  try {
    let fileUrl = formData.get("documentUrl")?.toString() || "";
    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      // Upload file to Vercel Blob
      fileUrl = await uploadToVercelBlob(file);
    }
    const result = complianceDocSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    const data = result.data as ComplianceDocForm;
    const companyId = await getCompanyId();
    const [inserted] = await db
      .insert(complianceDocuments)
      .values({
        type: data.documentType, // maps to 'type' column
        expirationDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.status,
        fileUrl: fileUrl || data.documentUrl || "", // fileUrl is required
        name: data.documentType, // fallback for name, adjust if needed
        companyId,
      })
      .returning(); 
    logger.info("createComplianceDocument success");
    return { success: true, data: inserted };
  } catch (error) {
    logger.error("createComplianceDocument error", error);
    console.error("[ComplianceActions] createComplianceDocument error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create compliance document",
      errors: { form: ["Failed to create compliance document"] },
    };
  }
}

export async function updateComplianceDocument(
  id: string,
  formData: FormData,
): Promise<ApiResult<undefined>> {
  logger.debug("updateComplianceDocument called", { id });
  try {
    const result = complianceDocSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    const data = result.data as ComplianceDocForm;
    const companyId = await getCompanyId();
    await db
      .update(complianceDocuments)
      .set({
        type: data.documentType,
        expirationDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        status: data.status,
        fileUrl: data.documentUrl || undefined,
      })
      .where(
        and(
          eq(complianceDocuments.id, id),
          eq(complianceDocuments.companyId, companyId),
        ),
      );
    logger.info("updateComplianceDocument success", { id });
    return { success: true, data: undefined };
  } catch (error) {
    logger.error("updateComplianceDocument error", error);
    console.error("[ComplianceActions] updateComplianceDocument error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update compliance document",
      errors: { form: ["Failed to update compliance document"] },
    };
  }
}

export async function deleteComplianceDocument(
  id: string,
): Promise<ApiResult<undefined>> {
  logger.debug("deleteComplianceDocument called", { id });
  try {
    const companyId = await getCompanyId();
    const result = await db
      .delete(complianceDocuments)
      .where(
        and(
          eq(complianceDocuments.id, id),
          eq(complianceDocuments.companyId, companyId),
        ),
      );
    if (!result) throw new Error();
    logger.info("deleteComplianceDocument success", { id });
    return { success: true, data: undefined };
  } catch (error) {
    logger.error("deleteComplianceDocument error", error);
    console.error("[ComplianceActions] deleteComplianceDocument error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete compliance document",
      errors: { form: ["Failed to delete compliance document"] },
    };
  }
}

export async function createComplianceAction(
  formData: FormData,
): Promise<ApiResult<undefined>> {
  logger.debug("createComplianceAction called");
  try {
    const result = complianceSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    const data = result.data;
    const companyId = await getCompanyId();
    await db.insert(complianceRecords).values({
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      companyId,
    });
    logger.info("createComplianceAction success");
    return { success: true, data: undefined };
  } catch (error) {
    logger.error("createComplianceAction error", error);
    console.error("[ComplianceActions] createComplianceAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create compliance record",
      errors: { form: ["Failed to create compliance record"] },
    };
  }
}
