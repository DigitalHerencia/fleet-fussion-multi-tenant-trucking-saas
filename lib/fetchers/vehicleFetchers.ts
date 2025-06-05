"use server";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

import prisma from "@/lib/database/db";
import type { Vehicle, VehicleFilters, VehicleListResponse } from "@/types/vehicles";

/**
 * List vehicles for an organization with optional filtering and pagination
 */
export const listVehiclesByOrg = cache(async (
  orgId: string,
  filters: VehicleFilters = {}
): Promise<VehicleListResponse> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { vehicles: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    const where: any = { organizationId: orgId };

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { unitNumber: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { vin: { contains: search, mode: "insensitive" } },
        { licensePlate: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.make) {
      where.make = { contains: filters.make, mode: "insensitive" };
    }

    if (filters.model) {
      where.model = { contains: filters.model, mode: "insensitive" };
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.assignedDriverId) {
      where.currentDriverId = filters.assignedDriverId;
    }

    if (filters.maintenanceDue) {
      where.nextMaintenanceDate = { lte: new Date() };
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          organization: { select: { id: true, name: true } },
        },
        orderBy: { unitNumber: "asc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error listing vehicles:", error);
    return { vehicles: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
});

