/**
 * Driver Dashboard Page
 * 
 * Driver-specific dashboard for managing loads, tracking deliveries, and HOS compliance
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  MapPin, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  Navigation,
  Fuel,
  Shield
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SystemRoles } from '@/types/abac'

export default async function DriverDashboardPage({
  params
}: {
  params: { orgId: string; userId: string }
}) {
  // Verify driver access
  const user = await getCurrentUser()
  if (!user || user.role !== SystemRoles.DRIVER) {
    redirect('/sign-in?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Manage your loads and track your progress
            </p>
          </div>

          {/* Current Status Card */}
          <Card className="mb-8 border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-green-700 dark:text-green-400">Currently Active</CardTitle>
                  <CardDescription>LOAD-2024-015: Chicago, IL → Dallas, TX</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">347 mi</div>
                  <div className="text-sm text-muted-foreground">remaining</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">4h 30m</div>
                  <div className="text-xs text-muted-foreground">ETA</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">65%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">6h 15m</div>
                  <div className="text-xs text-muted-foreground">Drive Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">4h 45m</div>
                  <div className="text-xs text-muted-foreground">Remaining HOS</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigation
                </Button>
                <Button variant="outline" className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Update Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Miles</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">423</div>
                <p className="text-xs text-muted-foreground">
                  77 miles remaining
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">HOS Status</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">On Duty</div>
                <p className="text-xs text-muted-foreground">
                  4h 45m remaining
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fuel Level</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">
                  ~312 miles range
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">98.5</div>
                <p className="text-xs text-muted-foreground">
                  Excellent rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Load Details & Documents */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Load Details</CardTitle>
                  <CardDescription>
                    Current and upcoming load information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="space-y-4">
                      {/* Current Load */}
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">LOAD-2024-015 (Current)</h4>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            In Transit
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Pickup:</div>
                            <div className="text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Chicago Distribution Center<br />
                              1234 Industrial Blvd, Chicago, IL 60601
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Delivery:</div>
                            <div className="text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Dallas Freight Hub<br />
                              5678 Commerce St, Dallas, TX 75201
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm">View BOL</Button>
                          <Button size="sm" variant="outline">Delivery Notes</Button>
                        </div>
                      </div>

                      {/* Next Load */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">LOAD-2024-016 (Next)</h4>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Scheduled
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Pickup:</div>
                            <div className="text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Dallas, TX
                            </div>
                            <div className="text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Jan 16, 2024 - 8:00 AM
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Delivery:</div>
                            <div className="text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Phoenix, AZ
                            </div>
                            <div className="text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Jan 17, 2024 - 2:00 PM
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Suspense>
                </CardContent>
              </Card>

              {/* Documents & Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Logs</CardTitle>
                  <CardDescription>
                    Manage your trip documents and compliance logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-16 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>HOS Logs</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Trip Reports</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Fuel Receipts</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Inspection Reports</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status & Alerts */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded bg-yellow-50 dark:bg-yellow-950/20">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">HOS Reminder</div>
                        <div className="text-xs text-muted-foreground">
                          4h 45m remaining on duty cycle
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded bg-blue-50 dark:bg-blue-950/20">
                      <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Route Update</div>
                        <div className="text-xs text-muted-foreground">
                          Construction on I-35, +15min delay
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 border rounded bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Load Confirmed</div>
                        <div className="text-xs text-muted-foreground">
                          LOAD-2024-016 pickup confirmed
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Fuel className="h-4 w-4 mr-2" />
                    Log Fuel Stop
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Inspection
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Safety Checklist
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
