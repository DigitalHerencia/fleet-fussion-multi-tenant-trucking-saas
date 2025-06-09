'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import prisma from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
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
} from '@/schemas/dispatch';
import type {
  Load,
  LoadStatus,
  LoadStatusEvent,
  TrackingUpdate,
  LoadAlert,
} from '@/types/dispatch';
import { 
  validateLoad,
  validateStatusTransition,
  validateLoadAssignment,
  type BusinessRuleResult,
} from '@/lib/business-rules/dispatch-rules';
import { 
  withErrorRecovery,
  DispatchErrorHandler,
  DispatchErrorCode,
  createDispatchError,
  validateAndShowErrors,
} from '@/lib/error-handling/dispatch-errors';

// Helper function to check user permissions
async function checkUserPermissions(
  orgId: string,
  requiredPermissions: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  // Check if user belongs to the organization and has required permissions
  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      organizationId: orgId,
    },
  });
  if (!user) {
    throw new Error('User not found or not member of organization');
  }
  let userPermissions: string[] = [];
  if (Array.isArray(user.permissions)) {
    userPermissions = user.permissions
      .map((p: any) =>
        typeof p === 'object' && p !== null && 'name' in p ? p.name : null
      )
      .filter((name: any) => typeof name === 'string');
  }
  const hasPermission = requiredPermissions.some(
    permission =>
      userPermissions.includes(permission) || userPermissions.includes('*')
  );
  if (!hasPermission) {
    throw new Error(
      `Insufficient permissions. Required: ${requiredPermissions.join(' or ')}`
    );
  }
  return user;
}

// Helper function to create audit log entry
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  changes: Record<string, unknown>,
  userId: string,
  organizationId: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      changes: changes as any,
      userId,
      organizationId,
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
// Create load action
export async function createLoadAction(orgId: string, data: CreateLoadInput) {
  return withErrorRecovery(async () => {
    const user = await checkUserPermissions(orgId, [
      'loads:create',
      'dispatch:manage',
    ]);
    const validatedData = createLoadSchema.parse(data);
    
    // Business rule validation - create proper load data structure
    const loadForValidation = {
      status: 'pending' as LoadStatus,
      driverId: validatedData.driver?.id || null,
      vehicleId: validatedData.vehicle?.id || null,
      organizationId: orgId,
    };
    
    const validationResult = await validateLoad(loadForValidation);
    if (!validationResult.isValid) {
      throw createDispatchError(
        DispatchErrorCode.INVALID_STATUS_TRANSITION,
        { errors: validationResult.errors },
        validationResult.errors.join('; ')
      );
    }
    
    let referenceNumber = validatedData.referenceNumber;
    if (!referenceNumber) {
      referenceNumber = generateReferenceNumber();
    }
    if (typeof referenceNumber !== 'string') {
      referenceNumber = String(referenceNumber ?? '');
    }
    const existingLoad = await prisma.load.findFirst({
      where: {
        organizationId: orgId,
        referenceNumber,
      },
    });
    if (existingLoad) {
      throw createDispatchError(
        DispatchErrorCode.DUPLICATE_REFERENCE,
        { referenceNumber },
        'Reference number already exists'
      );
    }

    const {
      rate,
      customer,
      origin,
      destination,
      driver,
      vehicle,
      trailer,
      tags,
      createdBy,
      lastModifiedBy,
      priority,
      statusEvents,
      ...rest
    } = validatedData;
    
    const dbData: any = {
      ...rest,
      referenceNumber,
      rate,
      organizationId: orgId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: priority || 'medium',
      tags: tags || [],
      createdBy: createdBy || user.id,
      lastModifiedBy: lastModifiedBy || user.id,
    };
    if (customer && typeof customer === 'object') {
      dbData.customerName = customer.name ?? null;
      dbData.customerContact = customer.contactName ?? null;
      dbData.customerPhone = customer.phone ?? null;
      dbData.customerEmail = customer.email ?? null;
    }
    if (origin && typeof origin === 'object') {
      dbData.originAddress = origin.address ?? null;
      dbData.originCity = origin.city ?? null;
      dbData.originState = origin.state ?? null;
      dbData.originZip = origin.zip ?? null;
      dbData.originLat = origin.latitude ?? null;
      dbData.originLng = origin.longitude ?? null;
    }
    if (destination && typeof destination === 'object') {
      dbData.destinationAddress = destination.address ?? null;
      dbData.destinationCity = destination.city ?? null;
      dbData.destinationState = destination.state ?? null;
      dbData.destinationZip = destination.zip ?? null;
      dbData.destinationLat = destination.latitude ?? null;
      dbData.destinationLng = destination.longitude ?? null;
    }
    if (driver && typeof driver === 'object' && driver.id)
      dbData.driverId = driver.id;
    if (vehicle && typeof vehicle === 'object' && vehicle.id)
      dbData.vehicleId = vehicle.id;
    if (trailer && typeof trailer === 'object' && trailer.id)
      dbData.trailerId = trailer.id;
    
    const createdLoad = await prisma.load.create({ data: dbData });
    
    // Create status events if provided
    if (Array.isArray(statusEvents) && statusEvents.length > 0) {
      for (const event of statusEvents) {
        await prisma.loadStatusEvent.create({
          data: {
            ...event,
            loadId: createdLoad.id,
          },
        });
      }
    }
    
    await createAuditLog(
      'CREATE',
      'Load',
      createdLoad.id,
      dbData,
      user.id,
      orgId
    );
    
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    return {
      success: true,
      data: createdLoad,
    };
  }, 'Create Load');
}

// Update load action
export async function updateLoadAction(loadId: string, data: UpdateLoadInput) {
  return withErrorRecovery(async () => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    const existingLoad = await prisma.load.findUnique({
      where: { id: loadId },
      select: { organizationId: true, status: true },
    });
    if (!existingLoad) {
      throw createDispatchError(
        DispatchErrorCode.LOAD_NOT_FOUND,
        { loadId },
        'Load not found'
      );
    }
    const user = await checkUserPermissions(existingLoad.organizationId, [
      'loads:update',
      'dispatch:manage',
    ]);
    const validatedData = updateLoadSchema.parse(data);
    
    // Business rule validation for update
    const loadForValidation = {
      status: existingLoad.status as LoadStatus,
      driverId: validatedData.driver?.id || null,
      vehicleId: validatedData.vehicle?.id || null,
      organizationId: existingLoad.organizationId,
    };
    
    const validationResult = await validateLoad(loadForValidation);
    if (!validationResult.isValid) {
      throw createDispatchError(
        DispatchErrorCode.INVALID_STATUS_TRANSITION,
        { errors: validationResult.errors, loadId },
        validationResult.errors.join('; ')
      );
    }
    
    const {
      id,
      rate,
      customer,
      origin,
      destination,
      driver,
      vehicle,
      trailer,
      tags,
      lastModifiedBy,
      priority,
      statusEvents,
      ...updateData
    } = validatedData;
    const dbData: any = {
      ...updateData,
      updatedAt: new Date(),
      priority: priority || undefined,
      tags: tags || undefined,
      lastModifiedBy: lastModifiedBy || user.id,
    };
    if (typeof rate !== 'undefined') dbData.rate = rate;
    if (customer && typeof customer === 'object') {
      dbData.customerName = customer.name ?? null;
      dbData.customerContact = customer.contactName ?? null;
      dbData.customerPhone = customer.phone ?? null;
      dbData.customerEmail = customer.email ?? null;
    }
    if (origin && typeof origin === 'object') {
      dbData.originAddress = origin.address ?? null;
      dbData.originCity = origin.city ?? null;
      dbData.originState = origin.state ?? null;
      dbData.originZip = origin.zip ?? null;
      dbData.originLat = origin.latitude ?? null;
      dbData.originLng = origin.longitude ?? null;
    }
    if (destination && typeof destination === 'object') {
      dbData.destinationAddress = destination.address ?? null;
      dbData.destinationCity = destination.city ?? null;
      dbData.destinationState = destination.state ?? null;
      dbData.destinationZip = destination.zip ?? null;
      dbData.destinationLat = destination.latitude ?? null;      dbData.destinationLng = destination.longitude ?? null;
    }
    if (driver && typeof driver === 'object' && driver.id) {
      dbData.driverId = driver.id;
    }
    if (vehicle && typeof vehicle === 'object' && vehicle.id) {
      dbData.vehicleId = vehicle.id;
    }
    if (trailer && typeof trailer === 'object' && trailer.id) {
      dbData.trailerId = trailer.id;
    }
    const updatedLoad = await prisma.load.update({
      where: { id: loadId },
      data: dbData,
    });
    // Update status events if provided
    if (Array.isArray(statusEvents) && statusEvents.length > 0) {
      for (const event of statusEvents) {
        await prisma.loadStatusEvent.create({
          data: {
            ...event,
            loadId: loadId,
          },
        });
      }
    }
    await createAuditLog(
      'UPDATE',
      'Load',
      loadId,
      updateData,
      user.id,
      existingLoad.organizationId
    );
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    revalidatePath(
      `/dashboard/${existingLoad.organizationId}/dispatch/${loadId}`
    );
    return {
      success: true,
      data: updatedLoad,
    };
  }, 'Update Load');
}

// Delete load action
export async function deleteLoadAction(loadId: string) {
  return withErrorRecovery(async () => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }
    const existingLoad = await prisma.load.findUnique({
      where: { id: loadId },
      select: { organizationId: true, status: true, referenceNumber: true },
    });
    if (!existingLoad) {
      throw createDispatchError(
        DispatchErrorCode.LOAD_NOT_FOUND,
        { loadId },
        'Load not found'
      );
    }
    const user = await checkUserPermissions(existingLoad.organizationId, [
      'loads:delete',
      'dispatch:manage',
    ]);
    
    // Business rule validation - only allow deletion of pending or cancelled loads
    if (
      existingLoad.status !== 'pending' &&
      existingLoad.status !== 'cancelled'
    ) {
      throw createDispatchError(
        DispatchErrorCode.INVALID_STATUS_TRANSITION,
        { currentStatus: existingLoad.status, loadId },
        'Cannot delete load in current status'
      );
    }
    
    await prisma.load.delete({ where: { id: loadId } });
    await createAuditLog(
      'DELETE',
      'Load',
      loadId,
      { referenceNumber: existingLoad.referenceNumber },
      user.id,
      existingLoad.organizationId
    );
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    return {
      success: true,
    };
  }, 'Delete Load');
}

// Update load status action

/**
 * Assign a driver to a load.
 * @param input - LoadAssignmentInput (expects loadId and driverId)
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function assignDriverAction(input: LoadAssignmentInput) {
  return withErrorRecovery(async () => {
    // Validate input
    const validated = loadAssignmentSchema.safeParse(input);
    if (!validated.success) {
      throw createDispatchError(
        DispatchErrorCode.INVALID_STATUS_TRANSITION,
        { validationErrors: validated.error.errors },
        validated.error.message
      );
    }
    const { loadId, driverId } = validated.data;

    // Fetch load and check permissions
    const load = await prisma.load.findUnique({
      where: { id: loadId },
      select: { organizationId: true, status: true },
    });
    if (!load) {
      throw createDispatchError(
        DispatchErrorCode.LOAD_NOT_FOUND,
        { loadId },
        'Load not found'
      );
    }
    
    const user = await checkUserPermissions(load.organizationId, [
      'dispatch:manage',
      'loads:update',
    ]);

    // Business rule validation for assignment
    const assignmentValidation = await validateLoadAssignment(loadId, driverId, undefined, load.organizationId);
    if (!assignmentValidation.isValid) {
      throw createDispatchError(
        DispatchErrorCode.ASSIGNMENT_CONFLICT,
        { errors: assignmentValidation.errors, loadId, driverId },
        assignmentValidation.errors.join('; ')
      );
    }

    // Update load with driver assignment
    await prisma.load.update({
      where: { id: loadId },
      data: {
        driverId,
        updatedAt: new Date(),
        lastModifiedBy: user.id,
      },
    });

    // Create status event for assignment
    await prisma.loadStatusEvent.create({
      data: {
        loadId,
        status: 'assigned',
        timestamp: new Date(),
        notes: `Driver assigned`,
        automaticUpdate: false,
        source: 'dispatcher',
      },
    });

    // Audit log
    await createAuditLog(
      'ASSIGN_DRIVER',
      'Load',
      loadId,
      { driverId },
      user.id,
      load.organizationId
    );

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${load.organizationId}/dispatch`);
    revalidatePath(`/dashboard/${load.organizationId}/dispatch/${loadId}`);

    return { success: true };
  }, 'Assign Driver');
}

/**
 * Update load status with business rule validation
 */
export async function updateLoadStatusAction(data: LoadStatusUpdateInput) {
  return withErrorRecovery(async () => {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = loadStatusUpdateSchema.parse(data);

    // Get load to verify tenant and permissions
    const existingLoad = await prisma.load.findUnique({
      where: { id: validatedData.loadId },
      select: { 
        organizationId: true, 
        status: true, 
        driverId: true, 
        vehicleId: true, 
        trailerId: true,
        referenceNumber: true
      },
    });

    if (!existingLoad) {
      throw createDispatchError(
        DispatchErrorCode.LOAD_NOT_FOUND,
        { loadId: validatedData.loadId },
        'Load not found'
      );
    }

    const user = await checkUserPermissions(existingLoad.organizationId, [
      'loads:update', 
      'dispatch:manage'
    ]);    // Business rule validation for status transition
    const validationResult = await validateStatusTransition(
      existingLoad.status as LoadStatus,
      validatedData.status
    );
    
    if (!validationResult.isValid) {
      throw createDispatchError(
        DispatchErrorCode.INVALID_STATUS_TRANSITION,
        { 
          currentStatus: existingLoad.status,
          newStatus: validatedData.status,
          errors: validationResult.errors,
          loadId: validatedData.loadId
        },
        validationResult.errors.join('; ')
      );
    }

    const timestamp = new Date();

    // Update load status and related data
    const updatedLoad = await prisma.$transaction(async (tx) => {
      // Update load
      const updateData: any = {
        status: validatedData.status,
        updatedAt: timestamp,
      };

      // Set actual times based on status
      if (validatedData.status === 'picked_up') {
        updateData.actualPickupTime = timestamp;
      } else if (validatedData.status === 'delivered') {
        updateData.actualDeliveryTime = timestamp;
      }

      const load = await tx.load.update({
        where: { id: validatedData.loadId },
        data: updateData,
      });

      // Create status event
      await tx.loadStatusEvent.create({
        data: {
          loadId: validatedData.loadId,
          status: validatedData.status,
          timestamp,
          location: validatedData.location,
          notes: validatedData.notes,
          automaticUpdate: validatedData.automaticUpdate || false,
          source: validatedData.source || 'dispatcher',
          createdBy: user.id,
        },
      });

      // Update resource status if needed
      if (existingLoad.driverId) {
        let driverStatus = 'available';
        if (['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route', 'at_delivery'].includes(validatedData.status)) {
          driverStatus = 'busy';
        } else if (['delivered', 'completed', 'cancelled'].includes(validatedData.status)) {
          driverStatus = 'available';
        }

        await tx.driver.update({
          where: { id: existingLoad.driverId },
          data: {
            status: driverStatus as any,
          },
        });
      }

      // Update vehicle status if needed
      if (existingLoad.vehicleId) {
        let vehicleStatus = 'available';
        if (['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route', 'at_delivery'].includes(validatedData.status)) {
          vehicleStatus = 'in_use';
        } else if (['delivered', 'completed', 'cancelled'].includes(validatedData.status)) {
          vehicleStatus = 'available';
        }

        await tx.vehicle.update({
          where: { id: existingLoad.vehicleId },
          data: {
            status: vehicleStatus as any,
          },
        });
      }

      // Update trailer status if needed
      if (existingLoad.trailerId) {
        let trailerStatus = 'available';
        if (['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route', 'at_delivery'].includes(validatedData.status)) {
          trailerStatus = 'in_use';
        } else if (['delivered', 'completed', 'cancelled'].includes(validatedData.status)) {
          trailerStatus = 'available';
        }        await tx.vehicle.update({
          where: { id: existingLoad.trailerId },
          data: {
            status: trailerStatus as any,
          },
        });
      }

      return load;
    });

    // Create audit log
    await createAuditLog(
      'STATUS_UPDATE',
      'Load',
      validatedData.loadId,
      validatedData,
      user.id,
      existingLoad.organizationId
    );

    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch/${validatedData.loadId}`);

    return {
      success: true,
      data: updatedLoad,
    };
  }, 'Update Load Status');
}

/**
 * Bulk operations for loads with business rule validation
 */
export async function bulkLoadOperationAction(orgId: string, data: BulkLoadOperationInput) {
  return withErrorRecovery(async () => {
    const user = await checkUserPermissions(orgId, ['loads:bulk_edit', 'dispatch:manage']);

    const validatedData = bulkLoadOperationSchema.parse(data);

    // Verify all loads belong to the tenant
    const loads = await prisma.load.findMany({
      where: {
        id: { in: validatedData.loadIds },
        organizationId: orgId,
      },
      select: { id: true, status: true, referenceNumber: true },
    });

    if (loads.length !== validatedData.loadIds.length) {
      throw createDispatchError(
        DispatchErrorCode.LOAD_NOT_FOUND,
        { requestedIds: validatedData.loadIds, foundIds: loads.map(l => l.id) },
        'Some loads not found or access denied'
      );
    }

    let results: Array<{ id: string; success: boolean; error?: string }> = [];

    switch (validatedData.operation) {
      case 'delete':
        // Business rule validation - only delete pending/cancelled loads
        const deletableLoads = loads.filter(load => 
          load.status === 'pending' || load.status === 'cancelled'
        );
        
        if (deletableLoads.length !== loads.length) {
          const nonDeletableLoads = loads.filter(load => 
            load.status !== 'pending' && load.status !== 'cancelled'
          );
          throw createDispatchError(
            DispatchErrorCode.INVALID_STATUS_TRANSITION,
            { 
              nonDeletableLoads: nonDeletableLoads.map(l => ({ id: l.id, status: l.status }))
            },
            `Cannot delete loads not in pending/cancelled status: ${nonDeletableLoads.map(l => l.referenceNumber).join(', ')}`
          );
        }

        await prisma.load.deleteMany({
          where: { id: { in: deletableLoads.map(l => l.id) } }
        });

        results = deletableLoads.map(load => ({ id: load.id, success: true }));
        break;

      case 'update_status':
        if (!validatedData.data?.status) {
          throw createDispatchError(
            DispatchErrorCode.INVALID_STATUS_TRANSITION,
            { operation: validatedData.operation },
            'Status is required for status update operation'
          );
        }        const statusUpdates = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const result = await updateLoadStatusAction({
                loadId,
                status: validatedData.data!.status,
                notes: validatedData.data?.notes,
                automaticUpdate: false,
                source: 'dispatcher',
              });
              return { 
                id: loadId, 
                success: result.success, 
                error: result.error ? (typeof result.error === 'string' ? result.error : result.error.message) : undefined
              };
            } catch (error) {
              return { id: loadId, success: false, error: 'Failed to update status' };
            }
          })
        );

        results = statusUpdates;
        break;

      case 'assign_driver':
        if (!validatedData.data?.driverId) {
          throw createDispatchError(
            DispatchErrorCode.ASSIGNMENT_CONFLICT,
            { operation: validatedData.operation },
            'Driver ID is required for driver assignment operation'
          );
        }        const driverAssignments = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const result = await assignDriverAction({
                loadId,
                driverId: validatedData.data!.driverId,
                vehicleId: validatedData.data?.vehicleId || '',
              });
              return { 
                id: loadId, 
                success: result.success, 
                error: result.error ? (typeof result.error === 'string' ? result.error : result.error.message) : undefined
              };
            } catch (error) {
              return { id: loadId, success: false, error: 'Failed to assign driver' };
            }
          })
        );

        results = driverAssignments;
        break;

      case 'assign_vehicle':
        if (!validatedData.data?.vehicleId) {
          throw createDispatchError(
            DispatchErrorCode.ASSIGNMENT_CONFLICT,
            { operation: validatedData.operation },
            'Vehicle ID is required for vehicle assignment operation'
          );
        }

        const vehicleAssignments = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              await prisma.load.update({
                where: { id: loadId },
                data: {
                  vehicleId: validatedData.data!.vehicleId,
                  trailerId: validatedData.data?.trailerId || undefined,
                  updatedAt: new Date(),
                },
              });
              return { id: loadId, success: true };
            } catch (error) {
              return { id: loadId, success: false, error: 'Failed to assign vehicle' };
            }
          })
        );

        results = vehicleAssignments;
        break;

      case 'add_tags':
        if (!validatedData.data?.tags || !Array.isArray(validatedData.data.tags)) {
          throw createDispatchError(
            DispatchErrorCode.INVALID_STATUS_TRANSITION,
            { operation: validatedData.operation },
            'Tags array is required for add tags operation'
          );
        }

        const addTagResults = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const currentLoad = await prisma.load.findUnique({
                where: { id: loadId },
                select: { tags: true },
              });
              
              if (currentLoad) {
                const currentTags = Array.isArray(currentLoad.tags) ? currentLoad.tags as string[] : [];
                const newTags = [...new Set([...currentTags, ...validatedData.data!.tags])];
                
                await prisma.load.update({
                  where: { id: loadId },
                  data: { tags: newTags, updatedAt: new Date() },
                });
              }
              return { id: loadId, success: true };
            } catch (error) {
              return { id: loadId, success: false, error: 'Failed to add tags' };
            }
          })
        );

        results = addTagResults;
        break;

      case 'remove_tags':
        if (!validatedData.data?.tags || !Array.isArray(validatedData.data.tags)) {
          throw createDispatchError(
            DispatchErrorCode.INVALID_STATUS_TRANSITION,
            { operation: validatedData.operation },
            'Tags array is required for remove tags operation'
          );
        }

        const removeTagResults = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const currentLoad = await prisma.load.findUnique({
                where: { id: loadId },
                select: { tags: true },
              });
              
              if (currentLoad) {
                const currentTags = Array.isArray(currentLoad.tags) ? currentLoad.tags as string[] : [];
                const tagsToRemove = validatedData.data!.tags;
                const newTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
                
                await prisma.load.update({
                  where: { id: loadId },
                  data: { tags: newTags, updatedAt: new Date() },
                });
              }
              return { id: loadId, success: true };
            } catch (error) {
              return { id: loadId, success: false, error: 'Failed to remove tags' };
            }
          })
        );

        results = removeTagResults;
        break;

      default:
        throw createDispatchError(
          DispatchErrorCode.INVALID_STATUS_TRANSITION,
          { operation: validatedData.operation },
          'Unsupported bulk operation'
        );
    }

    // Create audit log
    await createAuditLog(
      `BULK_${validatedData.operation.toUpperCase()}`,
      'Load',
      validatedData.loadIds.join(','),
      validatedData,
      user.id,
      orgId
    );

    revalidatePath(`/dashboard/${orgId}/dispatch`);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: validatedData.loadIds.length,
          successful: successCount,
          failed: failureCount,
        },
      },
    };
  }, 'Bulk Load Operation');
}

// Fetch a single load by id with relations
export async function getLoadById(orgId: string, loadId: string) {
  try {
    await checkUserPermissions(orgId, ['dispatch:manage', 'loads:update']);
    const load = await prisma.load.findFirst({
      where: { id: loadId, organizationId: orgId },
      include: {
        driver: true,
        vehicle: true,
        trailer: true,
        statusEvents: { orderBy: { timestamp: 'desc' } },
      },
    });
    if (!load) {
      return { success: false, error: 'Load not found' };
    }
    return { success: true, data: load };
  } catch (error) {
    console.error('Error fetching load by id:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch load',
    };
  }
}
