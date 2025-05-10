"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useOrganizationList } from "@clerk/nextjs"
import { Loader2, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import Image from "next/image"
import { toast } from "sonner"

export default function OrgSelectionPage() {
    const router = useRouter()
    const { user, isLoaded: isUserLoaded } = useUser()
    const {
        userMemberships,
        isLoaded: isOrgLoaded,
        createOrganization,
        setActive
    } = useOrganizationList()
    const [isCreating, setIsCreating] = useState(false)

    // Show a loading state when checking for organizations
    if (!isUserLoaded || !isOrgLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // If there are no organizations, redirect to onboarding
    if (userMemberships.data.length === 0) {
        router.push("/onboarding")
        return null
    }

    const handleOrgSelect = async (orgId: string) => {
        try {
            // Set the active organization in Clerk
            await setActive({ organization: orgId })

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (error) {
            console.error("Error setting active organization:", error)
            toast.error("Failed to select organization. Please try again.")
        }
    }

    const handleCreateOrg = async () => {
        setIsCreating(true)
        try {
            router.push("/onboarding")
        } catch (error) {
            console.error("Error redirecting to create organization:", error)
            setIsCreating(false)
            toast.error("Failed to create new organization. Please try again.")
        }
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
                    Select Your Company
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.firstName || "there"}! Choose which company you want to
                    access.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="grid grid-cols-1 gap-4">
                    {userMemberships.data.map(({ organization }) => (
                        <Card
                            key={organization.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleOrgSelect(organization.id)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center">
                                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{organization.name}</CardTitle>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={e => {
                                        e.stopPropagation()
                                        handleOrgSelect(organization.id)
                                    }}
                                >
                                    Select
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {organization.membersCount} members
                                </p>
                            </CardContent>
                        </Card>
                    ))}

                    <Card
                        className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
                        onClick={handleCreateOrg}
                    >
                        <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2 pt-6">
                            <div className="flex flex-col items-center justify-center">
                                <Plus className="mb-2 h-6 w-6 text-primary" />
                                <CardTitle className="text-lg">Create New Company</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Set up a new trucking company in FleetFusion
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
