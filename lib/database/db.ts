/**
 * Database Connection Configuration (Neon + Prisma)
 *
 * - Uses Neon serverless driver for serverless/edge environments
 * - Uses Prisma client singleton pattern to avoid connection exhaustion
 * - Handles error logging and type-safe queries
 */

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

dotenv.config()
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })
export const db = prisma;

// Utility function to handle database errors
export function handleDatabaseError(error: unknown): never {
  console.error('Database error:', error);
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
      case 'P2003':
      case 'P2025':
      default:
        throw new Error(`Database error (Prisma): ${error.message} (Code: ${error.code})`);
    }
  } else if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    // Fallback for generic SQL errors
    const sqlError = error as { code: string; message: string };
    switch (sqlError.code) {
      case '23505':
      case '23503':
      case '23502':
      case '42P01':
      default:
        throw new Error(`Database error: ${sqlError.message} (SQL Code: ${sqlError.code})`);
    }
  }
  throw new Error('Unknown database error occurred');
}

/**
 * Utility to generate a unique slug for organizations (DB-level)
 */
async function generateUniqueOrgSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (suffix <= maxAttempts) {
    const existing = await db.organization.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
  throw new Error(`Could not generate unique slug after ${maxAttempts} attempts for base slug: ${baseSlug}`);
}

// Type-safe database queries helper (rewritten for Prisma)
export class DatabaseQueries {
  /**
   * Upsert (create or update) an organization membership from Clerk webhook
   * Looks up internal org/user IDs by Clerk IDs, upserts membership, sets role and timestamps
   */
  static async upsertOrganizationMembership({ organizationClerkId, userClerkId, role, createdAt, updatedAt }: {
    organizationClerkId: string;
    userClerkId: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    try {
      // Look up internal IDs
      const organization = await db.organization.findUnique({ where: { clerkId: organizationClerkId } });
      if (!organization) throw new Error(`Organization not found for clerkId: ${organizationClerkId}`);
      const user = await db.user.findUnique({ where: { clerkId: userClerkId } });
      if (!user) throw new Error(`User not found for clerkId: ${userClerkId}`);
      // Upsert membership (unique on orgId+userId)
      const membership = await db.organizationMembership.upsert({
        where: {
          // Composite unique constraint name is org_user_unique, so use { organizationId, userId }
          org_user_unique: {
            organizationId: organization.id,
            userId: user.id,
          },
        },
        update: {
          role,
          updatedAt: updatedAt || new Date(),
        },
        create: {
          organizationId: organization.id,
          userId: user.id,
          role,
          createdAt: createdAt || new Date(),
          updatedAt: updatedAt || new Date(),
        },
      });
      return membership;
    } catch (error) {
      console.error('Error in upsertOrganizationMembership:', error);
      handleDatabaseError(error);
    }
  }

  /**
   * Delete an organization membership (by orgClerkId and userClerkId)
   */
  static async deleteOrganizationMembership({ organizationClerkId, userClerkId }: {
    organizationClerkId: string;
    userClerkId: string;
  }) {
    try {
      const organization = await db.organization.findUnique({ where: { clerkId: organizationClerkId } });
      if (!organization) {
        console.warn(`[DB] Organization not found for clerkId: ${organizationClerkId}, skipping membership delete.`);
        return { success: true, message: 'Organization not found, skipping membership delete.' };
      }
      const user = await db.user.findUnique({ where: { clerkId: userClerkId } });
      if (!user) {
        console.warn(`[DB] User not found for clerkId: ${userClerkId}, skipping membership delete.`);
        return { success: true, message: 'User not found, skipping membership delete.' };
      }
      await db.organizationMembership.delete({
        where: {
          org_user_unique: {
            organizationId: organization.id,
            userId: user.id,
          },
        },
      });
      return { success: true };
    } catch (error) {
      // If not found, treat as idempotent
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return { success: true };
      }
      console.error('Error in deleteOrganizationMembership:', error);
      handleDatabaseError(error);
    }
  }

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
      if (!clerkId) {
        console.warn('getUserByClerkId called with undefined/empty clerkId');
        return null;
      }
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
      if (!data.clerkId) throw new Error('clerkId is required for organization upsert');
      if (!data.name) throw new Error('name is required for organization upsert');
      if (!data.slug) throw new Error('slug is required for organization upsert');
      const { clerkId } = data;
      const existingOrg = await db.organization.findUnique({ where: { clerkId } });
      if (existingOrg) {
        const updateData = {
          name: data.name,
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
        const organization = await db.organization.update({
          where: { clerkId },
          data: updateData,
        });
        return organization;
      } else {
        let uniqueSlug = await generateUniqueOrgSlug(data.slug);
        let attempt = 0;
        const maxAttempts = 5;
        let lastError;
        while (attempt < maxAttempts) {
          try {
            const orgDataForCreate = {
              clerkId,
              name: data.name,
              slug: uniqueSlug,
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
            const organization = await db.organization.create({
              data: orgDataForCreate,
            });
            return organization;
          } catch (error: unknown) {
            lastError = error;
            if (
              error instanceof PrismaClientKnownRequestError &&
              error.code === 'P2002'
            ) {
              const target = error.meta?.target;
              if (
                (typeof target === 'string' && target === 'slug') ||
                (Array.isArray(target) && target.includes('slug'))
              ) {
                uniqueSlug = await generateUniqueOrgSlug(data.slug);
                attempt++;
                continue;
              } else if (
                (typeof target === 'string' && target === 'clerkId') ||
                (Array.isArray(target) && target.includes('clerkId'))
              ) {
                const existingOrg = await db.organization.findUnique({
                  where: { clerkId }
                });
                if (existingOrg) {
                  return existingOrg;
                }
              }
            }
            throw error;
          }
        }
        throw lastError || new Error('Failed to create organization due to conflicts after multiple attempts');
      }
    } catch (error) {
      console.error(`Error in upsertOrganization for clerkId: ${data.clerkId}`, error);
      handleDatabaseError(error);
    }
  }

  /**
   * Create or update user from Clerk webhook (no organization connection)
   */
  static async upsertUser(data: {
    clerkId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    isActive?: boolean;
    onboardingComplete: boolean;
    lastLogin?: Date | null;
    organizationId?: string | null; // Optional, can be null
  }) {
    try {
      const { clerkId, ...updateData } = data;
      if (!clerkId) throw new Error('clerkId is required for user upsert');
      if (!data.email) throw new Error('email is required for user upsert');

      // Validate organizationId if provided
      let validOrganizationId: string | null = null;
      if (data.organizationId) {
        const org = await db.organization.findUnique({ where: { id: data.organizationId } });
        if (org) {
          validOrganizationId = data.organizationId;
        } else {
          validOrganizationId = null;
        }
      }

      const userDataForUpdate = {
        ...updateData,
        organizationId: validOrganizationId,
      };
      const userDataForCreate = {
        clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
        isActive: data.isActive === undefined ? true : data.isActive,
        onboardingComplete: data.onboardingComplete === undefined ? false : data.onboardingComplete,
        lastLogin: data.lastLogin,
        organizationId: validOrganizationId,
      };

      const user = await db.user.upsert({
        where: { clerkId },
        update: userDataForUpdate,
        create: userDataForCreate,
      });
      return user;
    } catch (error) {
      console.error(`Error in upsertUser for clerkId: ${data.clerkId}`, error);
      handleDatabaseError(error);
    }
  }

  /**
   * Delete organization
   */
  static async deleteOrganization(clerkId: string) {
    try {
      console.log('[DB] deleteOrganization called with clerkId:', clerkId);
      const organization = await db.organization.findUnique({
        where: { clerkId },
      });
      if (!organization) {
        console.warn(`[DB] Organization with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'Organization already deleted or does not exist' };
      }
      await db.organization.delete({
        where: { clerkId },
      });
      console.log(`[DB] Organization deleted successfully: ${clerkId}`);
      return { success: true, message: 'Organization deleted successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return { success: true, message: 'Organization already deleted or does not exist' };
      }
      console.error(`[DB] Error deleting organization ${clerkId}:`, error);
      return { success: false, message: `Failed to delete organization: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(clerkId: string) {
    try {
      console.log('[DB] deleteUser called with clerkId:', clerkId);
      const user = await db.user.findUnique({
        where: { clerkId },
      });
      if (!user) {
        console.warn(`[DB] User with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'User already deleted or does not exist' };
      }
      await db.user.delete({
        where: { clerkId },
      });
      console.log(`[DB] User deleted successfully: ${clerkId}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return { success: true, message: 'User already deleted or does not exist' };
      }
      console.error(`[DB] Error deleting user ${clerkId}:`, error);
      return { success: false, message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

export default db;
