/**
 * Database Seed Script
 * 
 * Seeds the database with initial data for FleetFusion TMS
 * This includes sample organizations, users, vehicles, and compliance data
 */

import { db } from '@/lib/database'
import * as schema from '@/lib/database/schema'
import { UserRole } from '@/types/auth'

interface SeedOrganization {
  clerkId: string
  name: string
  slug: string
  metadata: any
}

interface SeedUser {
  clerkId: string
  organizationClerkId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: string[]
  isActive: boolean
  onboardingCompleted: boolean
}

interface SeedVehicle {
  organizationClerkId: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  vehicleType: string
  status: string
}

interface SeedDriver {
  organizationClerkId: string
  userClerkId?: string
  licenseNumber: string
  licenseClass: string
  licenseState: string
  licenseExpiry: Date
  medicalCertExpiry: Date
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
}

/**
 * Sample data for seeding
 */
const sampleOrganizations: SeedOrganization[] = [
  {
    clerkId: 'org_sample_cj_express',
    name: 'C & J Express Inc.',
    slug: 'cj-express',
    metadata: {
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
      maxUsers: 25,
      dotNumber: '1565942',
      mcNumber: '580454',
      address: '710 Eagle Dr',
      city: 'Anthony',
      state: 'NM',
      zip: '88021',
      phone: '575-555-0123',
      billingEmail: 'billing@cjexpress.com',
      features: ['dispatch', 'ifta', 'compliance', 'analytics'],
      settings: {
        timezone: 'America/Denver',
        dateFormat: 'MM/dd/yyyy',
        distanceUnit: 'miles',
        fuelUnit: 'gallons'
      }
    }
  },
  {
    clerkId: 'org_sample_southwest_logistics',
    name: 'Southwest Logistics LLC',
    slug: 'southwest-logistics',
    metadata: {
      subscriptionTier: 'free',
      subscriptionStatus: 'trial',
      maxUsers: 5,
      dotNumber: '2567891',
      mcNumber: '789012',
      address: '450 Commerce Way',
      city: 'Las Cruces',
      state: 'NM',
      zip: '88001',
      phone: '575-555-0456',
      billingEmail: 'admin@swlogistics.com',
      features: ['dispatch'],
      settings: {
        timezone: 'America/Denver',
        dateFormat: 'MM/dd/yyyy',
        distanceUnit: 'miles',
        fuelUnit: 'gallons'
      }
    }
  }
]

const sampleUsers: SeedUser[] = [
  {
    clerkId: 'user_sample_admin_cj',
    organizationClerkId: 'org_sample_cj_express',
    email: 'admin@cjexpress.com',
    firstName: 'Carlos',
    lastName: 'Martinez',
    role: 'admin',
    permissions: ['fleet:read', 'fleet:write', 'fleet:delete', 'dispatch:read', 'dispatch:write', 'compliance:read', 'compliance:write', 'analytics:read', 'ifta:read', 'ifta:write', 'settings:read', 'settings:write'],
    isActive: true,
    onboardingCompleted: true
  },
  {
    clerkId: 'user_sample_dispatcher_cj',
    organizationClerkId: 'org_sample_cj_express',
    email: 'dispatch@cjexpress.com',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    role: 'dispatcher',
    permissions: ['fleet:read', 'dispatch:read', 'dispatch:write', 'analytics:read'],
    isActive: true,
    onboardingCompleted: true
  },
  {
    clerkId: 'user_sample_driver_cj',
    organizationClerkId: 'org_sample_cj_express',
    email: 'driver1@cjexpress.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'driver',
    permissions: ['fleet:read'],
    isActive: true,
    onboardingCompleted: true
  }
]

const sampleVehicles: SeedVehicle[] = [
  {
    organizationClerkId: 'org_sample_cj_express',
    vin: '1FUJGBDV0CLBP1234',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    licensePlate: 'NM-TRK-001',
    vehicleType: 'tractor',
    status: 'active'
  },
  {
    organizationClerkId: 'org_sample_cj_express',
    vin: '1M2AA18C4XW123456',
    make: 'Great Dane',
    model: 'Everest',
    year: 2021,
    licensePlate: 'NM-TRL-001',
    vehicleType: 'trailer',
    status: 'active'
  }
]

const sampleDrivers: SeedDriver[] = [
  {
    organizationClerkId: 'org_sample_cj_express',
    userClerkId: 'user_sample_driver_cj',
    licenseNumber: 'CDL123456789',
    licenseClass: 'CDL-A',
    licenseState: 'NM',
    licenseExpiry: new Date('2025-12-31'),
    medicalCertExpiry: new Date('2025-06-30'),
    firstName: 'James',
    lastName: 'Wilson',
    email: 'driver1@cjexpress.com',
    phone: '575-555-0789',
    status: 'active'
  }
]

/**
 * Seed organizations
 */
async function seedOrganizations() {
  console.log('Seeding organizations...')
  
  for (const org of sampleOrganizations) {
    try {
      await db.insert(schema.organizations).values({
        clerkId: org.clerkId,
        name: org.name,
        slug: org.slug,
        metadata: org.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing()
      
      console.log(`✓ Seeded organization: ${org.name}`)
    } catch (error) {
      console.error(`✗ Error seeding organization ${org.name}:`, error)
    }
  }
}

/**
 * Seed users
 */
async function seedUsers() {
  console.log('Seeding users...')
  
  for (const user of sampleUsers) {
    try {
      // Get organization by clerk ID
      const [organization] = await db
        .select()
        .from(schema.organizations)
        .where(schema.organizations.clerkId.eq(user.organizationClerkId))
        .limit(1)
      
      if (!organization) {
        console.error(`✗ Organization not found for user: ${user.email}`)
        continue
      }
      
      await db.insert(schema.users).values({
        clerkId: user.clerkId,
        organizationId: organization.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing()
      
      console.log(`✓ Seeded user: ${user.email}`)
    } catch (error) {
      console.error(`✗ Error seeding user ${user.email}:`, error)
    }
  }
}

/**
 * Seed vehicles
 */
async function seedVehicles() {
  console.log('Seeding vehicles...')
  
  for (const vehicle of sampleVehicles) {
    try {
      // Get organization by clerk ID
      const [organization] = await db
        .select()
        .from(schema.organizations)
        .where(schema.organizations.clerkId.eq(vehicle.organizationClerkId))
        .limit(1)
      
      if (!organization) {
        console.error(`✗ Organization not found for vehicle: ${vehicle.vin}`)
        continue
      }
      
      await db.insert(schema.vehicles).values({
        organizationId: organization.id,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType as any,
        status: vehicle.status as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing()
      
      console.log(`✓ Seeded vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.vin})`)
    } catch (error) {
      console.error(`✗ Error seeding vehicle ${vehicle.vin}:`, error)
    }
  }
}

/**
 * Seed drivers
 */
async function seedDrivers() {
  console.log('Seeding drivers...')
  
  for (const driver of sampleDrivers) {
    try {
      // Get organization by clerk ID
      const [organization] = await db
        .select()
        .from(schema.organizations)
        .where(schema.organizations.clerkId.eq(driver.organizationClerkId))
        .limit(1)
      
      if (!organization) {
        console.error(`✗ Organization not found for driver: ${driver.email}`)
        continue
      }
      
      // Get user by clerk ID if provided
      let userId = null
      if (driver.userClerkId) {
        const [user] = await db
          .select()
          .from(schema.users)
          .where(schema.users.clerkId.eq(driver.userClerkId))
          .limit(1)
        
        userId = user?.id || null
      }
      
      await db.insert(schema.drivers).values({
        organizationId: organization.id,
        userId: userId,
        licenseNumber: driver.licenseNumber,
        licenseClass: driver.licenseClass,
        licenseState: driver.licenseState,
        licenseExpiry: driver.licenseExpiry,
        medicalCertExpiry: driver.medicalCertExpiry,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phone: driver.phone,
        status: driver.status as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }).onConflictDoNothing()
      
      console.log(`✓ Seeded driver: ${driver.firstName} ${driver.lastName}`)
    } catch (error) {
      console.error(`✗ Error seeding driver ${driver.email}:`, error)
    }
  }
}

/**
 * Main seed function
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')
    
    await seedOrganizations()
    await seedUsers()
    await seedVehicles()
    await seedDrivers()
    
    console.log('🎉 Database seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Database seed failed:', error)
    throw error
  }
}

/**
 * Run seed if called directly
 */
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
