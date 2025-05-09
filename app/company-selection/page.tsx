"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { getUserCompanies, setCurrentCompany, createCompany } from "@/lib/actions/company-actions"
import type { Company } from "@/types/types"
import { Loader2, Building2, PlusCircle } from "lucide-react"

export default function CompanySelectionPage() {
    const { isSignedIn, user } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [companies, setCompanies] = useState<Company[]>([])
    const [error, setError] = useState<string | null>(null)
    const [newCompanyName, setNewCompanyName] = useState("")

    // Fetch companies on component mount
    useEffect(() => {
        async function loadCompanies() {
            if (!user?.id) return

            try {
                const result = await getUserCompanies()
                if (result.success && result.data) {
                    // Cast the result to the Company type
                    setCompanies(result.data.companies as unknown as Company[])

                    // If there's already a selected company and only one company exists, redirect to dashboard
                    if (result.data.currentCompany && result.data.companies.length === 1) {
                        router.push("/dashboard")
                        return
                    }
                } else {
                    setError(result.error || "Failed to load companies")
                }
            } catch (err) {
                setError("An error occurred while fetching companies")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        if (user?.id) {
            loadCompanies()
        } else {
            setIsLoading(false)
        }
    }, [user?.id, router])

    // Handle company selection
    const handleSelectCompany = async (companyId: string) => {
        try {
            setIsLoading(true)
            const result = await setCurrentCompany(companyId)

            if (result.success) {
                // Store the selected company in cookies/localStorage
                document.cookie = `selectedCompany=${companyId};path=/;max-age=31536000`;
                localStorage.setItem('selectedCompanyId', companyId);
                
                router.push("/dashboard")
            } else {
                setError(result.error || "Failed to select company")
                setIsLoading(false)
            }
        } catch (err) {
            setError("An error occurred")
            console.error(err)
            setIsLoading(false)
        }
    }

    // Handle company creation
    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newCompanyName.trim()) {
            setError("Company name is required")
            return
        }

        try {
            setIsCreating(true)
            const result = await createCompany({ name: newCompanyName })

            if (result.success) {
                router.push("/dashboard")
            } else {
                setError(result.error || "Failed to create company")
                setIsCreating(false)
            }
        } catch (err) {
            setError("An error occurred while creating the company")
            console.error(err)
            setIsCreating(false)
        }
    }

    // Redirect to sign-in if not authenticated
    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            router.push("/sign-in")
        }
    }, [isLoading, isSignedIn, router])

    if (isLoading || !isSignedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-lg">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/map-pinned.png"
                        alt="FleetFusion Logo"
                        width={64}
                        height={64}
                        className="mx-auto"
                    />
                </div>

                <h1 className="text-2xl font-bold text-center mb-6">Select Your Company</h1>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : showCreateForm ? (
                    <form onSubmit={handleCreateCompany} className="space-y-4">
                        <div>
                            <label
                                htmlFor="companyName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Company Name
                            </label>
                            <input
                                id="companyName"
                                type="text"
                                value={newCompanyName}
                                onChange={e => setNewCompanyName(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                placeholder="Enter company name"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded font-medium transition-colors disabled:opacity-50"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Create Company
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {companies.length > 0 ? (
                            <div className="space-y-3">
                                {companies.map(company => (
                                    <button
                                        key={company.id}
                                        onClick={() => handleSelectCompany(company.id)}
                                        className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex items-center">
                                            <div
                                                className="w-10 h-10 rounded-md flex items-center justify-center text-white"
                                                style={{
                                                    backgroundColor:
                                                        company.primaryColor || "#0f766e"
                                                }}
                                            >
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div className="ml-3 text-left">
                                                <p className="font-medium">{company.name}</p>
                                                {company.dotNumber && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        DOT: {company.dotNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                                <p>You don't belong to any companies yet.</p>
                                <p>Create your first company to get started.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full mt-5 flex justify-center items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded font-medium transition-colors"
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Create New Company
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
