import { HosLog } from "./../../types/compliance";
'use server';

import prisma from '@/lib/database/db';
import { auth } from '@clerk/nextjs/server';
import {
  complianceDocumentFilterSchema,
  hosFilterSchema,
  dvirFilterSchema,
  maintenanceFilterSchema,
  safetyEventFilterSchema
} from '@/schemas/compliance';
import { parsePermission } from '@/lib/auth/permissions';
import { z } from 'zod';
import { handleError } from "@/lib/errors/handleError";

// Document Fetchers
export async function getComplianceDocuments(
  filter: z.infer<typeof complianceDocumentFilterSchema> = {}
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = parsePermission( userId);
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = complianceDocumentFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,

      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }


    // Execute query with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.complianceDocument.findMany({
        where,
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          vehicle: {
            select: {
              id: true,
              unitNumber: true,
              make: true,
              model: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.complianceDocument.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return handleError(error, "Compliance Document Fetcher")
  }
}


// HOS Fetchers
export async function getHOSLogs(
  filter: z.infer<typeof hosFilterSchema> = {}
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    const hasPermission = parsePermission( userId );
    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    // Validate and parse filter
    const validatedFilter = hosFilterSchema.parse(filter);
    const {
      page = 1,
      limit = 50,
      driverId,

      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = validatedFilter;

    // Build where clause
    const where: any = {
      organizationId: orgId
    };

    if (driverId) {
      where.driverId = driverId;
    }

  

    if (startDate && endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate
      };
    } else if (startDate) {
      where.startTime = { gte: startDate };
    } else if (endDate) {
      where.startTime = { lte: endDate };
    }

    
    return {
      success: true,
      data: {
      
      }
    };
  } catch (error) {
    console.error('Error fetching HOS logs:', error);
    return handleError(error, "HOS Logs Fetcher")
  }
}


