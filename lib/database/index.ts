/**
 * Database Connection Configuration
 * 
 * Neon PostgreSQL connection with Drizzle ORM
 * Includes connection pooling and proper error handling
 */

import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const sql = neon(process.env.DATABASE_URL!)

// Create the database instance with schema
export const db = drizzle(sql, { schema })

// Export types
export type Database = typeof db
export * from './schema'

// Utility function to handle database errors
export function handleDatabaseError(error: any): never {
  console.error('Database error:', error)
  
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        throw new Error('Record already exists')
      case '23503': // Foreign key violation
        throw new Error('Referenced record does not exist')
      case '23502': // Not null violation
        throw new Error('Required field is missing')
      case '42P01': // Undefined table
        throw new Error('Database table does not exist')
      default:
        throw new Error(`Database error: ${error.message}`)
    }
  }
  
  throw new Error('Unknown database error occurred')
}

// Type-safe database queries helper
export class DatabaseQueries {
  /**
   * Get organization by Clerk ID
   */
  static async getOrganizationByClerkId(clerkId: string) {
    try {
      const [organization] = await db
        .select()
        .from(schema.organizations)
        .where(schema.organizations.clerkId.eq(clerkId))
        .limit(1)
      
      return organization || null
    } catch (error) {
      handleDatabaseError(error)
    }
  }
  
  /**
   * Get user by Clerk ID
   */
  static async getUserByClerkId(clerkId: string) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(schema.users.clerkId.eq(clerkId))
        .limit(1)
      
      return user || null
    } catch (error) {
      handleDatabaseError(error)
    }
  }
  
  /**
   * Create or update organization from Clerk webhook
   */
  static async upsertOrganization(data: {
    clerkId: string
    name: string
    slug: string
    metadata?: any
  }) {
    try {
      const existingOrg = await this.getOrganizationByClerkId(data.clerkId)
      
      if (existingOrg) {
        // Update existing organization
        const [updated] = await db
          .update(schema.organizations)
          .set({
            name: data.name,
            slug: data.slug,
            ...(data.metadata && {
              subscriptionTier: data.metadata.subscriptionTier,
              subscriptionStatus: data.metadata.subscriptionStatus,
              maxUsers: data.metadata.maxUsers,
              billingEmail: data.metadata.billingEmail,
              settings: data.metadata.settings,
            }),
            updatedAt: new Date(),
          })
          .where(schema.organizations.clerkId.eq(data.clerkId))
          .returning()
        
        return updated
      } else {
        // Create new organization
        const [created] = await db
          .insert(schema.organizations)
          .values({
            clerkId: data.clerkId,
            name: data.name,
            slug: data.slug,
            ...(data.metadata && {
              subscriptionTier: data.metadata.subscriptionTier || 'free',
              subscriptionStatus: data.metadata.subscriptionStatus || 'trial',
              maxUsers: data.metadata.maxUsers || 5,
              billingEmail: data.metadata.billingEmail,
              settings: data.metadata.settings,
            }),
          })
          .returning()
        
        return created
      }
    } catch (error) {
      handleDatabaseError(error)
    }
  }
  
  /**
   * Create or update user from Clerk webhook
   */
  static async upsertUser(data: {
    clerkId: string
    organizationId: string
    email: string
    firstName?: string
    lastName?: string
    profileImage?: string
    role?: string
    permissions?: string[]
    isActive?: boolean
    onboardingCompleted?: boolean
  }) {
    try {
      const existingUser = await this.getUserByClerkId(data.clerkId)
      
      if (existingUser) {
        // Update existing user
        const [updated] = await db
          .update(schema.users)
          .set({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
            ...(data.role && { role: data.role as any }),
            ...(data.permissions && { permissions: data.permissions }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            ...(data.onboardingCompleted !== undefined && { 
              onboardingCompleted: data.onboardingCompleted 
            }),
            updatedAt: new Date(),
          })
          .where(schema.users.clerkId.eq(data.clerkId))
          .returning()
        
        return updated
      } else {
        // Create new user
        const [created] = await db
          .insert(schema.users)
          .values({
            clerkId: data.clerkId,
            organizationId: data.organizationId,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            profileImage: data.profileImage,
            role: (data.role as any) || 'viewer',
            permissions: data.permissions || [],
            isActive: data.isActive ?? true,
            onboardingCompleted: data.onboardingCompleted ?? false,
          })
          .returning()
        
        return created
      }
    } catch (error) {
      handleDatabaseError(error)
    }
  }
  
  /**
   * Delete organization
   */
  static async deleteOrganization(clerkId: string) {
    try {
      await db
        .delete(schema.organizations)
        .where(schema.organizations.clerkId.eq(clerkId))
    } catch (error) {
      handleDatabaseError(error)
    }
  }
  
  /**
   * Delete user
   */
  static async deleteUser(clerkId: string) {
    try {
      await db
        .delete(schema.users)
        .where(schema.users.clerkId.eq(clerkId))
    } catch (error) {
      handleDatabaseError(error)
    }
  }
}

export default db
