'use server'

import { clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { OnboardingData } from '@/types/auth'

/**
 * Server action to handle onboarding
 * ONLY creates organization in Clerk and adds user as admin
 * Database sync is handled by webhooks
 */
export async function setClerkMetadata(data: OnboardingData) {
  console.log('🚀 Starting onboarding process for user:', data.userId)
  console.log('📋 Onboarding data:', {
    companyName: data.companyName,
    orgSlug: data.orgSlug,
    dotNumber: data.dotNumber,
    mcNumber: data.mcNumber
  })

  try {    // Generate unique slug if needed
    let finalSlug = data.orgSlug
    let slugAttempts = 0
    const maxSlugAttempts = 5

    while (slugAttempts < maxSlugAttempts) {
      try {
        // Get Clerk client instance
        const clerk = await clerkClient()
        
        // Try to create organization with current slug
        const organization = await clerk.organizations.createOrganization({
          name: data.companyName,
          slug: finalSlug,          publicMetadata: {
            // Business information for database sync via webhooks
            dotNumber: data.dotNumber,
            mcNumber: data.mcNumber,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone,
            billingEmail: '', // Will be set from user's email during webhook
            maxUsers: 5,
            subscriptionTier: 'free',
            subscriptionStatus: 'active',
            features: [],
            settings: {
              timezone: 'UTC',
              dateFormat: 'MM/DD/YYYY',
              distanceUnit: 'miles',
              fuelUnit: 'gallons'
            }
          }
        })

        console.log('✅ Organization created in Clerk:', {
          id: organization.id,
          name: organization.name,
          slug: organization.slug
        })        // Add user to organization as admin
        await clerk.organizations.createOrganizationMembership({
          organizationId: organization.id,
          userId: data.userId,
          role: 'admin'
        })

        console.log('✅ User added to organization as admin:', {
          userId: data.userId,
          organizationId: organization.id,
          role: 'admin'
        })

        // Update user metadata to mark onboarding complete
        await clerk.users.updateUserMetadata(data.userId, {
          publicMetadata: {
            onboardingComplete: true,
            organizationId: organization.id,
            role: 'admin'
          }
        })

        console.log('✅ User metadata updated:', {
          userId: data.userId,
          onboardingComplete: true,
          organizationId: organization.id
        })

        // Return success with organization ID for client-side redirect
        return {
          success: true,
          organizationId: organization.id,
          message: 'Onboarding completed successfully'
        }

      } catch (error: any) {
        // Handle slug conflicts
        if (error.errors?.[0]?.code === 'form_slug_exists' || 
            error.message?.includes('slug') ||
            error.message?.includes('already exists')) {
          
          slugAttempts++
          finalSlug = `${data.orgSlug}-${slugAttempts}`
          console.log(`⚠️ Slug conflict, trying: ${finalSlug} (attempt ${slugAttempts})`)
          continue
        }
        
        // Handle other errors
        console.error('❌ Error in onboarding process:', error)
        return {
          success: false,
          error: error.message || 'Failed to complete onboarding'
        }
      }
    }

    // If we exhausted slug attempts
    return {
      success: false,
      error: 'Unable to create organization - slug conflicts exceeded maximum retries'
    }

  } catch (error: any) {
    console.error('❌ Onboarding failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to complete onboarding'
    }
  }
}