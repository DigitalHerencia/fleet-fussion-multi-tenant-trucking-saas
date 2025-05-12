import { getDriversForCompany } from "../../lib/fetchers/drivers"
import { DashboardShell } from "../../components/dashboard/dashboard-shell"
import { PageHeader } from "../../components/ui/page-header"
import { DriversListClient } from "../../features/drivers/drivers-list-client"
import { getCurrentCompanyId } from "../../lib/auth"

// Server Component: Fetches drivers and renders the client list UI
export default async function DriversPage() {
    // Get the current company from session (implement as needed)
    const companyIdString = await getCurrentCompanyId()
    if (!companyIdString) {
        return <div>Company not found. Please create a company first.</div>
    }

    // Convert companyIdString to a number
    const companyIdNumber = parseInt(companyIdString, 10)

    // Validate if parsing was successful, as companyIdString might not be a numeric string (e.g., UUID)
    if (isNaN(companyIdNumber)) {
        console.error(`Invalid company ID format: "${companyIdString}". Expected a numeric string.`)
        // Return a user-friendly error message or redirect
        return <div>Error: Invalid company ID format. Unable to load drivers.</div>
    }

    // Fetch all drivers for this company
    const driversRaw = await getDriversForCompany(companyIdNumber)
    // Map status to correct union type
    const drivers = driversRaw.map((driver: any) => ({
        ...driver,
        status: driver.status === "active" ? "active" : "inactive"
    }))

    return (
        <DashboardShell>
            <PageHeader title="Drivers" description="Manage your driver roster" />
            <DriversListClient drivers={drivers} />
        </DashboardShell>
    )
}
