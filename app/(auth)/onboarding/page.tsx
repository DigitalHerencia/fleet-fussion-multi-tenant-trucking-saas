/**
 * Onboarding Welcome Page
 * 
 * Initial onboarding step - user profile setup
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { OnboardingData } from '@/types/auth'
import { setClerkMetadata } from '@/lib/actions/onboarding'

// Utility to generate a base slug from company name
function toBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')  
  const [formData, setFormData] = useState<{
    companyName: string
    dotNumber: string
    mcNumber: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
  }>({
    companyName: '',
    dotNumber: '',
    mcNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    // Validation for required fields
    if (!formData.companyName.trim() || !formData.dotNumber.trim() || !formData.mcNumber.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zip.trim() || !formData.phone.trim()) {
      setErrorMessage("Please fill in all required fields.")
      toast({
        title: "Error", 
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }
    setIsLoading(true)
    try {
      if (!user) {
        setErrorMessage("User session not found. Please sign in again.")
        toast({
          title: "Error",
          description: "User session not found. Please sign in again.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      // Prepare onboarding data
      const baseSlug = toBaseSlug(formData.companyName);
      const onboardingData: OnboardingData = {
        userId: user.id,
        companyName: formData.companyName,
        orgName: formData.companyName, // Use company name for orgName
        orgSlug: baseSlug, // Pass base slug, server will ensure uniqueness
        dotNumber: formData.dotNumber,
        mcNumber: formData.mcNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        phone: formData.phone,
        role: 'admin', // Default to admin for onboarding
        onboardingComplete: true
      }
      // Call server action to handle onboarding
      const result = await setClerkMetadata(onboardingData)
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to complete onboarding')
        toast({
          title: "Error",
          description: result.error || 'Failed to complete onboarding',
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      setSuccessMessage("Welcome to FleetFusion! Your organization has been created.")
      toast({
        title: "Success!",
        description: "Welcome to FleetFusion! Your organization has been created.",
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Onboarding error:', error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (user && user.publicMetadata?.onboardingComplete) {
      router.replace('/dashboard');
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center space-x-2 mb-2">
            <Image
              src="/white_logo.png"
              alt="FleetFusion Logo"
              width={220}
              height={60}
              priority
            />
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            Welcome to FleetFusion
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Complete your profile and organization setup to get started.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-neutral-900 p-8 shadow-lg rounded-lg border border-neutral-800 space-y-6"
        >
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-gray-200 text-sm font-medium">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              required
              className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* DOT Number */}
          <div className="space-y-2">
            <Label htmlFor="dotNumber" className="text-gray-200 text-sm font-medium">USDOT Number</Label>
            <Input
              id="dotNumber"
              value={formData.dotNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, dotNumber: e.target.value }))}
              required
              className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* MC Number */}
          <div className="space-y-2">
            <Label htmlFor="mcNumber" className="text-gray-200 text-sm font-medium">MC Number</Label>
            <Input
              id="mcNumber"
              value={formData.mcNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, mcNumber: e.target.value }))}
              required
              className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-200 text-sm font-medium">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-gray-200 text-sm font-medium">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-gray-200 text-sm font-medium">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-gray-200 text-sm font-medium">ZIP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                required
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-200 text-sm font-medium">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="text-red-500 text-sm text-center">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="text-green-500 text-sm text-center">{successMessage}</div>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Submitting...
              </span>
            ) : (
              "Complete Onboarding"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
