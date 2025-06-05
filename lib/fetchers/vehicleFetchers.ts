import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import prisma from "@/lib/database/db";
import type { Vehicle, VehicleFilters } from "@/types/vehicles";

export const listVehiclesByOrg = cache(async (
  orgId: string,
  filters: VehicleFilters = {}
): Promise<Vehicle[]> => {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const where: any = { organizationId: orgId };

    if (filters.search) {
      where.OR = [
        { unitNumber: { contains: filters.search, mode: "insensitive" } },
        { vin: { contains: filters.search, mode: "insensitive" } },
        { make: { contains: filters.search, mode: "insensitive" } },
        { model: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { unitNumber: "asc" },
    });

    return vehicles as unknown as Vehicle[];
  } catch (error) {
    console.error("Error listing vehicles:", error);
    return [];
  }
});
