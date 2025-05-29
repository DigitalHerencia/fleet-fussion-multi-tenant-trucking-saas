'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { toast } from '@/hooks/use-toast'
import { onboardingSchema } from '@/validations/auth'
import { OnboardingData } from '@/types/auth'
import { OnboardingFormFields } from '@/components/onboarding/onboarding'
import { setClerkMetadata } from '@/lib/actions/onboarding-actions'
import { z } from 'zod'

type FormValues = z.infer<typeof onboardingSchema>

export function OnboardingForm() {
  const { user } = useUser()
  const { setActive } = useClerk()
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyDetails: {
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        dotNumber: '',
        mcNumber: '',
      },
      businessType: undefined,
      fleetSize: undefined,
      services: [],
      referralSource: undefined,
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'User session not found. Please sign in again.',
        variant: 'destructive',
      })
      return
    }

    const onboardingData: OnboardingData = {
      userId: user.id,
      companyName: values.companyDetails.name,
      orgName: values.companyDetails.name,
      orgSlug: values.companyDetails.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50),
      dotNumber: values.companyDetails.dotNumber ?? '',
      mcNumber: values.companyDetails.mcNumber ?? '',
      address: values.companyDetails.address,
      city: values.companyDetails.city,
      state: values.companyDetails.state,
      zip: values.companyDetails.zipCode,
      phone: values.companyDetails.phone,
      role: 'admin',
      onboardingComplete: true,
    }

    const result = await setClerkMetadata(onboardingData)
    console.log('Onboarding result:', result)
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error || 'Failed to complete onboarding',
        variant: 'destructive',
      })
      return
    }

    // Set Clerk active organization after org creation
    if (!result.organizationId) {
      toast({
        title: 'Error',
        description: 'No organizationId returned from onboarding. Please contact support.',
        variant: 'destructive',
      })
      return
    }
    await setActive({ organization: result.organizationId })

    toast({
      title: 'Success!',
      description: 'Welcome to FleetFusion! Your organization has been created.',
    })

    // Force full reload to sync Clerk session/org context
    window.location.href = `/${result.organizationId}/dashboard/${user.id}`
  }

  return (
    <div className="mt-12 mb-12 bg-neutral-900 p-4 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <OnboardingFormFields form={form} />
        <button
          type="submit"
          className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  )
}