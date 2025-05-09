"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPinned, Truck, Users, Calendar, LineChart } from "lucide-react"

export default function Dashboard() {
  // Mock data for dashboard cards
  const mockData = {
    activeDrivers: 14,
    activeVehicles: 23, 
    pendingLoads: 8,
    completedLoads: 124,
    revenue: "$56,842.00"
  }
  
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to FleetFusion - your fleet management solution.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline">
            <LineChart className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeDrivers}</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.activeVehicles}</div>
            <p className="text-xs text-muted-foreground">-1 in maintenance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Loads</CardTitle>
            <MapPinned className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.pendingLoads}</div>
            <p className="text-xs text-muted-foreground">3 due today</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your fleet's latest activity and status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Vehicle #TR-1854 started route</p>
                  <p className="text-sm text-muted-foreground">Today at 9:30 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPinned className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Load #L-2567 delivered successfully</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 4:45 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Driver John D. completed rest period</p>
                  <p className="text-sm text-muted-foreground">Yesterday at 8:15 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Monthly fleet performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Completed Loads</span>
                <span className="font-medium">{mockData.completedLoads}</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "85%" }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Revenue Generated</span>
                <span className="font-medium">{mockData.revenue}</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "73%" }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Driver Compliance</span>
                <span className="font-medium">96%</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "96%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}