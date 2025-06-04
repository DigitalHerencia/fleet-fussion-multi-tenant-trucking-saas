"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/database/db";
import { revalidatePath } from "next/cache";
import type { CreateLoadInput, UpdateLoadInput } from "@/schemas/dispatch";
import { updateLoadSchema } from "@/schemas/dispatch";

/**
 * Update an existing load with the provided fields.
 *
 * @param id - The load identifier to update.
 * @param data - Partial load data from the dispatch form.
 * @returns Result with the updated load or an error message.
 */
export async function updateLoadAction(id: string, data: UpdateLoadInput) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateLoadSchema.parse(data);
    const {
      rate,
      customer,
      origin,
      destination,
      driver,
      vehicle,
      trailer,
      ...rest
    } = validated;

    const dbData: any = {
      ...rest,
      updatedAt: new Date(),
    };

    if (typeof rate !== "undefined") dbData.rate = rate;

    if (customer && typeof customer === "object") {
      dbData.customerName = customer.name ?? null;
      dbData.customerContact = customer.contactName ?? null;
      dbData.customerPhone = customer.phone ?? null;
      dbData.customerEmail = customer.email ?? null;
    }

    if (origin && typeof origin === "object") {
      dbData.originAddress = origin.address ?? null;
      dbData.originCity = origin.city ?? null;
      dbData.originState = origin.state ?? null;
      dbData.originZip = origin.zip ?? null;
      dbData.originLat = origin.latitude ?? null;
      dbData.originLng = origin.longitude ?? null;
    }

    if (destination && typeof destination === "object") {
      dbData.destinationAddress = destination.address ?? null;
      dbData.destinationCity = destination.city ?? null;
      dbData.destinationState = destination.state ?? null;
      dbData.destinationZip = destination.zip ?? null;
      dbData.destinationLat = destination.latitude ?? null;
      dbData.destinationLng = destination.longitude ?? null;
    }

    if (driver && typeof driver === "object" && driver.id)
      dbData.driverId = driver.id;
    if (vehicle && typeof vehicle === "object" && vehicle.id)
      dbData.vehicleId = vehicle.id;
    if (trailer && typeof trailer === "object" && trailer.id)
      dbData.trailerId = trailer.id;

    const load = await db.load.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: dbData,
    });

    revalidatePath("/[orgId]/dispatch", "page");
    return { success: true, data: load };
  } catch (error) {
    console.error("Error updating load:", error);
    return { success: false, error: "Failed to update load" };
  }
}

export async function updateLoadStatus(id: string, status: string) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: "Unauthorized" };
    }

    const load = await db.load.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    revalidatePath("/[orgId]/dispatch", "page");
    return { success: true, data: load };
  } catch (error) {
    console.error("Error updating load status:", error);
    return { success: false, error: "Failed to update load status" };
  }
}

export async function deleteLoadAction(id: string) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.load.delete({
      where: {
        id,
        organizationId: orgId,
      },
    });

    revalidatePath("/[orgId]/dispatch", "page");
    return { success: true };
  } catch (error) {
    console.error("Error deleting load:", error);
    return { success: false, error: "Failed to delete load" };
  }
}
