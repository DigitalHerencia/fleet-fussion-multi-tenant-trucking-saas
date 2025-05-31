"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import {
  createLoadSchema,
  updateLoadSchema,
  loadAssignmentSchema,
  loadStatusUpdateSchema,
  bulkLoadOperationSchema,
  type CreateLoadInput,
  type UpdateLoadInput,
  type LoadAssignmentInput,
  type LoadStatusUpdateInput,
  type BulkLoadOperationInput,
} from "@/schemas/dispatch";
import type { Load, LoadStatus, LoadStatusEvent, TrackingUpdate, LoadAlert } from "@/types/dispatch";

// Helper function to check user permissions
async function checkUserPermissions(orgId: string, requiredPermissions: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }



// Helper function to create audit log entry
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  changes: Record<string, any>,
  userId: string,
  orgId: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      changes,
      userId,
      organizationId: orgId,
      timestamp: new Date(),
    },
  });
}

// Helper function to generate reference number
function generateReferenceNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FL${timestamp.slice(-6)}${random}`;
}
}
// Create load action
export async function createLoadAction(orgId: string, data: CreateLoadInput) {
  try {
    const user = await checkUserPermissions(orgId, ["loads:create", "dispatch:manage"]);
    
    const validatedData = createLoadSchema.parse(data);
    
  
    // Check if reference number is unique within tenant
    const existingLoad = await prisma.load.findFirst({
      where: {
        organizationId: orgId,
        referenceNumber: validatedData.referenceNumber,
      },
    });

    if (existingLoad) {
      return {
        success: false,
        error: "Reference number already exists",
      };
    }

    // Create the load
  

    // Create initial status event
  

    revalidatePath(`/dashboard/${orgId}/dispatch`);
    
    
  } catch (error) {
    console.error("Error creating load:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create load",
    };
  }
}

// Update load action


    // Get load to verify tenant and permissions


  

    
  
  

    // Create audit log
  


// Delete load action


// Update load status action

