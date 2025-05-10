import { db } from "@/db"
import { documents } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getDocumentsForVehicle = cache(async function getDocumentsForVehicle(
    vehicleId: string
) {
    return db.query.documents.findMany({
        where: (documents, { eq }) => eq(documents.vehicleId, vehicleId),
        orderBy: (documents, { desc }) => [desc(documents.createdAt)]
    })
})

export const getDocumentsForDriver = cache(async function getDocumentsForDriver(driverId: string) {
    return db.query.documents.findMany({
        where: (documents, { eq }) => eq(documents.driverId, driverId),
        orderBy: (documents, { desc }) => [desc(documents.createdAt)]
    })
})
