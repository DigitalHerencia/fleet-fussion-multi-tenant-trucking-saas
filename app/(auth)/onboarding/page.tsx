"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "../../../lib/actions/onboarding-actions";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Onboarding Component
export default function OnboardingComponent() {
  // State variables
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    // Start submission process
    setLoading(true);
    setError("");
    try {
      // Call the completeOnboarding action
      const res = await completeOnboarding(formData);
      // If onboarding is successful
      if (res?.success) {
        await user?.reload(); // It's good practice to reload user data from Clerk

        const dbCompanyId = res.companyId; // This MUST be your internal database company ID
        const clerkUserId = res.clerkId;   // This is the Clerk user ID

        if (dbCompanyId && clerkUserId) {
          router.push(`/${dbCompanyId}/dashboard/${clerkUserId}`);
        } else {
          // This case means onboarding was "successful" according to the action,
          // but we didn't get the necessary IDs to redirect.
          // This is a critical failure in the data flow post-onboarding.
          setError("Onboarding completed, but there was an issue preparing your dashboard. Please try logging out and back in, or contact support.");
          // Consider redirecting to org-selection or a generic error page.
          // router.push("/org-selection"); // Example fallback
        }
      } else if (res?.error) {
        // Set error message if onboarding fails
        setError(res.error);
      }
    } catch  {
      // Set a generic error message
      setError("An unexpected error occurred. Please try again.");
    } finally {
      // End submission process
      setLoading(false);
    }
  };

  // Render the onboarding form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/white.png"
            alt="FleetFusion Logo"
            width={220}
            height={60}
            priority
          />
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            Company Onboarding
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your company details to get started with FleetFusion.
          </p>
        </div>
        {/* Onboarding Form */}
        <form
          action={handleSubmit}
          className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
        >
          {/* Company Name */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="companyName">
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* DOT Number */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="dotNumber">
            DOT Number
          </label>
          <input
            id="dotNumber"
            name="dotNumber"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* MC Number */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="mcNumber">
            MC Number
          </label>
          <input
            id="mcNumber"
            name="mcNumber"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Address */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* City, State, ZIP */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-gray-200 text-sm font-medium" htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="w-20">
              <label className="text-gray-200 text-sm font-medium" htmlFor="state">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="w-28">
              <label className="text-gray-200 text-sm font-medium" htmlFor="zip">
                ZIP
              </label>
              <input
                id="zip"
                name="zip"
                type="text"
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
          {/* Company Phone */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="phone">
            Company Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Company Email */}
          <label className="text-gray-200 text-sm font-medium" htmlFor="email">
            Company Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Error Message */}
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          {/* Submit Button */}
          <Button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Complete Onboarding"}
          </Button>
        </form>
      </div>
    </div>
  );
}
