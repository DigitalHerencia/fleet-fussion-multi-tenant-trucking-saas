"use client";

import { useState } from "react";
import { useOrganization, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createCompany } from "@/lib/actions/company-actions";
import type { CreateCompanyFormValues } from "@/lib/actions/company-schemas";

export default function OnboardingPage() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isLoaded: authLoaded, userId } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyFormValues>({
    name: "",
    primaryColor: "#0f766e"
  });

  const isLoaded = orgLoaded && authLoaded;

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!userId) {
    router.push("/sign-in");
    return null;
  }

  const handleCreateOrganization = async () => {
    setIsCreatingOrg(true);
    try {
      await clerk.createOrganization({
        name: "My Fleet",
      });
      // After creating an organization, the page will reload with the new org context
    } catch (error) {
      console.error("Error creating organization:", error);
      setIsCreatingOrg(false);
    }
  };

  // If no organization exists yet, show the create organization UI
  if (!organization) {
    return (
      <div className="max-w-md mx-auto p-6 mt-16">
        <h1 className="text-2xl font-bold mb-4">Create Your Fleet Organization</h1>
        <p className="mb-6">
          Before setting up your company in FleetFusion, you need to create an organization to manage your fleet.
        </p>
        <button
          onClick={handleCreateOrganization}
          disabled={isCreatingOrg}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isCreatingOrg ? "Creating Organization..." : "Create Fleet Organization"}
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createCompany({
        ...formData,
        // Ensure we use the organization name as default if no name is provided
        name: formData.name || organization.name || "My Company",
      });

      if (result.success) {
        router.push("/dashboard");
      } else {
        console.error("Error creating company:", result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error in onboarding:", error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: CreateCompanyFormValues) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="max-w-xl mx-auto p-6 mt-10">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to FleetFusion!</h1>
        <p className="mb-6">
          Let's create your company profile so you can start managing your fleet.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Company Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder={organization.name || "My Company"}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="dotNumber">
              DOT Number
            </label>
            <input
              id="dotNumber"
              name="dotNumber"
              type="text"
              value={formData.dotNumber || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="mcNumber">
              MC Number
            </label>
            <input
              id="mcNumber"
              name="mcNumber"
              type="text"
              value={formData.mcNumber || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="primaryColor">
              Brand Color
            </label>
            <input
              id="primaryColor"
              name="primaryColor"
              type="color"
              value={formData.primaryColor}
              onChange={handleChange}
              className="w-full h-10 border rounded p-1"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Company"}
          </button>
        </form>
      </div>
    </main>
  );
}