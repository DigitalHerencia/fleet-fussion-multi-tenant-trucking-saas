"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserCompanies, setCurrentCompany } from "@/lib/actions/company-actions"
import type { Company } from "@/types/types"

type CompanyContextType = {
    currentCompany: Company | null
    companies: Company[]
    isLoading: boolean
    error: string | null
    setCompany: (companyId: string) => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null)
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function fetchUserCompanies() {
            try {
                setIsLoading(true)
                const result = await getUserCompanies()

                if (result.success && result.data) {
                    setCompanies(result.data.companies as unknown as Company[])
                    setCurrentCompanyState(result.data.currentCompany as unknown as Company | null)
                } else {
                    setError(result.error || "Failed to fetch companies")
                }
            } catch (err) {
                setError("An error occurred while fetching companies")
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUserCompanies()
    }, [])

    const setCompany = async (companyId: string) => {
        try {
            setIsLoading(true)
            const result = await setCurrentCompany(companyId)

            if (result.success) {
                const selectedCompany = companies.find(company => company.id === companyId)
                if (selectedCompany) {
                    setCurrentCompanyState(selectedCompany)
                    router.push("/dashboard")
                }
            } else {
                setError(result.error || "Failed to set company")
            }
        } catch (err) {
            setError("An error occurred while setting the company")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <CompanyContext.Provider
            value={{
                currentCompany,
                companies,
                isLoading,
                error,
                setCompany
            }}
        >
            {children}
        </CompanyContext.Provider>
    )
}

export const useCompany = () => {
    const context = useContext(CompanyContext)
    if (context === undefined) {
        throw new Error("useCompany must be used within a CompanyProvider")
    }
    return context
}
