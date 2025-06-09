'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { loadDocumentSchema } from '@/schemas/dispatch';
import type { LoadDocument } from '@/types/dispatch';

// Create load document action
export async function createLoadDocumentAction(
  data: z.infer<typeof loadDocumentSchema> & {
    url: string;
    fileSize: number;
    mimeType: string;
  }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validatedData = loadDocumentSchema
      .extend({
        url: z.string().url(),
        fileSize: z.number().min(1),
        mimeType: z.string().min(1),
      })
      .parse(data);

    // Verify the load belongs to the organization
    const load = await db.load.findFirst({
      where: {
        id: validatedData.loadId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!load) {
      return { success: false, error: 'Load not found or access denied' };
    }

    // Create the document record
    const document = await db.loadDocument.create({
      data: {
        loadId: validatedData.loadId,
        name: validatedData.name,
        type: validatedData.type,
        category: validatedData.category,
        description: validatedData.description,
        isRequired: validatedData.isRequired,
        url: validatedData.url,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        isReceived: true,
        receivedAt: new Date(),
        uploadedAt: new Date(),
        uploadedBy: userId,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    revalidatePath(`/dashboard/${orgId}/dispatch/${validatedData.loadId}`);

    return { success: true, data: document };
  } catch (error) {
    return handleError(error, 'Create Load Document');
  }
}

// Update load document action
export async function updateLoadDocumentAction(
  documentId: string,
  data: Partial<z.infer<typeof loadDocumentSchema>>
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the document belongs to the organization
    const existingDocument = await db.loadDocument.findFirst({
      where: {
        id: documentId,
        load: {
          organizationId: orgId,
        },
      },
      include: {
        load: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (!existingDocument) {
      return { success: false, error: 'Document not found or access denied' };
    }

    // Update the document
    const updatedDocument = await db.loadDocument.update({
      where: { id: documentId },
      data: {
        ...data,
      },
    });

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    revalidatePath(`/dashboard/${orgId}/dispatch/${existingDocument.loadId}`);

    return { success: true, data: updatedDocument };
  } catch (error) {
    return handleError(error, 'Update Load Document');
  }
}

// Delete load document action
export async function deleteLoadDocumentAction(documentId: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the document belongs to the organization
    const existingDocument = await db.loadDocument.findFirst({
      where: {
        id: documentId,
        load: {
          organizationId: orgId,
        },
      },
      include: {
        load: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (!existingDocument) {
      return { success: false, error: 'Document not found or access denied' };
    }

    // Delete the document
    await db.loadDocument.delete({
      where: { id: documentId },
    });

    // Note: In a production environment, you might also want to delete the file from blob storage

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    revalidatePath(`/dashboard/${orgId}/dispatch/${existingDocument.loadId}`);

    return { success: true };
  } catch (error) {
    return handleError(error, 'Delete Load Document');
  }
}

// Get load documents action
export async function getLoadDocumentsAction(loadId: string) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the load belongs to the organization
    const load = await db.load.findFirst({
      where: {
        id: loadId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!load) {
      return { success: false, error: 'Load not found or access denied' };
    }

    // Get all documents for the load
    const documents = await db.loadDocument.findMany({
      where: {
        loadId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return { success: true, data: documents };
  } catch (error) {
    return handleError(error, 'Get Load Documents');
  }
}

// Bulk operations for load documents
export async function bulkLoadDocumentAction(
  operation: 'delete' | 'update_category' | 'mark_required',
  documentIds: string[],
  data?: {
    category?: LoadDocument['category'];
    isRequired?: boolean;
  }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify all documents belong to the organization
    const documents = await db.loadDocument.findMany({
      where: {
        id: { in: documentIds },
        load: {
          organizationId: orgId,
        },
      },
      include: {
        load: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (documents.length !== documentIds.length) {
      return { success: false, error: 'Some documents not found or access denied' };
    }

    let results: Array<{ id: string; success: boolean; error?: string }> = [];

    switch (operation) {
      case 'delete':
        await db.loadDocument.deleteMany({
          where: { id: { in: documentIds } },
        });
        results = documentIds.map(id => ({ id, success: true }));
        break;

      case 'update_category':
        if (!data?.category) {
          return { success: false, error: 'Category is required for update operation' };
        }
        await db.loadDocument.updateMany({
          where: { id: { in: documentIds } },
          data: { category: data.category },
        });
        results = documentIds.map(id => ({ id, success: true }));
        break;

      case 'mark_required':
        if (data?.isRequired === undefined) {
          return { success: false, error: 'isRequired flag is required for this operation' };
        }
        await db.loadDocument.updateMany({
          where: { id: { in: documentIds } },
          data: { isRequired: data.isRequired },
        });
        results = documentIds.map(id => ({ id, success: true }));
        break;

      default:
        return { success: false, error: 'Unsupported bulk operation' };
    }

    // Revalidate relevant paths
    const loadIds = [...new Set(documents.map(d => d.loadId))];
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    loadIds.forEach(loadId => {
      revalidatePath(`/dashboard/${orgId}/dispatch/${loadId}`);
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: documentIds.length,
          successful: successCount,
          failed: failureCount,
        },
      },
    };
  } catch (error) {
    return handleError(error, 'Bulk Load Document Operation');
  }
}
