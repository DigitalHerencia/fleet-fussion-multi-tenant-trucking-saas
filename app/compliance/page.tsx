import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ClipboardCheck } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns as driverColumns } from "@/components/compliance/driver-compliance-table"
import { columns as vehicleColumns } from "@/components/compliance/vehicle-compliance-table"
import { columns as documentColumns } from "@/components/compliance/compliance-documents"
import { PageHeader } from "@/components/ui/page-header"
import { getDriverComplianceData, getVehicleComplianceData, getComplianceDocumentData } from "@/lib/fetchers/compliance"
import { getCurrentCompanyId } from "@/lib/auth"
import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard"
import { type ColumnDef } from "@tanstack/react-table"

// Define types for our compliance data
type ComplianceDriver = {
    id: string;
    name: string;
    status: string;
    licenseExpiry: string;
    medicalExpiry: string;
    lastHosViolation: string;
    dutyStatus: string;
    availableHours: number;
};

type ComplianceVehicle = {
    id: string;
    unitNumber: string;
    unit: string;
    status: string;
    type: string;
    make: string | null;
    model: string | null;
    year: number | null;
    vin: string | null;
    licensePlate: string | null;
    state: string | null;
    currentOdometer: number | null;
    lastOdometerUpdate: Date | null;
    lastInspection: string;
    nextInspection: string;
    defects: string;
    registrationExpiry: string;
};

type ComplianceDocument = {
    id: string;
    name: string;
    type: string;
    lastUpdated: string | undefined;
    status: string;
    assignedTo: string;
};

// Ensure the documentColumns are properly typed as ComplianceDocument
const typedDocumentColumns = documentColumns as unknown as ColumnDef<ComplianceDocument, unknown>[];

async function getComplianceData() {
    try {
        const companyId = await getCurrentCompanyId()
        
        if (!companyId) {
            throw new Error("No company selected")
        }
        
        // Fetch all compliance data in parallel
        const [drivers, vehicles, documents] = await Promise.all([
            getDriverComplianceData(companyId),
            getVehicleComplianceData(companyId),
            getComplianceDocumentData(companyId)
        ])
        
        return { 
            drivers: drivers as ComplianceDriver[], 
            vehicles: vehicles as ComplianceVehicle[], 
            documents: documents as ComplianceDocument[],
            error: null
        }
    } catch (error) {
        console.error("Error fetching compliance data:", error)
        return { 
            drivers: [] as ComplianceDriver[], 
            vehicles: [] as ComplianceVehicle[], 
            documents: [] as ComplianceDocument[],
            error: "Failed to load compliance data. Please try again later."
        }
    }
}

export default async function CompliancePage() {
    const { drivers: driverComplianceData, vehicles: vehicleComplianceData, documents: complianceDocumentsData, error } = await getComplianceData()

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <PageHeader
                    title="Compliance Management"
                    description="Monitor and manage compliance for drivers, vehicles, and documentation"
                    actions={
                        <div className="flex gap-2">
                            <Button variant="outline">Export Report</Button>
                            <Button>Run Compliance Check</Button>
                        </div>
                    }
                />
            </div>

            {error ? (
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <div className="text-destructive mb-2">
                                <AlertTriangle className="h-10 w-10" />
                            </div>
                            <h3 className="text-lg font-medium">Error Loading Data</h3>
                            <p className="text-muted-foreground mt-2">{error}</p>
                            <Button className="mt-4" variant="outline">
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <ComplianceDashboard />
                    
                    <Tabs defaultValue="drivers" className="mt-6">
                        <TabsList className="w-full md:w-auto grid grid-cols-3">
                            <TabsTrigger value="drivers">Drivers</TabsTrigger>
                            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="drivers" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Driver Compliance Status</CardTitle>
                                    <CardDescription>
                                        Monitor driver compliance with regulations including HOS, licenses,
                                        and medical certifications.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    <Suspense fallback={<div>Loading driver compliance data...</div>}>
                                        <DataTable columns={driverColumns} data={driverComplianceData} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="vehicles" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vehicle Compliance Status</CardTitle>
                                    <CardDescription>
                                        Track vehicle inspections, maintenance, and registration compliance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    <Suspense fallback={<div>Loading vehicle compliance data...</div>}>
                                        <DataTable columns={vehicleColumns} data={vehicleComplianceData} />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="documents" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance Documents</CardTitle>
                                    <CardDescription>
                                        Manage required documentation for regulatory compliance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="overflow-x-auto">
                                    <Suspense fallback={<div>Loading compliance documents...</div>}>
                                        <DataTable
                                            columns={typedDocumentColumns}
                                            data={complianceDocumentsData}
                                        />
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}
