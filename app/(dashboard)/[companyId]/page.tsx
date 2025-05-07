// Server Component example using auth() helper
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserRoleInCompany } from "@/lib/auth"
import { UserRole } from "@/db/schema"

export default async function DashboardPage({ params }: { params: { companyId: string } }) {
    const { userId } = await auth()

    // If not authenticated, redirect to sign-in
    if (!userId) {
        redirect("/sign-in")
    }

    try {
        // Verify user has access to this company and get their role
        const companyId = parseInt(params.companyId, 10)
        const userRole = await getUserRoleInCompany(userId, companyId)

        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                    <p className="mb-2">
                        <span className="font-medium">Company ID:</span> {params.companyId}
                    </p>
                    <p className="mb-4">
                        <span className="font-medium">Your Role:</span> {userRole}
                    </p>

                    {/* Role-specific content can be conditionally rendered here */}
                    {(userRole === UserRole.ADMIN || userRole === UserRole.OWNER) && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <h2 className="font-medium text-blue-800 dark:text-blue-300">
                                Admin Controls
                            </h2>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                You have administrator access to this company.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    } catch (error) {
        // If there's an error (like user doesn't have access), redirect to unauthorized
        redirect("/unauthorized")
    }
}
