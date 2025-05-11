"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompanySettingsPage() {
    const { companyId } = useParams() as { companyId: string }
    const [company, setCompany] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        dotNumber: "",
        mcNumber: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        email: "",
        primaryColor: "#0f766e"
    })

    useEffect(() => {
        async function fetchCompanyData() {
            try {
                const res = await fetch(`/api/companies/${companyId}`)
                if (!res.ok) throw new Error("Failed to fetch company")
                const data = await res.json()
                setCompany(data)

                // Populate form with company data
                setFormData({
                    name: data.name || "",
                    dotNumber: data.dotNumber || "",
                    mcNumber: data.mcNumber || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    zip: data.zip || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    primaryColor: data.primaryColor || "#0f766e"
                })
            } catch (error) {
                console.error("Error fetching company:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (companyId) {
            fetchCompanyData()
        }
    }, [companyId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // In a real app, you would submit changes to your API
        alert("Settings would be saved in a real app")
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!company) {
        return <div>Company not found. Please check the URL or select a different company.</div>
    }

    return (
        <DashboardShell>
            <DashboardHeader
                text="Manage your company information and preferences"
                heading={company.name}
            />

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Company Information</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dotNumber">DOT Number</Label>
                            <Input
                                id="dotNumber"
                                name="dotNumber"
                                value={formData.dotNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mcNumber">MC Number</Label>
                            <Input
                                id="mcNumber"
                                name="mcNumber"
                                value={formData.mcNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Brand Color</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="primaryColor"
                                    name="primaryColor"
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 p-1"
                                />
                                <span>{formData.primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input
                                id="zip"
                                name="zip"
                                value={formData.zip}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <Button type="submit">Save Changes</Button>
            </form>
        </DashboardShell>
    )
}
