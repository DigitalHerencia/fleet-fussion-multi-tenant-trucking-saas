/**
 * Database Connection Configuration
 *
 * Neon PostgreSQL connection with Prisma ORM
 * Includes connection pooling and proper error handling
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


// NOTE: Enums like UserRole are now available via Prisma Client (e.g., Prisma.UserRole)
// or directly if you export them from schema.prisma (though not standard for Prisma enums)

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the Prisma Client instance
const prisma = new PrismaClient();

// Export the Prisma Client instance
export const db = prisma;

// Export types (Prisma generates its own types, which are generally preferred)
// You can still export specific types if needed, e.g.:
// export type { User, Organization } from '../../generated/prisma';

// Utility function to handle database errors
export function handleDatabaseError(error: any): never {
  console.error('Database error:', error);

  if (error instanceof PrismaClientKnownRequestError) {
    // Prisma-specific errors
    switch (error.code) {
      case 'P2002': // Unique constraint failed
        throw new Error(`Record already exists: A unique constraint would be violated on ${Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'a field'}.`);
      case 'P2003': // Foreign key constraint failed
        throw new Error(`Foreign key constraint failed on the field: ${error.meta?.field_name}`);
      case 'P2025': // Record to update or delete does not exist
        throw new Error('Operation failed because the record does not exist.');
      // Add more Prisma error codes as needed
      default:
        throw new Error(`Database error (Prisma): ${error.message} (Code: ${error.code})`);
    }
  } else if (error.code) { // Fallback for generic SQL errors if not caught by Prisma error types
    switch (error.code) {
      case '23505': // Unique violation (PostgreSQL specific, Prisma usually catches as P2002)
        throw new Error('Record already exists');
      case '23503': // Foreign key violation (PostgreSQL specific, Prisma usually catches as P2003)
        throw new Error('Referenced record does not exist');
      case '23502': // Not null violation
        throw new Error('Required field is missing');
      case '42P01': // Undefined table
        throw new Error('Database table does not exist');
      default:
        throw new Error(`Database error: ${error.message} (SQL Code: ${error.code})`);
    }
  }

  throw new Error('Unknown database error occurred');
}

// Type-safe database queries helper (rewritten for Prisma)
export class DatabaseQueries {
  /**
   * Get organization by Clerk ID
   */
  static async getOrganizationByClerkId(clerkId: string) {
    try {
      const organization = await db.organization.findUnique({
        where: { clerkId },
      });
      return organization || null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string) {
    try {
      const user = await db.user.findUnique({
        where: { clerkId },
      });
      return user || null;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create or update organization from Clerk webhook
   */
  static async upsertOrganization(data: {
    clerkId: string;
    name: string;
    slug: string;
    // Prisma will use the types from schema.prisma for metadata fields
    // Ensure the structure of metadata matches your Prisma schema for Organization
    dotNumber?: string | null;
    mcNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    phone?: string | null;
    email?: string | null;
    logoUrl?: string | null;
    maxUsers?: number;
    billingEmail?: string | null;
    isActive?: boolean;
  }) {
    try {
      const { clerkId, ...updateData } = data;
      const orgDataForUpdate = {
        ...updateData,
      };
      const orgDataForCreate = {
        clerkId,
        name: data.name,
        slug: data.slug,
        dotNumber: data.dotNumber,
        mcNumber: data.mcNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        email: data.email,
        logoUrl: data.logoUrl,
        maxUsers: data.maxUsers === undefined ? 5 : data.maxUsers,
        billingEmail: data.billingEmail,
        isActive: data.isActive === undefined ? true : data.isActive,
      };

      const organization = await db.organization.upsert({
        where: { clerkId },
        update: orgDataForUpdate,
        create: orgDataForCreate,
      });
      return organization;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Create or update user from Clerk webhook
   */  static async upsertUser(data: {
    clerkId: string;
    organizationId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    isActive?: boolean;
    onboardingCompleted?: boolean;
    lastLogin?: Date | null;
  }) {
    try {
      const { clerkId, organizationId, ...updateData } = data;

      // Check if organization exists, if not, create a placeholder organization
      let organizationExists = await db.organization.findUnique({
        where: { id: organizationId },
      });
      
      if (!organizationExists) {
        console.log(`📝 Creating placeholder organization for ID: ${organizationId}`);
        // Create a placeholder organization with minimal data
        try {
          organizationExists = await db.organization.create({
            data: {
              clerkId: organizationId,
              name: `Organization ${organizationId.substring(0, 8)}`,
              slug: `org-${organizationId.substring(0, 8)}`,
              subscriptionTier: 'free',
              subscriptionStatus: 'trial',
              maxUsers: 5,
              isActive: true,
            },
          });
          console.log(`✅ Placeholder organization created: ${organizationId}`);
        } catch (createError) {
          console.error(`❌ Failed to create placeholder organization: ${organizationId}`, createError);
          throw new Error(`Could not create or find organization with ID ${organizationId}`);
        }
      }

      const userDataForUpdate = {
        ...updateData,
      };

      const userDataForCreate = {
        clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
        isActive: data.isActive === undefined ? true : data.isActive,
        onboardingCompleted: data.onboardingCompleted === undefined ? false : data.onboardingCompleted,
        lastLogin: data.lastLogin,
        organization: {
          connect: { id: organizationId },
        },
      };

      const user = await db.user.upsert({
        where: { clerkId },
        update: userDataForUpdate,
        create: userDataForCreate,
      });
      return user;
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Delete organization
   */
  static async deleteOrganization(clerkId: string) {
    try {
      await db.organization.delete({
        where: { clerkId },
      });
    } catch (error) {
      // If the error is a Prisma P2025 (record does not exist), treat as success (idempotent)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Organization with clerkId ${clerkId} does not exist, skipping delete.`);
        return;
      }
      handleDatabaseError(error);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(clerkId: string) {
    try {
      await db.user.delete({
        where: { clerkId },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export default db;
