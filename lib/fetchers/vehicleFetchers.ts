"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import prisma from "@/lib/database/db";
import { vehicleFilterSchema, type VehicleFiltersData } from "@/schemas/vehicles";
import { type Vehicle } from "@/types/vehicles";

/**
 * List vehicles for an organization with optional filtering.
 *
 * Validates the filter input using {@link vehicleFilterSchema} before querying
 * the database. The returned objects are mapped to the shared {@link Vehicle}
 * type used throughout the application.
 */
export async function listVehiclesByOrg(
  orgId: string,
  filters: VehicleFiltersData = {} as VehicleFiltersData
): Promise<Vehicle[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const parsed = vehicleFilterSchema.parse(filters);

  const where: any = { organizationId: orgId };

  if (parsed.search) {
    const term = parsed.search;
    where.OR = [
      { unitNumber: { contains: term, mode: "insensitive" } },
      { vin: { contains: term, mode: "insensitive" } },
      { make: { contains: term, mode: "insensitive" } },
      { model: { contains: term, mode: "insensitive" } },
      { licensePlate: { contains: term, mode: "insensitive" } },
    ];
  }

  if (parsed.type) {
    where.type = parsed.type;
  }

  if (parsed.status) {
    where.status = parsed.status;
  }

  if (parsed.make) {
    where.make = { contains: parsed.make, mode: "insensitive" };
  }

  if (parsed.model) {
    where.model = { contains: parsed.model, mode: "insensitive" };
  }

  if (parsed.year) {
    where.year = parsed.year;
  }

  if (parsed.maintenanceDue) {
    where.nextInspectionDue = { lte: new Date() };
  }

  // Basic pagination
  const page = parsed.page || 1;
  const limit = parsed.limit || 10;

  const results = await prisma.vehicle.findMany({
    where,
    orderBy: { unitNumber: "asc" },
    include: {
      organization: { select: { id: true, name: true } },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Map Prisma result to public Vehicle type
  const vehicles: Vehicle[] = results.map((v) => ({
    id: v.id,
    organizationId: v.organizationId,
    type: v.type as Vehicle["type"],
    status: v.status as Vehicle["status"],
    make: v.make ?? "",
    model: v.model ?? "",
    year: v.year ?? 0,
    vin: v.vin ?? "",
    licensePlate: v.licensePlate ?? undefined,
    unitNumber: v.unitNumber ?? undefined,
    grossVehicleWeight: undefined,
    maxPayload: undefined,
    fuelType: v.fuelType ?? undefined,
    engineType: undefined,
    registrationNumber: undefined,
    registrationExpiry: v.registrationExpiration ?? undefined,
    insuranceProvider: undefined,
    insurancePolicyNumber: undefined,
    insuranceExpiry: v.insuranceExpiration ?? undefined,
    currentDriverId: undefined,
    currentLoadId: undefined,
    currentLocation: undefined,
    totalMileage: v.currentOdometer ?? undefined,
    lastMaintenanceMileage: undefined,
    nextMaintenanceDate: v.nextInspectionDue ?? undefined,
    nextMaintenanceMileage: undefined,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    driver: undefined,
    organization: v.organization
      ? { id: v.organization.id, name: v.organization.name }
      : undefined,
  }));

  return vehicles;
}

