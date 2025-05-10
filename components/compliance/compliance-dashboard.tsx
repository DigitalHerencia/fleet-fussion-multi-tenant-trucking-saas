"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { DriverComplianceTable } from "./driver-compliance-table"
import { VehicleComplianceTable } from "./vehicle-compliance-table"
import { ComplianceDocuments } from "./compliance-documents"
import { useToast } from "@/hooks/use-toast"

type ComplianceMetrics = {
  driverCompliance: { 
    rate: number;
    total: number;
    compliant: number;
    needAttention: number;
  };
  vehicleCompliance: {
    rate: number;
    total: number;
    compliant: number;
    needAttention: number;
  };
  documentCompliance: {
    rate: number;
    total: number;
    compliant: number;
    needAttention: number;
  };
  hosViolations: number;
}

type DeadlineItem = {
  type: string;
  name: string;
  dueIn: number;
  status: string;
}

export function ComplianceDashboard() {
    const [activeTab, setActiveTab] = useState("overview")
    const [summaryMetrics, setSummaryMetrics] = useState<ComplianceMetrics>({
        driverCompliance: { rate: 0, total: 0, compliant: 0, needAttention: 0 },
        vehicleCompliance: { rate: 0, total: 0, compliant: 0, needAttention: 0 },
        documentCompliance: { rate: 0, total: 0, compliant: 0, needAttention: 0 },
        hosViolations: 0
    })
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<DeadlineItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setIsLoading(true)
                setError(null)
                
                // Fetch company ID from server
                const response = await fetch("/api/company/current")
                if (!response.ok) {
                    throw new Error("Failed to get current company")
                }
                
                const { id: companyId } = await response.json()
                if (!companyId) {
                    throw new Error("No company selected")
                }
                
                // Fetch compliance data in parallel
                const [metrics, deadlines] = await Promise.all([
                    fetch(`/api/compliance/metrics?companyId=${companyId}`).then(res => {
                        if (!res.ok) throw new Error("Failed to fetch compliance metrics")
                        return res.json()
                    }),
                    fetch(`/api/compliance/deadlines?companyId=${companyId}`).then(res => {
                        if (!res.ok) throw new Error("Failed to fetch upcoming deadlines")
                        return res.json()
                    })
                ])
                
                setSummaryMetrics(metrics)
                setUpcomingDeadlines(deadlines)

                // Show toast alerts for expiring/expired documents
                const expiringDocs = deadlines.filter((d: DeadlineItem) =>
                    d.type === "Document Expiration" && (d.status === "Expiring Soon" || d.status === "Expired")
                )
                if (expiringDocs.length > 0) {
                    expiringDocs.forEach((doc: DeadlineItem) => {
                        toast({
                            title: doc.status === "Expired" ? "Document Expired" : "Document Expiring Soon",
                            description: `${doc.name} ${doc.status === "Expired" ? "has expired" : `will expire in ${doc.dueIn} day${doc.dueIn === 1 ? '' : 's'}`}.`,
                            variant: doc.status === "Expired" ? "destructive" : "default"
                        })
                    })
                }
            } catch (err) {
                console.error("Error fetching compliance dashboard data:", err)
                setError(err instanceof Error ? err.message : "An unknown error occurred")
                toast({
                    title: "Error",
                    description: "Failed to load compliance dashboard data",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }
        
        if (activeTab === "overview") {
            fetchDashboardData()
        }
    }, [activeTab, toast])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Compliance</h2>
                    <p className="text-muted-foreground">
                        Monitor and manage compliance for drivers, vehicles, and documentation
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Export Report</Button>
                    <Button>Run Compliance Check</Button>
                </div>
            </div>

            <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
            >
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="drivers">Drivers</TabsTrigger>
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                <p className="text-sm text-muted-foreground">Loading compliance data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                                    <h3 className="text-lg font-medium">Failed to load data</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {error}
                                    </p>
                                    <Button 
                                        onClick={() => setActiveTab("overview")} 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-4"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Driver Compliance
                                        </CardTitle>
                                        {summaryMetrics.driverCompliance.rate >= 90 ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : summaryMetrics.driverCompliance.rate >= 75 ? (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summaryMetrics.driverCompliance.rate}%</div>
                                        <p className="text-xs text-muted-foreground">
                                            {summaryMetrics.driverCompliance.needAttention} drivers need attention
                                        </p>
                                        <Progress value={summaryMetrics.driverCompliance.rate} className="mt-2" />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Vehicle Compliance
                                        </CardTitle>
                                        {summaryMetrics.vehicleCompliance.rate >= 90 ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : summaryMetrics.vehicleCompliance.rate >= 75 ? (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summaryMetrics.vehicleCompliance.rate}%</div>
                                        <p className="text-xs text-muted-foreground">
                                            {summaryMetrics.vehicleCompliance.needAttention} vehicles need attention
                                        </p>
                                        <Progress value={summaryMetrics.vehicleCompliance.rate} className="mt-2" />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            HOS Violations
                                        </CardTitle>
                                        <Clock className="h-4 w-4 text-red-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summaryMetrics.hosViolations}</div>
                                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                                        <Progress 
                                            value={Math.min(summaryMetrics.hosViolations * 10, 100)} 
                                            className="mt-2" 
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Document Status
                                        </CardTitle>
                                        {summaryMetrics.documentCompliance.rate >= 90 ? (
                                            <FileText className="h-4 w-4 text-green-500" />
                                        ) : summaryMetrics.documentCompliance.rate >= 75 ? (
                                            <FileText className="h-4 w-4 text-amber-500" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-red-500" />
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{summaryMetrics.documentCompliance.rate}%</div>
                                        <p className="text-xs text-muted-foreground">
                                            {summaryMetrics.documentCompliance.needAttention} document{summaryMetrics.documentCompliance.needAttention !== 1 ? 's' : ''} need attention
                                        </p>
                                        <Progress value={summaryMetrics.documentCompliance.rate} className="mt-2" />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upcoming Deadlines</CardTitle>
                                        <CardDescription>
                                            Compliance items requiring attention in the next 30 days
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {upcomingDeadlines.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center text-center py-8">
                                                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    No upcoming deadlines in the next 30 days
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                                                    <div key={index} className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {deadline.type} - {deadline.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {deadline.dueIn === 1 
                                                                    ? "Due tomorrow" 
                                                                    : `Due in ${deadline.dueIn} days`}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                deadline.status === "Expiring Soon" || deadline.status === "Due Soon"
                                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                                            }
                                                        >
                                                            {deadline.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {upcomingDeadlines.length > 5 && (
                                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                                        View All ({upcomingDeadlines.length})
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Compliance Trends</CardTitle>
                                        <CardDescription>30-day compliance metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[250px] flex items-center justify-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <TrendingUp className="h-12 w-12 text-green-500" />
                                            <p className="text-sm text-center">
                                                Overall compliance score improved since last month
                                            </p>
                                            <Button variant="outline" size="sm">
                                                View Detailed Report
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="drivers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Driver Compliance Status</CardTitle>
                            <CardDescription>
                                Monitor driver licenses, medical cards, and HOS compliance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DriverComplianceTable drivers={ [] } />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Compliance Status</CardTitle>
                            <CardDescription>
                                Track vehicle inspections, registrations, and maintenance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VehicleComplianceTable vehicles={ [] } />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compliance Documents</CardTitle>
                            <CardDescription>
                                Manage and track required documentation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ComplianceDocuments />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
