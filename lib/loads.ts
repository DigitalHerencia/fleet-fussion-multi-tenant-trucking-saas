"use server"

// Import server actions from the dedicated file
import {
    createLoad as createLoadAction,
    updateLoad as updateLoadAction,
    updateLoadStatus as updateLoadStatusAction,
    updateLoadAssignment as updateLoadAssignmentAction,
    getLoadsForCompany,
    getLoadById,
    deleteLoad
} from "@/lib/actions/load-actions"

// Re-export the actions to maintain the same API for existing components
export const createLoad = createLoadAction
export const updateLoad = updateLoadAction
export const updateLoadStatus = updateLoadStatusAction

// Export assignment function, with the same signature as previous code for backward compatibility
export async function assignLoad(
    id: string,
    driverId: string,
    vehicleId: string,
    trailerId?: string
) {
    return updateLoadAssignmentAction(id, driverId, vehicleId, trailerId || null)
}

// Additional exports for new functionality
export { getLoadsForCompany, getLoadById, deleteLoad }
