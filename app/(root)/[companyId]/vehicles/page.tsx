import { getVehiclesForCompany } from "@/lib/fetchers/vehicles";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Link, PlusCircle } from "lucide-react";
import { VehiclesClient } from "@/components/vehicles/vehicles-client-page";
import { getCurrentUserId, getCurrentCompanyId } from "@/lib/auth";

export default async function VehiclesPage() {
  // Get current user for permissions checks
  const user = await getCurrentUserId();

  // Check if user has permission to view vehicles
  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to view vehicles.
        </p>
      </div>
    );
  }

  // Get the company ID from the user
  const companyId = await getCurrentCompanyId();

  // Fetch vehicles data server-side
  const vehicles = await getVehiclesForCompany(Number(companyId));

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        title="Vehicles"
        description="Manage your fleet vehicles"
        breadcrumbs={[{ href: "/vehicles", label: "Vehicles" }]}
        actions={
          <Link href="/vehicles/new">
            <Button variant="default">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </Link>
        }
      />

      <VehiclesClient vehicles={[]} />
    </div>
  );
}
