/**
 * Driver Dashboard Page
 * 
 * Individual driver dashboard for viewing assigned loads, HOS status, and compliance info
 */

import { Suspense, type JSX } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { HosLogViewer } from '@/components/compliance/hos-log-viewer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  FileText,
  Route,
  Timer
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { SystemRoles } from '@/types/abac'

export default async function DriverDashboardPage(): Promise<JSX.Element> {

  // Verify driver access
  const user = await getCurrentUser()
  if (!user || user.role !== SystemRoles.DRIVER) {
    redirect('/sign-in')
  }

  return (
    <>
      <PageHeader />
      <div className="pt-16 space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Manage your loads and track your hours.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              On Duty
            </Badge>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Log Hours
            </Button>
          </div>
        </div>

        {/* HOS Status */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Driving Hours</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.5 / 11</div>
              <p className="text-xs text-muted-foreground">Available: 5.5 hours</p>
              <Progress value={50} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Duty Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.0 / 14</div>
              <p className="text-xs text-muted-foreground">Available: 6.0 hours</p>
              <Progress value={57} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">70-Hour Rule</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">58 / 70</div>
              <p className="text-xs text-muted-foreground">Available: 12 hours</p>
              <Progress value={83} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-muted-foreground">All documents valid</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Load */}
        <Card>
          <CardHeader>
            <CardTitle>Current Load</CardTitle>
            <CardDescription>
              Active assignment details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Load #FFL-2024-1205</div>
                  <div className="text-sm text-muted-foreground">Vehicle: T-102 - 2022 Freightliner Cascadia</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Origin</span>
                  </div>
                  <div className="text-sm">
                    <div>ABC Distribution Center</div>
                    <div className="text-muted-foreground">1234 Industrial Blvd, Chicago, IL 60601</div>
                    <div className="text-xs text-green-600">✓ Picked up at 08:30 AM</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Destination</span>
                  </div>
                  <div className="text-sm">
                    <div>XYZ Warehouse</div>
                    <div className="text-muted-foreground">5678 Commerce St, Milwaukee, WI 53202</div>
                    <div className="text-xs text-muted-foreground">Expected: 2:30 PM</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">Distance: </span>
                  <span className="font-medium">87 miles</span>
                  <span className="text-muted-foreground ml-4">ETA: </span>
                  <span className="font-medium">2:15 PM</span>
                </div>
                <Button>
                  Update Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Loads */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Loads</CardTitle>
              <CardDescription>
                Your scheduled assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">Load #FFL-2024-1206</div>
                    <div className="text-sm text-muted-foreground">Chicago, IL → Detroit, MI</div>
                    <div className="text-xs text-muted-foreground">Tomorrow, 06:00 AM</div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-1">
                    <div className="font-medium">Load #FFL-2024-1207</div>
                    <div className="text-sm text-muted-foreground">Detroit, MI → Cleveland, OH</div>
                    <div className="text-xs text-muted-foreground">Dec 7, 08:30 AM</div>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest load updates and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Load FFL-2024-1205 picked up</div>
                    <div className="text-xs text-muted-foreground">Today at 8:30 AM</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Load FFL-2024-1204 delivered</div>
                    <div className="text-xs text-muted-foreground">Yesterday at 4:15 PM</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">HOS log updated</div>
                    <div className="text-xs text-muted-foreground">Yesterday at 6:00 PM</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Status */}
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
            <CardDescription>
              Keep track of your certifications and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">CDL License</div>
                    <div className="text-xs text-muted-foreground">Expires: Mar 15, 2025</div>
                  </div>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">Medical Certificate</div>
                    <div className="text-xs text-muted-foreground">Expires: Jan 8, 2025</div>
                  </div>
                </div>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <div className="text-sm font-medium">HAZMAT Endorsement</div>
                    <div className="text-xs text-muted-foreground">Expires: Aug 22, 2026</div>
                  </div>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Your driving metrics and achievements this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">2,480</div>
                <div className="text-xs text-muted-foreground">Miles Driven</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">96%</div>
                <div className="text-xs text-muted-foreground">On-Time Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">7.2</div>
                <div className="text-xs text-muted-foreground">MPG Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98</div>
                <div className="text-xs text-muted-foreground">Safety Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

