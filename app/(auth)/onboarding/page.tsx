/**
 * Onboarding Welcome Page
 *
 * Initial onboarding step - user profile setup
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Loader2, MapPinned } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { OnboardingData } from '@/types/auth';
import { setClerkMetadata } from '@/lib/actions/onboardingActions';

// Utility to generate a base slug from company name
function toBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<{
    companyName: string;
    dotNumber: string;
    mcNumber: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  }>({
    companyName: '',
    dotNumber: '',
    mcNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📋 Current form data:', formData);

    setErrorMessage('');
    setSuccessMessage('');

    // Validation for required fields
    const requiredFields = {
      companyName: formData.companyName.trim(),
      dotNumber: formData.dotNumber.trim(),
      mcNumber: formData.mcNumber.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      phone: formData.phone.trim(),
    };

    console.log('🔍 Validation check:', requiredFields);

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      setErrorMessage(
        `Please fill in all required fields: ${missingFields.join(', ')}`
      );
      toast({
        title: 'Error',
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with submission');
    setIsLoading(true);
    try {
      if (!user) {
        setErrorMessage('User session not found. Please sign in again.');
        toast({
          title: 'Error',
          description: 'User session not found. Please sign in again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Prepare onboarding data with better validation
      const baseSlug = toBaseSlug(formData.companyName);
      console.log('🚀 Preparing onboarding data:', {
        companyName: formData.companyName,
        baseSlug,
        dotNumber: formData.dotNumber,
        mcNumber: formData.mcNumber,
        userId: user.id,
      });

      const onboardingData: OnboardingData = {
        userId: user.id,
        companyName: formData.companyName.trim(), // Ensure no whitespace issues
        orgName: formData.companyName.trim(), // Use company name for orgName
        orgSlug: baseSlug, // Pass base slug, server will ensure uniqueness
        dotNumber: formData.dotNumber.trim(),
        mcNumber: formData.mcNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip: formData.zip.trim(),
        phone: formData.phone.trim(),
        role: 'admin', // Default to admin for onboarding
        onboardingComplete: true,
      };

      console.log('📤 Sending onboarding data to server:', onboardingData);

      // Call server action to handle onboarding
      const result = await setClerkMetadata(onboardingData);

      console.log('📦 Server action result:', result);

      if (!result.success) {
        console.error('❌ Onboarding failed:', result.error);
        setErrorMessage(result.error || 'Failed to complete onboarding');
        toast({
          title: 'Error',
          description: result.error || 'Failed to complete onboarding',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Check if we got an organizationId back from the server action
      if (!result.organizationId) {
        console.error('❌ No organization ID in result:', result);
        setErrorMessage('Organization was not created properly');
        toast({
          title: 'Error',
          description: 'Organization was not created properly',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Onboarding completed successfully:', {
        organizationId: result.organizationId,
        companyName: formData.companyName,
      });

      setSuccessMessage(
        'Welcome to FleetFusion! Your organization has been created.'
      );
      toast({
        title: 'Success!',
        description:
          'Welcome to FleetFusion! Your organization has been created.',
      });

      // Active redirect to the proper dynamic dashboard route with orgId and userId
      router.push(`/${result.organizationId}/dashboard/${user.id}`);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to complete onboarding. Please try again.'
      );
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // If onboardingComplete, redirect to dashboard
    if (user && user.publicMetadata?.onboardingComplete) {
      const organizationId = user.publicMetadata?.organizationId as
        | string
        | undefined;
      const userId = user.id;
      if (organizationId && userId) {
        router.replace(`/${organizationId}/dashboard/${userId}`);
      } else {
        router.replace('/');
      }
    }
  }, [user, router]);

  // Loading state: wait for Clerk to finish loading
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }
  // If not signed in, show message (middleware should redirect, but this is a fallback)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-xl text-white">
          You must be signed in to complete onboarding.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-1 items-center">
            <Link
              className="flex items-center justify-center underline-offset-4 hover:text-blue-500 hover:underline"
              href="/"
            >
              <MapPinned className="mr-1 h-6 w-6 text-blue-500" />
              <span className="text-2xl font-extrabold text-white dark:text-white">
                FleetFusion
              </span>
            </Link>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            WELCOME TO FLEETFUSION
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Complete your profile and organization setup to get started.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-lg border border-neutral-800 bg-neutral-900 p-8 shadow-lg"
        >
          {/* Company Name */}
          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className="text-sm font-medium text-gray-200"
            >
              Company Name
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={e =>
                setFormData(prev => ({ ...prev, companyName: e.target.value }))
              }
              required
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* DOT Number */}
          <div className="space-y-2">
            <Label
              htmlFor="dotNumber"
              className="text-sm font-medium text-gray-200"
            >
              USDOT Number
            </Label>
            <Input
              id="dotNumber"
              value={formData.dotNumber}
              onChange={e =>
                setFormData(prev => ({ ...prev, dotNumber: e.target.value }))
              }
              required
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* MC Number */}
          <div className="space-y-2">
            <Label
              htmlFor="mcNumber"
              className="text-sm font-medium text-gray-200"
            >
              MC Number
            </Label>
            <Input
              id="mcNumber"
              value={formData.mcNumber}
              onChange={e =>
                setFormData(prev => ({ ...prev, mcNumber: e.target.value }))
              }
              required
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-gray-200"
            >
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e =>
                setFormData(prev => ({ ...prev, address: e.target.value }))
              }
              required
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-200"
              >
                City
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={e =>
                  setFormData(prev => ({ ...prev, city: e.target.value }))
                }
                required
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-gray-200"
              >
                State
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={e =>
                  setFormData(prev => ({ ...prev, state: e.target.value }))
                }
                required
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="zip"
                className="text-sm font-medium text-gray-200"
              >
                ZIP
              </Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={e =>
                  setFormData(prev => ({ ...prev, zip: e.target.value }))
                }
                required
                className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          {/* Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-200"
            >
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e =>
                setFormData(prev => ({ ...prev, phone: e.target.value }))
              }
              required
              className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="text-center text-sm text-red-500">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-center text-sm text-green-500">
              {successMessage}
            </div>
          )}
          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Complete Onboarding'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
