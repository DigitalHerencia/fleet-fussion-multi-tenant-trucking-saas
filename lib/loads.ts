"use server"

// Import server actions from the dedicated file
import { createLoad, getLoadsForCompany, getLoadById, updateLoad } from "@/lib/actions/load-actions"

// Export assignment function, with the same signature as previous code for backward compatibility
export async function assignLoad(
    id: string,
    driverId: string,
    vehicleId: string,
    trailerId?: string
) {
    return updateLoad(id, driverId, vehicleId, trailerId ?? null, new FormData())
}

// Additional exports for new functionality
export { getLoadsForCompany, getLoadById, createLoad, updateLoad }
