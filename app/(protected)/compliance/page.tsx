import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClipboardCheck, FileText, TruckIcon, UserIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns as driverColumns } from "@/components/compliance/driver-compliance-table"
import { columns as vehicleColumns } from "@/components/compliance/vehicle-compliance-table"
import { columns as documentColumns } from "@/components/compliance/compliance-documents"
import { PageHeader } from "@/components/ui/page-header"

// Mock data for drivers compliance
const driverComplianceData = [
  {
    id: "1",
    name: "John Smith",
    status: "Compliant",
    licenseExpiry: "2024-12-15",
    medicalExpiry: "2024-10-20",
    lastHosViolation: "None",
    dutyStatus: "Off Duty",
    availableHours: 11,
  },
  {
    id: "2",
    name: "Michael Johnson",
    status: "Warning",
    licenseExpiry: "2024-08-30",
    medicalExpiry: "2024-07-15",
    lastHosViolation: "2024-03-10",
    dutyStatus: "Driving",
    availableHours: 4,
  },
  {
    id: "3",
    name: "Robert Williams",
    status: "Non-Compliant",
    licenseExpiry: "2024-05-10",
    medicalExpiry: "2024-04-30",
    lastHosViolation: "2024-04-05",
    dutyStatus: "On Duty",
    availableHours: 0,
  },
  {
    id: "4",
    name: "David Brown",
    status: "Compliant",
    licenseExpiry: "2025-01-20",
    medicalExpiry: "2024-11-15",
    lastHosViolation: "None",
    dutyStatus: "Sleeper",
    availableHours: 8,
  },
  {
    id: "5",
    name: "James Miller",
    status: "Compliant",
    licenseExpiry: "2024-10-05",
    medicalExpiry: "2024-09-25",
    lastHosViolation: "None",
    dutyStatus: "Off Duty",
    availableHours: 11,
  },
]

// Mock data for vehicles compliance
const vehicleComplianceData = [
  {
    id: "1",
    unit: "TRK-101",
    status: "Compliant",
    lastInspection: "2024-04-01",
    nextInspection: "2024-07-01",
    defects: "None",
    registrationExpiry: "2024-12-15",
    type: "Tractor",
  },
  {
    id: "2",
    unit: "TRL-202",
    status: "Warning",
    lastInspection: "2024-03-15",
    nextInspection: "2024-06-15",
    defects: "Minor - Tail Light",
    registrationExpiry: "2024-08-30",
    type: "Trailer",
  },
  {
    id: "3",
    unit: "TRK-103",
    status: "Non-Compliant",
    lastInspection: "2024-01-10",
    nextInspection: "2024-04-10",
    defects: "Major - Brake System",
    registrationExpiry: "2024-10-20",
    type: "Tractor",
  },
  {
    id: "4",
    unit: "TRL-204",
    status: "Compliant",
    lastInspection: "2024-03-25",
    nextInspection: "2024-06-25",
    defects: "None",
    registrationExpiry: "2025-01-15",
    type: "Trailer",
  },
  {
    id: "5",
    unit: "TRK-105",
    status: "Compliant",
    lastInspection: "2024-04-05",
    nextInspection: "2024-07-05",
    defects: "None",
    registrationExpiry: "2024-11-10",
    type: "Tractor",
  },
]

// Mock data for compliance documents
const complianceDocumentsData = [
  {
    id: "1",
    name: "Driver Qualification File",
    type: "Required",
    lastUpdated: "2024-04-10",
    status: "Complete",
    assignedTo: "All Drivers",
  },
  {
    id: "2",
    name: "Vehicle Inspection Reports",
    type: "Required",
    lastUpdated: "2024-04-15",
    status: "Complete",
    assignedTo: "All Vehicles",
  },
  {
    id: "3",
    name: "Hours of Service Logs",
    type: "Required",
    lastUpdated: "2024-04-18",
    status: "Incomplete",
    assignedTo: "All Drivers",
  },
  {
    id: "4",
    name: "Drug & Alcohol Testing Records",
    type: "Required",
    lastUpdated: "2024-03-30",
    status: "Complete",
    assignedTo: "All Drivers",
  },
  {
    id: "5",
    name: "Accident Register",
    type: "Required",
    lastUpdated: "2024-04-05",
    status: "Complete",
    assignedTo: "Company",
  },
]

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <PageHeader />

      <div className="flex flex-col gap-4">
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Schedule Audit
        </Button>
        <Button size="sm" className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Compliance</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground">4 of 5 drivers fully compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Compliance</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80%</div>
            <p className="text-xs text-muted-foreground">4 of 5 vehicles fully compliant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HOS Violations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Compliance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">9 of 10 documents up to date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="drivers" className="w-full">
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
                Monitor driver compliance with regulations including HOS, licenses, and medical certifications.
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
              <CardDescription>Track vehicle inspections, maintenance, and registration compliance.</CardDescription>
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
              <CardDescription>Manage required documentation for regulatory compliance.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Suspense fallback={<div>Loading compliance documents...</div>}>
                <DataTable columns={documentColumns} data={complianceDocumentsData} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
