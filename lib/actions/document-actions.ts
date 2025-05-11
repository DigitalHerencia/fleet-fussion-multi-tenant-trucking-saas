"use server"

import { db } from "@/db"
import { documents } from "@/db/schema"
import { uploadToVercelBlob } from "@/lib/blob"
import { z } from "zod"
import { getCurrentCompanyId } from "@/lib/auth"

const documentSchema = z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    fileType: z.string().optional(),
    fileSize: z.number().optional(),
    notes: z.string().optional(),
    driverId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    loadId: z.string().uuid().optional()
})

type DocumentForm = z.infer<typeof documentSchema>

async function getCompanyId(): Promise<string> {
    return getCurrentCompanyId()
}

export async function uploadDocument(formData: FormData) {
    try {
        let fileUrl = formData.get("fileUrl")?.toString() || ""
        const file = formData.get("file") as File | null
        if (file && file.size > 0) {
            fileUrl = await uploadToVercelBlob(file, "documents/")
        }
        const parsed = documentSchema.safeParse(Object.fromEntries(formData))
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            }
        }
        const data = parsed.data as DocumentForm
        const companyId = await getCompanyId()
        const [inserted] = await db
            .insert(documents)
            .values({
                ...data,
                companyId,
                fileUrl,
                fileType: file?.type,
                fileSize: file?.size,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning()
        return { success: true, document: inserted }
    } catch (error) {
        console.error("[DocumentActions] uploadDocument error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to upload document",
            errors: { form: ["Failed to upload document"] }
        }
    }
}
