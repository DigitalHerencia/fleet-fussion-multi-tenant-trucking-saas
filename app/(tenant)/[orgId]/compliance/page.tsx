import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClipboardCheck, FileText, TruckIcon, UserIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns as driverColumns } from "@/components/compliance/driver-compliance-table"
import { columns as vehicleColumns } from "@/components/compliance/vehicle-compliance-table"
import { columns as documentColumns } from "@/components/compliance/compliance-documents"
import { PageHeader } from "@/components/shared/page-header"


export default function CompliancePage() {
	return (
		<div className="compliance-page flex flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-14 mb-2">
				<div>
					<h1 className="page-title">Compliance Management</h1>
					<p className="page-subtitle">Monitor and manage regulatory compliance for your fleet, drivers, and documents.</p>
				</div>
				<div className="flex flex-col gap-4 w-full mr-6 md:w-auto">
					<Button variant="outline" size="sm" className="btn btn-outline w-full md:w-auto">
						<span className="mr-2">📅</span>
						Schedule Audit
					</Button>
					<Button size="sm" className="btn btn-primary w-full md:w-auto">
						<span className="mr-2">📄</span>
						Generate Report
					</Button>
				</div>
			</div>
			<PageHeader />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Driver Compliance</CardTitle>
						<UserIcon className="h-4 w-4 text-[hsl(var(--info))]" />
					</CardHeader>
					<CardContent>
						<div className="card-metric">80%</div>
						<p className="text-xs text-[hsl(var(--success))]">4 of 5 drivers fully compliant</p>
					</CardContent>
				</Card>
				<Card className="card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Vehicle Compliance</CardTitle>
						<TruckIcon className="h-4 w-4 text-[hsl(var(--info))]" />
					</CardHeader>
					<CardContent>
						<div className="card-metric">80%</div>
						<p className="text-xs text-[hsl(var(--success))]">4 of 5 vehicles fully compliant</p>
					</CardContent>
				</Card>
				<Card className="card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">HOS Violations</CardTitle>
						<ClipboardCheck className="h-4 w-4 text-[hsl(var(--warning))]" />
					</CardHeader>
					<CardContent>
						<div className="card-metric">2</div>
						<p className="text-xs text-[hsl(var(--danger))]">Last 30 days</p>
					</CardContent>
				</Card>
				<Card className="card">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Document Compliance</CardTitle>
						<FileText className="h-4 w-4 text-[hsl(var(--info))]" />
					</CardHeader>
					<CardContent>
						<div className="card-metric">90%</div>
						<p className="text-xs text-[hsl(var(--success))]">9 of 10 documents up to date</p>
					</CardContent>
				</Card>
			</div>
			<Tabs defaultValue="drivers" className="w-full">
				<TabsList className="tabs w-full md:w-auto grid grid-cols-3">
					<TabsTrigger value="drivers">Drivers</TabsTrigger>
					<TabsTrigger value="vehicles">Vehicles</TabsTrigger>
					<TabsTrigger value="documents">Documents</TabsTrigger>
				</TabsList>
				<TabsContent value="drivers" className="mt-4">
					<Card className="card">
						<CardHeader>
							<CardTitle>Driver Compliance Status</CardTitle>
							<CardDescription>
								Monitor driver compliance with regulations including HOS, licenses, and medical certifications.
							</CardDescription>
						</CardHeader>
						<CardContent className="overflow-x-auto">
							<Suspense fallback={<div>Loading driver compliance data...</div>}>
								<DataTable columns={ [] } data={ [] }  />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="vehicles" className="mt-4">
					<Card className="card">
						<CardHeader>
							<CardTitle>Vehicle Compliance Status</CardTitle>
							<CardDescription>Track vehicle inspections, maintenance, and registration compliance.</CardDescription>
						</CardHeader>
						<CardContent className="overflow-x-auto">
							<Suspense fallback={<div>Loading vehicle compliance data...</div>}>
								<DataTable columns={ [] } data={ [] }  />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="documents" className="mt-4">
					<Card className="card">
						<CardHeader>
							<CardTitle>Compliance Documents</CardTitle>
							<CardDescription>Manage required documentation for regulatory compliance.</CardDescription>
						</CardHeader>
						<CardContent className="overflow-x-auto">
							<Suspense fallback={<div>Loading compliance documents...</div>}>
								<DataTable columns={ [] } data={ [] } />
							</Suspense>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
