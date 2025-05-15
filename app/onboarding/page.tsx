"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "../../lib/actions/onboarding-actions";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await completeOnboarding(formData);
      if (res?.success) {
        await user?.reload();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const companyId = res.companyId || (user?.publicMetadata && (user.publicMetadata as any).orgId) || (user?.publicMetadata && (user.publicMetadata as any).companyId);
        if (companyId) {
          router.push(`/dashboard/${companyId}`);
        } else if (user?.publicMetadata && (user.publicMetadata as any).onboardingComplete === true) {
          router.push("/dashboard");
        } else {
          window.location.href = "/dashboard";
        }
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
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
        <form
          action={handleSubmit}
          className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
        >
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
          <label className="text-gray-200 text-sm font-medium" htmlFor="dotNumber">
            DOT Number
          </label>
          <input
            id="dotNumber"
            name="dotNumber"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-gray-200 text-sm font-medium" htmlFor="mcNumber">
            MC Number
          </label>
          <input
            id="mcNumber"
            name="mcNumber"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-gray-200 text-sm font-medium" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <label className="text-gray-200 text-sm font-medium" htmlFor="phone">
            Company Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-gray-200 text-sm font-medium" htmlFor="email">
            Company Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
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
