"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createCompany } from "@/lib/actions/company-actions"
import type { CreateCompanyFormValues } from "@/lib/actions/company-actions"
import { Loader2, Building2, Truck, Palette } from "lucide-react"

export default function OnboardingPage() {
    const { isLoaded: authLoaded, userId } = useAuth()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<CreateCompanyFormValues>({
        name: "",
        dotNumber: "",
        mcNumber: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        primaryColor: "#4ea5ff"
    })

    if (!authLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // If user is not logged in, redirect to login
    if (!userId) {
        router.push("/sign-in")
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await createCompany({
                ...formData,
                // Ensure name is not empty
                name: formData.name || "My Company"
            })

            if (result.success) {
                router.push("/dashboard")
            } else {
                console.error("Error creating company:", result.error)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error("Error in onboarding:", error)
            setIsSubmitting(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: CreateCompanyFormValues) => ({ ...prev, [name]: value }))
    }

    return (
        <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="flex justify-center">
                    <Image
                        src="/map-pinned.png"
                        alt="FleetFusion Logo"
                        width={64}
                        height={64}
                        className="mx-auto"
                    />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Set Up Your FleetFusion Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Tell us about your transportation company so we can customize your experience
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                                <Building2 className="h-5 w-5 mr-2 text-primary" />
                                Company Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Company Name*
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="My Company"
                                        required
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="dotNumber"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        DOT Number
                                    </label>
                                    <input
                                        id="dotNumber"
                                        name="dotNumber"
                                        type="text"
                                        value={formData.dotNumber || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="mcNumber"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        MC Number
                                    </label>
                                    <input
                                        id="mcNumber"
                                        name="mcNumber"
                                        type="text"
                                        value={formData.mcNumber || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                                <Truck className="h-5 w-5 mr-2 text-primary" />
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label
                                        htmlFor="address"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Street Address
                                    </label>
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        value={formData.address || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="city"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={formData.city || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            State
                                        </label>
                                        <select
                                            id="state"
                                            name="state"
                                            value={formData.state || ""}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select...</option>
                                            <option value="AL">Alabama</option>
                                            <option value="AK">Alaska</option>
                                            {/* Add all 50 states */}
                                            <option value="CA">California</option>
                                            <option value="FL">Florida</option>
                                            <option value="TX">Texas</option>
                                            <option value="NY">New York</option>
                                            {/* Add more states as needed */}
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="zip"
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            ZIP Code
                                        </label>
                                        <input
                                            id="zip"
                                            name="zip"
                                            type="text"
                                            value={formData.zip || ""}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                                <Palette className="h-5 w-5 mr-2 text-primary" />
                                Brand Customization
                            </h3>

                            <div>
                                <label
                                    htmlFor="primaryColor"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                    Brand Color
                                </label>
                                <div className="flex items-center">
                                    <input
                                        id="primaryColor"
                                        name="primaryColor"
                                        type="color"
                                        value={formData.primaryColor}
                                        onChange={handleChange}
                                        className="h-10 w-20 border rounded p-1"
                                    />
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                        This color will be used throughout your dashboard
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating Your Account...
                                    </>
                                ) : (
                                    "Complete Setup & Go to Dashboard"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} FleetFusion. Enterprise-grade fleet
                    management.
                </p>
            </div>
        </div>
    )
}
