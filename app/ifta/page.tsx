export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, CalendarIcon, FileText, MapPin } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { IftaTripTable } from "@/components/ifta/ifta-trip-table"
import type { IftaTrip } from "@/components/ifta/ifta-trip-table"
import { IftaReportTable } from "@/components/ifta/ifta-report-table"
import type { IftaReport } from "@/components/ifta/ifta-report-table"
import { getIftaTrips, getIftaReports, getIftaSummaryMetrics } from "@/lib/fetchers/ifta"

export default async function IFTAPage() {
    // Fetch summary metrics for dashboard cards
    const summary = await getIftaSummaryMetrics()
    // Fetch trip and report data
    const tripsRaw = await getIftaTrips({ limit: 50 })
    const reportsRaw = await getIftaReports({ limit: 20 })

    // Map trips to table format
    const trips: IftaTrip[] = tripsRaw.map(trip => ({
        id: trip.id,
        date: trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "",
        driver: trip.driver || "Unassigned",
        vehicle: trip.vehicle || "Unknown",
        origin: trip.jurisdictionData?.origin || "",
        destination: trip.jurisdictionData?.destination || "",
        miles: Number(trip.totalMiles) || 0,
        jurisdictions: trip.state || ""
    }))

    // Map reports to table format
    const reports: IftaReport[] = reportsRaw.map(report => ({
        id: report.id,
        quarter: `Q${report.quarter}`,
        filingDate: report.dueDate,
        status: report.status || "Draft",
        totalMiles: report.totalMiles || 0,
        totalGallons: report.totalGallons || 0,
        // Calculate taxPaid if available, else fallback
        taxPaid: report.reportData?.taxPaid?.toString() || "$0.00"
    }))

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="IFTA Management"
                description="Track and manage International Fuel Tax Agreement reporting"
                breadcrumbs={[{ label: "IFTA", href: "/ifta" }]}
                actions={
                    <>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Select Period
                        </Button>
                        <Button size="sm" className="w-full sm:w-auto">
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Miles ({summary?.period.label})
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.metrics.totalMiles?.toLocaleString() ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.metrics.milesChange}% from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Gallons ({summary?.period.label})
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.metrics.totalGallons?.toLocaleString() ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.metrics.gallonsChange}% from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average MPG</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.metrics.avgMpg ?? "0.0"}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.metrics.mpgChange} from last quarter
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jurisdictions</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.metrics.uniqueJurisdictions ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            States traveled this quarter
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="trips" className="w-full">
                <TabsList className="w-full md:w-auto grid grid-cols-2">
                    <TabsTrigger value="trips">Trip Records</TabsTrigger>
                    <TabsTrigger value="reports">Quarterly Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="trips" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>IFTA Trip Records</CardTitle>
                            <CardDescription>
                                Track interstate travel for IFTA reporting and tax calculations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Suspense fallback={<div>Loading IFTA trip data...</div>}>
                                <IftaTripTable trips={trips} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>IFTA Quarterly Reports</CardTitle>
                            <CardDescription>
                                Manage and submit your quarterly IFTA tax reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <Suspense fallback={<div>Loading IFTA reports...</div>}>
                                <IftaReportTable reports={reports} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
