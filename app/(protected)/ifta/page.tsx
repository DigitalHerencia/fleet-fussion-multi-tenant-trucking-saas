import type React from "react"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, CalendarIcon, FileText, MapPin } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { IftaTripTableClient, IftaReportTableClient } from "@/components/ifta/ifta-tables"
import type { IFTATrip, IFTAReport } from "@/components/ifta/ifta-columns"

// Define a custom FuelIcon component since it's not in lucide-react
function FuelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 22h12" />
      <path d="M8 4v18" />
      <path d="M10 4v18" />
      <path d="M3 14h12" />
      <path d="M3 4h12" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2" />
      <path d="M22 18h-5" />
    </svg>
  )
}

// Mock data for IFTA trips
const iftaTripsData: IFTATrip[] = [
  {
    id: "1",
    date: "2024-04-15",
    driver: "John Smith",
    vehicle: "TRK-101",
    startLocation: "Dallas, TX",
    endLocation: "Oklahoma City, OK",
    miles: 206,
    gallons: 32.5,
    state: "OK",
  },
  {
    id: "2",
    date: "2024-04-14",
    driver: "Michael Johnson",
    vehicle: "TRK-103",
    startLocation: "Houston, TX",
    endLocation: "New Orleans, LA",
    miles: 348,
    gallons: 54.2,
    state: "LA",
  },
  {
    id: "3",
    date: "2024-04-13",
    driver: "Robert Williams",
    vehicle: "TRK-105",
    startLocation: "San Antonio, TX",
    endLocation: "El Paso, TX",
    miles: 552,
    gallons: 87.6,
    state: "TX",
  },
  {
    id: "4",
    date: "2024-04-12",
    driver: "David Brown",
    vehicle: "TRK-101",
    startLocation: "Oklahoma City, OK",
    endLocation: "Kansas City, MO",
    miles: 352,
    gallons: 55.8,
    state: "MO",
  },
  {
    id: "5",
    date: "2024-04-11",
    driver: "James Miller",
    vehicle: "TRK-103",
    startLocation: "New Orleans, LA",
    endLocation: "Jackson, MS",
    miles: 183,
    gallons: 28.9,
    state: "MS",
  },
]

// Mock data for IFTA reports
const iftaReportsData: IFTAReport[] = [
  {
    id: "1",
    quarter: "Q1",
    year: "2024",
    totalMiles: 15420,
    totalGallons: 2425.8,
    avgMpg: 6.4,
    status: "Filed",
    dueDate: "2024-04-30",
  },
  {
    id: "2",
    quarter: "Q4",
    year: "2023",
    totalMiles: 14850,
    totalGallons: 2356.2,
    avgMpg: 6.3,
    status: "Filed",
    dueDate: "2024-01-31",
  },
  {
    id: "3",
    quarter: "Q3",
    year: "2023",
    totalMiles: 16240,
    totalGallons: 2540.6,
    avgMpg: 6.4,
    status: "Filed",
    dueDate: "2023-10-31",
  },
  {
    id: "4",
    quarter: "Q2",
    year: "2023",
    totalMiles: 15780,
    totalGallons: 2485.0,
    avgMpg: 6.3,
    status: "Filed",
    dueDate: "2023-07-31",
  },
]

export default function IFTAPage() {
  return (
    <div className="ifta-page flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-2 gap-4">
        <div>
          <h1 className="page-title">IFTA Management</h1>
          <p className="page-subtitle">Track and manage International Fuel Tax Agreement reporting</p>
        </div>
        <div className="flex flex-col sm:flex-col gap-4 ml-8">
          <Button variant="outline" size="sm" className="btn btn-outline w-full sm:w-auto">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Select Period
          </Button>
          <Button size="sm" className="btn btn-primary w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      <PageHeader />
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Miles (Q2 2024)</CardTitle>
              <MapPin className="h-4 w-4 text-[hsl(var(--info))]" />
            </CardHeader>
            <CardContent>
              <div className="card-metric">5,842</div>
              <p className="text-xs text-[hsl(var(--success))]">+12% from last quarter</p>
            </CardContent>
          </Card>
          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gallons (Q2 2024)</CardTitle>
              <FuelIcon className="h-4 w-4 text-[hsl(var(--info))]" />
            </CardHeader>
            <CardContent>
              <div className="card-metric">912.5</div>
              <p className="text-xs text-[hsl(var(--success))]">+8% from last quarter</p>
            </CardContent>
          </Card>
          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average MPG</CardTitle>
              <BarChart3 className="h-4 w-4 text-[hsl(var(--info))]" />
            </CardHeader>
            <CardContent>
              <div className="card-metric">6.4</div>
              <p className="text-xs text-[hsl(var(--success))]">+0.1 from last quarter</p>
            </CardContent>
          </Card>
          <Card className="card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jurisdictions</CardTitle>
              <MapPin className="h-4 w-4 text-[hsl(var(--info))]" />
            </CardHeader>
            <CardContent>
              <div className="card-metric">8</div>
              <p className="text-xs text-[hsl(var(--success))]">States traveled this quarter</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="tabs w-full md:w-auto grid grid-cols-2">
            <TabsTrigger value="trips">Trip Records</TabsTrigger>
            <TabsTrigger value="reports">Quarterly Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="trips" className="mt-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>IFTA Trip Records</CardTitle>
                <CardDescription>Track interstate travel for IFTA reporting and tax calculations.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Suspense fallback={<div>Loading IFTA trip data...</div>}>
                  <IftaTripTableClient data={iftaTripsData} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="mt-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>IFTA Quarterly Reports</CardTitle>
                <CardDescription>Manage and submit your quarterly IFTA tax reports.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Suspense fallback={<div>Loading IFTA reports...</div>}>
                  <IftaReportTableClient data={iftaReportsData} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
