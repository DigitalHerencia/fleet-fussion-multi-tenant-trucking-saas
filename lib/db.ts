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
  static upsertOrganizationMembership ( arg0: { clerkId: any; organizationId: any; userId: any; role: any; createdAt: Date | undefined; updatedAt: Date | undefined; } )
  {
    throw new Error( 'Method not implemented.' );
  }
  static deleteOrganizationMembership ( id: any )
  {
    throw new Error( 'Method not implemented.' );
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
      // Validate clerkId is provided
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
      // Validate required fields
      if (!data.clerkId) {
        throw new Error('clerkId is required for organization upsert');
      }
      if (!data.name) {
        throw new Error('name is required for organization upsert');
      }
      if (!data.slug) {
        throw new Error('slug is required for organization upsert');
      }

      const { clerkId } = data;
      
      // First, check if organization exists by clerkId
      const existingOrg = await db.organization.findUnique({
        where: { clerkId }
      });

      if (existingOrg) {
        // Organization exists, update it without changing the slug to avoid conflicts
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
        // Organization doesn't exist, create new one with unique slug
        // Pre-generate a unique slug before attempting to create
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
                // Slug conflict, generate a new unique slug and try again
                console.log(`🔄 Slug conflict on attempt ${attempt + 1}, generating new unique slug...`);
                uniqueSlug = await generateUniqueOrgSlug(data.slug);
                attempt++;
                continue;
              } else if (
                (typeof target === 'string' && target === 'clerkId') ||
                (Array.isArray(target) && target.includes('clerkId'))
              ) {
                // ClerkId conflict - this means the organization was just created by another process
                // Return the existing organization
                console.log(`✅ Organization with clerkId ${clerkId} was created by another process, fetching it...`);
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
   * Create or update user from Clerk webhook
   */  static async upsertUser(data: {
    clerkId: string;
    organizationId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    isActive?: boolean;
    onboardingComplete: boolean;
    lastLogin?: Date | null;
  }) {
    try {
      const { clerkId, organizationId, ...updateData } = data;

      // Validate required fields
      if (!clerkId) {
        throw new Error('clerkId is required for user upsert');
      }
      if (!organizationId) {
        throw new Error('organizationId is required for user upsert');
      }
      if (!data.email) {
        throw new Error('email is required for user upsert');
      }

      // Check if organization exists, if not, create a placeholder organization
      let organizationExists = await db.organization.findUnique({
        where: { clerkId: organizationId },
      });
      
      if (!organizationExists) {
        console.log(`📝 Creating placeholder organization for ID: ${organizationId}`);
        
        // Try to create a placeholder organization with retry logic for race conditions
        let createAttempts = 0;
        const maxAttempts = 3;
        let lastError;
        while (!organizationExists && createAttempts < maxAttempts) {
          createAttempts++;
          try {
            // Generate a unique slug for the placeholder org
            const baseSlug = `org-${organizationId.substring(0, 8)}`;
            const uniqueSlug = await generateUniqueOrgSlug(baseSlug);
            organizationExists = await db.organization.create({
              data: {
                clerkId: organizationId,
                name: `Organization ${organizationId.substring(0, 8)}`,
                slug: uniqueSlug,
                subscriptionTier: 'free',
                subscriptionStatus: 'trial',
                maxUsers: 5,
                isActive: true,
              },
            });
            console.log(`✅ Placeholder organization created: ${organizationId}`);
            break;
          } catch (createError: any) {
            lastError = createError;
            if (createError?.code === 'P2002') {
              console.log(`🔄 Unique constraint error, retrying slug for organization: ${organizationId}`);
              await new Promise(resolve => setTimeout(resolve, 100 * createAttempts));
              organizationExists = await db.organization.findUnique({ where: { clerkId: organizationId } });
              if (organizationExists) {
                console.log(`✅ Found existing organization after race condition: ${organizationId}`);
                break;
              }
            } else {
              console.error(`❌ Non-recoverable error creating organization: ${createError.message}`);
              break;
            }
          }
        }
        if (!organizationExists) {
          throw lastError || new Error(`Could not create or find organization with ID ${organizationId} after ${maxAttempts} attempts`);
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
        onboardingComplete: data.onboardingComplete === undefined ? false : data.onboardingComplete,
        lastLogin: data.lastLogin,
        organization: {
          connect: { id: organizationExists.id },
        },
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
      // Check if organization exists first
      const organization = await db.organization.findUnique({
        where: { clerkId },
      });
      
      if (!organization) {
        console.warn(`Organization with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'Organization already deleted or does not exist' };
      }
      
      await db.organization.delete({
        where: { clerkId },
      });
      console.log(`✅ Organization deleted successfully: ${clerkId}`);
      return { success: true, message: 'Organization deleted successfully' };
    } catch (error) {
      // If the error is a Prisma P2025 (record does not exist), treat as success (idempotent)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`Organization with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'Organization already deleted or does not exist' };
      }
      console.error(`Error deleting organization ${clerkId}:`, error);
      return { success: false, message: `Failed to delete organization: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(clerkId: string) {
    try {
      // Check if user exists first
      const user = await db.user.findUnique({
        where: { clerkId },
      });
      
      if (!user) {
        console.warn(`User with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'User already deleted or does not exist' };
      }
      
      await db.user.delete({
        where: { clerkId },
      });
      console.log(`✅ User deleted successfully: ${clerkId}`);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      // If the error is a Prisma P2025 (record does not exist), treat as success (idempotent)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        console.warn(`User with clerkId ${clerkId} does not exist, skipping delete.`);
        return { success: true, message: 'User already deleted or does not exist' };
      }
      console.error(`Error deleting user ${clerkId}:`, error);
      return { success: false, message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}

export default db;
