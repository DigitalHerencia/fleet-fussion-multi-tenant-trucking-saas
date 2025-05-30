'use server';

import { auth } from "@/lib/auth";
import { safeParse } from "@/lib/utils";
import {
  createComplianceDocumentSchema,
  CreateComplianceDocumentInput
} from "@/validations/compliance";
import { ComplianceOverview } from "@/types/compliance";
import {
  createHosLogSchema,
  createDvirSchema,
  createMaintenanceSchema,
  updateComplianceDocumentSchema,
  updateHosLogSchema,
  updateDvirSchema,
  updateMaintenanceSchema,
} from "@/validations/compliance";
// import { checkPermissions } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/actions/auditActions";
import { revalidatePath } from "next/cache";
import {
  ComplianceDocumentCreateInput,
  ComplianceDocumentUpdateInput,
  ComplianceDocumentWhereInput,
  SafetyEventPriority,
  VehicleUpdateInput,
} from "@/types/prisma";
import { prisma } from "@/lib/db";

export async function getComplianceOverview(): Promise<ComplianceOverview> {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  // TODO: Implement actual logic
  return {} as ComplianceOverview;
}

export async function createComplianceDocument(
  data: CreateComplianceDocumentInput
) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const parsedData = safeParse(createComplianceDocumentSchema, data);

  if (!parsedData.success) {
    return {
      error: "Invalid input",
    };
  }

  const {
    name,
    type,
    expirationDate,
    documentNumber,
    notes,
    driverId,
    vehicleId,
    allowDuplicates,
    ...rest
  } = parsedData.data;

  try {
    await prisma.complianceDocument.create({
      data: {
        name,
        type,
        expirationDate,
        documentNumber,
        notes,
        organizationId: orgId,
        driverId: driverId,
        vehicleId: vehicleId,
        ...rest,
        // expiresAt: expirationDate, // Assuming expirationDate is the correct field
        createdBy: userId,
      },
    });

    await createAuditLog({
      action: "CREATE",
      entityId: name,
      entityType: "COMPLIANCE_DOCUMENT",
      userId: userId,
      tenantId: ""
    });
  } catch (e: any) {
    console.log(e);
    return {
      error: "Failed to create compliance document",
    };
  }

  revalidatePath("/dashboard/compliance");
}

export async function updateComplianceDocument(
  id: string,
  values: Partial<CreateComplianceDocumentInput>
) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const existingDocument = await prisma.complianceDocument.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingDocument) {
      return { error: "Compliance document not found" };
    }

    const updatedDocument = await prisma.complianceDocument.update({
      where: {
        id: id,
      },
      data: {
        ...values,
        updatedBy: userId,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entityId: updatedDocument.id,
      entityType: "COMPLIANCE_DOCUMENT",
      userId: userId,
      tenantId: ""
    });

    revalidatePath("/dashboard/compliance");
    return { success: "Compliance document updated successfully" };
  } catch (error: any) {
    console.error("Error updating compliance document:", error);
    return { error: "Failed to update compliance document" };
  }
}

export async function deleteComplianceDocument(id: string) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const complianceDocument = await prisma.complianceDocument.findUnique({
      where: {
        id: id,
      },
    });

    if (!complianceDocument) {
      return { error: "Compliance document not found" };
    }

    await prisma.complianceDocument.delete({
      where: {
        id: id,
      },
    });

    await createAuditLog({
      action: "DELETE",
      entityId: complianceDocument.id,
      entityType: "COMPLIANCE_DOCUMENT",
      userId: userId,
      tenantId: ""
    });

    revalidatePath("/dashboard/compliance");
    return { success: "Compliance document deleted successfully" };
  } catch (error: any) {
    console.error("Error deleting compliance document:", error);
    return { error: "Failed to delete compliance document" };
  }
}

export async function createHOSLog(data: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.hOSLog.create({
      data: {
        ...data,
        organizationId: orgId,
        driverId: userId,
      },
    });
  } catch (e: any) {
    console.log(e);
    return {
      error: "Failed to create HOS Log",
    };
  }

  revalidatePath("/dashboard/compliance");
}

export async function updateHOSLog(id: string, values: any) {
  try {
    await prisma.hOSLog.update({
      where: {
        id: id,
      },
      data: {
        ...values,
      },
    });

    revalidatePath("/dashboard/compliance");
    return { success: "HOS Log updated successfully" };
  } catch (error: any) {
    console.error("Error updating HOS Log:", error);
    return { error: "Failed to update HOS Log" };
  }
}

export async function createDVIRReport(data: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.dVIRReport.create({
      data: {
        ...data,
        organizationId: orgId,
        driverId: userId,
      },
    });

    // Create compliance alerts based on inspection results
    if (data.inspectionResult) {
      data.inspectionResult.forEach(async (d: any) => {
        if (d.priority === "high") {
          await prisma.complianceAlert.create({
            data: {
              organizationId: orgId,
              entityId: d.id,
              entityType: "DVIR",
              priority: "critical",
              description: `High priority DVIR inspection result: ${d.description}`,
              resolved: false,
            },
          });
        }
      });
    }
  } catch (e: any) {
    console.log(e);
    return {
      error: "Failed to create DVIR Report",
    };
  }

  revalidatePath("/dashboard/compliance");
}

export async function updateDVIRReport(id: string, values: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const maintenanceRecord = await prisma.dVIRReport.update({
      where: {
        id: id,
      },
      data: {
        ...values,
      },
    });

    revalidatePath("/dashboard/compliance");
    return { success: "DVIR Report updated successfully" };
  } catch (error: any) {
    console.error("Error updating DVIR Report:", error);
    return { error: "Failed to update DVIR Report" };
  }
}

export async function createMaintenanceRecord(data: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.maintenanceRecord.create({
      data: {
        ...data,
        organizationId: orgId,
        vehicleId: data.vehicleId,
      },
    });

    // Update vehicle lastMaintenanceDate
    await prisma.vehicle.update({
      where: {
        id: data.vehicleId,
      },
      data: {
        lastMaintenanceDate: new Date(),
      },
    });
  } catch (e: any) {
    console.log(e);
    return {
      error: "Failed to create Maintenance Record",
    };
  }

  revalidatePath("/dashboard/compliance");
}

export async function updateMaintenanceRecord(id: string, values: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const safetyEvent = await prisma.maintenanceRecord.update({
      where: {
        id: id,
      },
      data: {
        ...values,
      },
    });

    // Create compliance alerts based on inspection results
    if (values.priority) {
      if (
        values.priority === "minor" ||
        values.priority === "major" ||
        values.priority === "critical" ||
        values.priority === "serious"
      ) {
        await prisma.complianceAlert.create({
          data: {
            organizationId: orgId,
            entityId: id,
            entityType: "MAINTENANCE",
            priority: values.priority,
            description: `Maintenance record priority: ${values.priority}`,
            resolved: false,
          },
        });
      }
    }

    revalidatePath("/dashboard/compliance");
    return { success: "Maintenance Record updated successfully" };
  } catch (error: any) {
    console.error("Error updating Maintenance Record:", error);
    return { error: "Failed to update Maintenance Record" };
  }
}

export async function getComplianceDocument(documentId: any) {
  try {
    const complianceDocument = await prisma.complianceDocument.findUnique({
      where: {
        id: documentId,
      },
    });

    return complianceDocument;
  } catch (error) {
    console.error("Error fetching compliance document:", error);
    return null;
  }
}

export const getExpiringDocuments = async () => {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const expiringDocuments = await prisma.complianceDocument.findMany({
    where: {
      organizationId: orgId,
      expirationDate: {
        lte: new Date(today.setDate(today.getDate() + 30)),
        gte: new Date(),
      },
    },
  });

  const expiringSoon = expiringDocuments.map((r: any) => ({
    ...r,
    daysRemaining: Math.ceil(
      (r.expirationDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    ),
  }));

  return expiringSoon;
};

export async function resolveComplianceAlert(id: string) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.complianceAlert.update({
      where: {
        id: id,
      },
      data: {
        resolved: true,
      },
    });

    revalidatePath("/dashboard/compliance");
    return { success: "Compliance Alert resolved successfully" };
  } catch (error: any) {
    console.error("Error resolving compliance alert:", error);
    return { error: "Failed to resolve compliance alert" };
  }
}

export async function getHOSLogs(driverId: string) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const hosLogs = await prisma.hOSLog.findMany({
      where: {
        driverId: driverId,
      },
    });

    return hosLogs;
  } catch (error: any) {
    console.error("Error fetching HOS Logs:", error);
    return { error: "Failed to fetch HOS Logs" };
  }
}

export const calculateAvailableHours = async (log: any, total: any) => {
  let availableHours = total;
  log.forEach((log: any) => {
    availableHours -= log.hoursWorked;
  });
  return availableHours;
};

export const calculateAvailableHoursUpdate = async (log: any, total: any) => {
  let availableHours = total;
  log.forEach((log: any) => {
    availableHours -= log.hoursWorked;
  });
  return availableHours;
};

export async function createComplianceAlert(data: any) {
  const authData = await auth();
  const userId = authData?.user?.id;
  const orgId = authData?.organizationId;

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.complianceAlert.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  } catch (e: any) {
    console.log(e);
    return {
      error: "Failed to create Compliance Alert",
    };
  }

  revalidatePath("/dashboard/compliance");
}
