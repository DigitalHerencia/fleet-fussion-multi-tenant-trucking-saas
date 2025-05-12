// app/(dashboard)/[companyId]/page.tsx
import { redirect } from "next/navigation";
import { getUserRoleInCompany, getCurrentUserId } from "@/lib/auth";
import { UserRole } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardPageProps {
  params: {
    companyId: string;
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // 1) Ensure user is authenticated
  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    redirect("/sign-in");
  }

  try {
    // 2) Use the companyId string directly (no parseInt)
    const { companyId } = params;

    // 3) Verify membership & fetch role
    const userRole = await getUserRoleInCompany(userId, companyId);

    // 4) Render dashboard
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
        <Card>
          <CardContent className="p-6">
            <p className="mb-2">
              <span className="font-medium">Company ID:</span> {companyId}
            </p>
            <p className="mb-4">
              <span className="font-medium">Your Role:</span> {userRole}
            </p>

            {/* Role-specific content */}
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
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    // 5) On any error (e.g. no membership), redirect to unauthorized
    redirect("/unauthorized");
  }
}
