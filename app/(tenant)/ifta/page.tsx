import type React from "react"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, CalendarIcon, FileText, MapPin } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { IftaReportTableClient } from "@/components/ifta/ifta-tables"


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
									{/* <IftaTripTableClient data={iftaTripsData} /> */}
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
									<IftaReportTableClient data={ [] }  />
								</Suspense>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}		

