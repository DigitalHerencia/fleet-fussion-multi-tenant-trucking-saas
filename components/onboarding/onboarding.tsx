import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { onboardingSchema } from '@/validations/auth'

type FormValues = z.infer<typeof onboardingSchema>

export function OnboardingFormFields({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="companyDetails.name" className="text-gray-200 text-sm font-medium">Company Name</Label>
        <Input
          id="companyDetails.name"
          {...form.register('companyDetails.name')}
          required
          className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {form.formState.errors.companyDetails?.name && (
          <span className="text-red-500 text-xs">{form.formState.errors.companyDetails.name.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyDetails.dotNumber" className="text-gray-200 text-sm font-medium">USDOT Number</Label>
        <Input
          id="companyDetails.dotNumber"
          {...form.register('companyDetails.dotNumber')}
          className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyDetails.mcNumber" className="text-gray-200 text-sm font-medium">MC Number</Label>
        <Input
          id="companyDetails.mcNumber"
          {...form.register('companyDetails.mcNumber')}
          className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyDetails.address" className="text-gray-200 text-sm font-medium">Address</Label>
        <Input
          id="companyDetails.address"
          {...form.register('companyDetails.address')}
          required
          className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyDetails.city" className="text-gray-200 text-sm font-medium">City</Label>
          <Input
            id="companyDetails.city"
            {...form.register('companyDetails.city')}
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyDetails.state" className="text-gray-200 text-sm font-medium">State</Label>
          <Input
            id="companyDetails.state"
            {...form.register('companyDetails.state')}
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyDetails.zipCode" className="text-gray-200 text-sm font-medium">ZIP</Label>
          <Input
            id="companyDetails.zipCode"
            {...form.register('companyDetails.zipCode')}
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyDetails.phone" className="text-gray-200 text-sm font-medium">Phone</Label>
        <Input
          id="companyDetails.phone"
          {...form.register('companyDetails.phone')}
          required
          className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Add additional fields for businessType, fleetSize, services, referralSource as needed */}
    </>
  )
}