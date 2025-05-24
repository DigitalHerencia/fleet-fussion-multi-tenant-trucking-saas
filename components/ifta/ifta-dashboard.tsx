"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { IftaReportTable } from "./ifta-report-table"
import { IftaTripTable } from "./ifta-trip-table"
import { BarChart, Calendar, Download, FileText, TrendingUp } from "lucide-react"

export function IftaDashboard() {
  const [quarter, setQuarter] = useState("2023-Q2")

  return (
    <div className="space-y-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap">IFTA Management</h2>
          <p className="text-muted-foreground whitespace-nowrap">Track and manage International Fuel Tax Agreement reporting</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs sm:w-auto">
          <Button variant="outline" size="sm" className="w-full">
            <span className="flex items-center justify-center w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Select Period
            </span>
          </Button>
          <Button size="sm" className="w-full">
            <span className="flex items-center justify-center w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miles</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42,587</div>
            <p className="text-xs text-muted-foreground">For {quarter.replace("-", " ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Purchased</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,842 gal</div>
            <p className="text-xs text-muted-foreground">For {quarter.replace("-", " ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average MPG</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.22</div>
            <p className="text-xs text-muted-foreground">For {quarter.replace("-", " ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Due</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,245.87</div>
            <p className="text-xs text-muted-foreground">Estimated for {quarter.replace("-", " ")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Filing Status</CardTitle>
            <CardDescription>IFTA filing progress for {quarter.replace("-", " ")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Trip Data Collection</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fuel Receipt Verification</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mileage Verification</span>
                  <span className="text-sm text-muted-foreground">90%</span>
                </div>
                <Progress value={90} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Report Generation</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <Progress value={0} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filing Submission</span>
                  <span className="text-sm text-muted-foreground">0%</span>
                </div>
                <Progress value={0} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <Calendar className="inline-block mr-1 h-4 w-4" />
                Due: July 31, 2023
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Download Worksheet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jurisdiction Summary</CardTitle>
            <CardDescription>Miles traveled and fuel purchased by jurisdiction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left text-sm font-medium">Jurisdiction</th>
                    <th className="p-2 text-right text-sm font-medium">Miles</th>
                    <th className="p-2 text-right text-sm font-medium">Fuel (gal)</th>
                    <th className="p-2 text-right text-sm font-medium">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 text-sm font-medium">IL</td>
                    <td className="p-2 text-sm text-right">12,458</td>
                    <td className="p-2 text-sm text-right">1,985</td>
                    <td className="p-2 text-sm text-right">$386.42</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-sm font-medium">IN</td>
                    <td className="p-2 text-sm text-right">8,742</td>
                    <td className="p-2 text-sm text-right">1,402</td>
                    <td className="p-2 text-sm text-right">$268.75</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-sm font-medium">OH</td>
                    <td className="p-2 text-sm text-right">7,895</td>
                    <td className="p-2 text-sm text-right">1,265</td>
                    <td className="p-2 text-sm text-right">$245.18</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 text-sm font-medium">MI</td>
                    <td className="p-2 text-sm text-right">6,542</td>
                    <td className="p-2 text-sm text-right">1,050</td>
                    <td className="p-2 text-sm text-right">$198.32</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-sm font-medium">WI</td>
                    <td className="p-2 text-sm text-right">6,950</td>
                    <td className="p-2 text-sm text-right">1,140</td>
                    <td className="p-2 text-sm text-right">$147.20</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Jurisdictions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trips">Trip Data</TabsTrigger>
          <TabsTrigger value="fuel">Fuel Purchases</TabsTrigger>
          <TabsTrigger value="reports">Past Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Trip Data</CardTitle>
              <CardDescription>Record of trips for IFTA reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <IftaTripTable trips={ [] } />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Purchases</CardTitle>
              <CardDescription>Record of fuel purchases for IFTA reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-sm font-medium">Date</th>
                      <th className="p-2 text-left text-sm font-medium">Vehicle</th>
                      <th className="p-2 text-left text-sm font-medium">Location</th>
                      <th className="p-2 text-left text-sm font-medium">Jurisdiction</th>
                      <th className="p-2 text-right text-sm font-medium">Gallons</th>
                      <th className="p-2 text-right text-sm font-medium">Price/Gal</th>
                      <th className="p-2 text-right text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 text-sm">06/28/2023</td>
                      <td className="p-2 text-sm">T-101</td>
                      <td className="p-2 text-sm">Flying J #342</td>
                      <td className="p-2 text-sm">IL</td>
                      <td className="p-2 text-sm text-right">125.8</td>
                      <td className="p-2 text-sm text-right">$3.89</td>
                      <td className="p-2 text-sm text-right">$489.36</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm">06/25/2023</td>
                      <td className="p-2 text-sm">T-102</td>
                      <td className="p-2 text-sm">Pilot #156</td>
                      <td className="p-2 text-sm">IN</td>
                      <td className="p-2 text-sm text-right">118.2</td>
                      <td className="p-2 text-sm text-right">$3.92</td>
                      <td className="p-2 text-sm text-right">$463.34</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm">06/22/2023</td>
                      <td className="p-2 text-sm">T-103</td>
                      <td className="p-2 text-sm">TA #078</td>
                      <td className="p-2 text-sm">OH</td>
                      <td className="p-2 text-sm text-right">132.5</td>
                      <td className="p-2 text-sm text-right">$3.85</td>
                      <td className="p-2 text-sm text-right">$510.13</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm">06/20/2023</td>
                      <td className="p-2 text-sm">T-101</td>
                      <td className="p-2 text-sm">Love's #234</td>
                      <td className="p-2 text-sm">MI</td>
                      <td className="p-2 text-sm text-right">115.6</td>
                      <td className="p-2 text-sm text-right">$3.94</td>
                      <td className="p-2 text-sm text-right">$455.46</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-sm">06/18/2023</td>
                      <td className="p-2 text-sm">T-102</td>
                      <td className="p-2 text-sm">Petro #112</td>
                      <td className="p-2 text-sm">WI</td>
                      <td className="p-2 text-sm text-right">128.3</td>
                      <td className="p-2 text-sm text-right">$3.88</td>
                      <td className="p-2 text-sm text-right">$497.80</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  Add Fuel Purchase
                </Button>
                <Button variant="outline" size="sm">
                  View All Purchases
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Past IFTA Reports</CardTitle>
              <CardDescription>History of filed IFTA reports</CardDescription>
            </CardHeader>
            <CardContent>
              <IftaReportTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
