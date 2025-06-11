import type { LoadStatus } from '@/types/dispatch';

/**
 * Business rules for dispatch domain operations
 * Enforces load lifecycle management and validation rules
 */

// Valid status transitions mapping
export const STATUS_TRANSITIONS: Record<LoadStatus, LoadStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['posted', 'assigned', 'cancelled'],
  posted: ['booked', 'cancelled', 'pending'],
  booked: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['dispatched', 'cancelled', 'pending'],
  dispatched: ['in_transit', 'assigned'],
  in_transit: ['at_pickup', 'assigned'],
  at_pickup: ['picked_up', 'in_transit'],
  picked_up: ['en_route', 'problem'],
  en_route: ['at_delivery', 'problem'],
  at_delivery: ['delivered', 'problem'],
  delivered: ['pod_required', 'completed'],
  pod_required: ['completed', 'invoiced'],
  completed: ['invoiced'],
  invoiced: ['paid'],
  paid: [], // Terminal state
  cancelled: [], // Terminal state
  problem: ['assigned', 'cancelled'], // Can be reassigned or cancelled
};

// Status requiring driver assignment
export const DRIVER_REQUIRED_STATUSES: LoadStatus[] = [
  'assigned',
  'dispatched',
  'in_transit',
  'at_pickup',
  'picked_up',
  'en_route',
  'at_delivery',
  'delivered',
];

// Status requiring vehicle assignment
export const VEHICLE_REQUIRED_STATUSES: LoadStatus[] = [
  'assigned',
  'dispatched',
  'in_transit',
  'at_pickup',
  'picked_up',
  'en_route',
  'at_delivery',
  'delivered',
];

// Status that prevent load modification
export const IMMUTABLE_STATUSES: LoadStatus[] = [
  'paid',
  'cancelled',
  'completed',
];

// Business rule validation functions
export interface BusinessRuleResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates if a status transition is allowed
 */
export function validateStatusTransition(
  currentStatus: LoadStatus,
  newStatus: LoadStatus
): BusinessRuleResult {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check if transition is allowed
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions.includes(newStatus)) {
    result.isValid = false;
    result.errors.push(
      `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`
    );
  }

  // Add warnings for critical transitions
  if (newStatus === 'cancelled') {
    result.warnings.push('Cancelling load will make it immutable');
  }

  if (newStatus === 'completed' && currentStatus !== 'delivered') {
    result.warnings.push('Completing load without delivery confirmation');
  }

  return result;
}

/**
 * Validates driver assignment requirements
 */
export function validateDriverAssignment(
  status: LoadStatus,
  driverId?: string | null
): BusinessRuleResult {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (DRIVER_REQUIRED_STATUSES.includes(status) && !driverId) {
    result.isValid = false;
    result.errors.push(
      `Driver assignment is required for status: ${status}`
    );
  }

  return result;
}

/**
 * Validates vehicle assignment requirements
 */
export function validateVehicleAssignment(
  status: LoadStatus,
  vehicleId?: string | null
): BusinessRuleResult {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (VEHICLE_REQUIRED_STATUSES.includes(status) && !vehicleId) {
    result.isValid = false;
    result.errors.push(
      `Vehicle assignment is required for status: ${status}`
    );
  }

  return result;
}

/**
 * Validates if load can be modified
 */
export function validateLoadModification(status: LoadStatus): BusinessRuleResult {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (IMMUTABLE_STATUSES.includes(status)) {
    result.isValid = false;
    result.errors.push(
      `Load cannot be modified in ${status} status`
    );
  }

  return result;
}

/**
 * Validates driver availability for assignment
 */
export async function validateDriverAvailability(
  driverId: string,
  orgId: string,
  excludeLoadId?: string
): Promise<BusinessRuleResult> {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const db = await import('@/lib/database/db').then(m => m.default);
    
    // Check if driver exists and is active
    const driver = await db.driver.findFirst({
      where: {
        id: driverId,
        organizationId: orgId,
        status: 'active',
      },
    });

    if (!driver) {
      result.isValid = false;
      result.errors.push('Driver not found or inactive');
      return result;
    }

    // Check for conflicting assignments
    const conflictingLoads = await db.load.findMany({
      where: {
        driverId,
        organizationId: orgId,
        status: {
          in: ['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route'],
        },
        ...(excludeLoadId && { id: { not: excludeLoadId } }),
      },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
      },
    });

    if (conflictingLoads.length > 0) {
      result.isValid = false;
      result.errors.push(
        `Driver is already assigned to active loads: ${conflictingLoads
          .map(l => l.referenceNumber)
          .join(', ')}`
      );
    }    // Check driver compliance (medical card, license, etc.)
    const today = new Date();
    if (driver.medicalCardExpiration && driver.medicalCardExpiration < today) {
      result.isValid = false;
      result.errors.push('Driver medical card is expired');
    }

    if (driver.licenseExpiration && driver.licenseExpiration < today) {
      result.isValid = false;
      result.errors.push('Driver license is expired');
    }    // Add warnings for upcoming expirations
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (driver.medicalCardExpiration && driver.medicalCardExpiration < thirtyDaysFromNow) {
      result.warnings.push('Driver medical card expires within 30 days');
    }

    if (driver.licenseExpiration && driver.licenseExpiration < thirtyDaysFromNow) {
      result.warnings.push('Driver license expires within 30 days');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push('Failed to validate driver availability');
  }

  return result;
}

/**
 * Validates vehicle availability for assignment
 */
export async function validateVehicleAvailability(
  vehicleId: string,
  orgId: string,
  excludeLoadId?: string
): Promise<BusinessRuleResult> {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    const db = await import('@/lib/database/db').then(m => m.default);
    
    // Check if vehicle exists and is active
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        organizationId: orgId,
        status: 'active',
      },
    });

    if (!vehicle) {
      result.isValid = false;
      result.errors.push('Vehicle not found or inactive');
      return result;
    }

    // Check for conflicting assignments
    const conflictingLoads = await db.load.findMany({
      where: {
        vehicleId,
        organizationId: orgId,
        status: {
          in: ['assigned', 'dispatched', 'in_transit', 'at_pickup', 'picked_up', 'en_route'],
        },
        ...(excludeLoadId && { id: { not: excludeLoadId } }),
      },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
      },
    });

    if (conflictingLoads.length > 0) {
      result.isValid = false;
      result.errors.push(
        `Vehicle is already assigned to active loads: ${conflictingLoads
          .map(l => l.referenceNumber)
          .join(', ')}`
      );
    }

    // Check vehicle maintenance and inspection status
    const today = new Date();
    if (vehicle.nextInspectionDue && vehicle.nextInspectionDue < today) {
      result.isValid = false;
      result.errors.push('Vehicle inspection is overdue');
    }

    // Add warnings for upcoming maintenance
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (vehicle.nextInspectionDue && vehicle.nextInspectionDue < thirtyDaysFromNow) {
      result.warnings.push('Vehicle inspection due within 30 days');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push('Failed to validate vehicle availability');
  }

  return result;
}

/**
 * Validates load assignment compatibility
 */
export async function validateLoadAssignment(
  loadId: string,
  driverId?: string,
  vehicleId?: string,
  orgId?: string
): Promise<BusinessRuleResult> {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };
  try {
    const db = await import('@/lib/database/db').then(m => m.default);
    
    // Get load details
    const load = await db.load.findFirst({
      where: { id: loadId },
      select: {
        organizationId: true,
        status: true,
        equipment: true,
        cargo: true,
        pickupDate: true,
        deliveryDate: true,
        scheduledPickupDate: true,
        scheduledDeliveryDate: true,
      },
    });

    if (!load) {
      result.isValid = false;
      result.errors.push('Load not found');
      return result;
    }

    const effectiveOrgId = orgId || load.organizationId;

    // Validate driver availability if provided
    if (driverId) {
      const driverValidation = await validateDriverAvailability(driverId, effectiveOrgId, loadId);
      result.errors.push(...driverValidation.errors);
      result.warnings.push(...driverValidation.warnings);
      if (!driverValidation.isValid) result.isValid = false;
    }

    // Validate vehicle availability if provided
    if (vehicleId) {
      const vehicleValidation = await validateVehicleAvailability(vehicleId, effectiveOrgId, loadId);
      result.errors.push(...vehicleValidation.errors);
      result.warnings.push(...vehicleValidation.warnings);
      if (!vehicleValidation.isValid) result.isValid = false;

      // Additional vehicle-load compatibility checks
      const vehicle = await db.vehicle.findFirst({
        where: { id: vehicleId },
        select: { type: true, maxWeight: true, maxLength: true },
      });      if (vehicle && load.cargo) {
        // Check weight compatibility - safely parse JSON cargo data
        const cargoData = typeof load.cargo === 'object' && load.cargo !== null ? load.cargo as any : null;
        if (vehicle.maxWeight && cargoData?.weight && typeof cargoData.weight === 'number' && cargoData.weight > vehicle.maxWeight) {
          result.isValid = false;
          result.errors.push(
            `Load weight (${cargoData.weight}) exceeds vehicle capacity (${vehicle.maxWeight})`
          );
        }

        // Check equipment type compatibility
        const equipmentData = typeof load.equipment === 'object' && load.equipment !== null ? load.equipment as any : null;
        if (equipmentData?.type && vehicle.type !== equipmentData.type) {
          result.warnings.push(
            `Vehicle type (${vehicle.type}) may not match required equipment (${equipmentData.type})`
          );
        }
      }
    }    // Validate pickup/delivery dates
    const now = new Date();
    const pickupDate = load.pickupDate || load.scheduledPickupDate;
    const deliveryDate = load.deliveryDate || load.scheduledDeliveryDate;
    
    if (pickupDate && new Date(pickupDate) < now) {
      result.warnings.push('Pickup date is in the past');
    }

    if (deliveryDate && new Date(deliveryDate) < now) {
      result.warnings.push('Delivery date is in the past');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push('Failed to validate load assignment');
  }

  return result;
}

/**
 * Comprehensive load validation combining all business rules
 */
export async function validateLoad(
  loadData: {
    id?: string;
    status: LoadStatus;
    driverId?: string | null;
    vehicleId?: string | null;
    organizationId: string;
  },
  newStatus?: LoadStatus
): Promise<BusinessRuleResult> {
  const result: BusinessRuleResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const targetStatus = newStatus || loadData.status;

  // 1. Validate status transition if changing status
  if (newStatus && newStatus !== loadData.status) {
    const transitionValidation = validateStatusTransition(loadData.status, newStatus);
    result.errors.push(...transitionValidation.errors);
    result.warnings.push(...transitionValidation.warnings);
    if (!transitionValidation.isValid) result.isValid = false;
  }

  // 2. Validate driver assignment requirements
  const driverValidation = validateDriverAssignment(targetStatus, loadData.driverId);
  result.errors.push(...driverValidation.errors);
  result.warnings.push(...driverValidation.warnings);
  if (!driverValidation.isValid) result.isValid = false;

  // 3. Validate vehicle assignment requirements
  const vehicleValidation = validateVehicleAssignment(targetStatus, loadData.vehicleId);
  result.errors.push(...vehicleValidation.errors);
  result.warnings.push(...vehicleValidation.warnings);
  if (!vehicleValidation.isValid) result.isValid = false;

  // 4. Validate load modification permissions
  const modificationValidation = validateLoadModification(loadData.status);
  result.errors.push(...modificationValidation.errors);
  result.warnings.push(...modificationValidation.warnings);
  if (!modificationValidation.isValid) result.isValid = false;

  // 5. Validate assignment compatibility if IDs provided
  if (loadData.id && (loadData.driverId || loadData.vehicleId)) {
    const assignmentValidation = await validateLoadAssignment(
      loadData.id,
      loadData.driverId || undefined,
      loadData.vehicleId || undefined,
      loadData.organizationId
    );
    result.errors.push(...assignmentValidation.errors);
    result.warnings.push(...assignmentValidation.warnings);
    if (!assignmentValidation.isValid) result.isValid = false;
  }

  return result;
}
