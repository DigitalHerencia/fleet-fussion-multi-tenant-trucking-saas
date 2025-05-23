"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadCard } from "@/components/dispatch/load-card"
import { LoadForm } from "@/components/dispatch/load-form"
import { LoadDetailsDialog } from "@/components/dispatch/load-details-dialog"
import { PlusCircle, Filter } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { ReactNode } from "react"

interface Driver {
  id: string
  firstName: string
  lastName: string
  status: string
  email?: string
  phone?: string
}

interface Vehicle {
  id: string
  unitNumber: string
  status: string
  type: string
  make: string // Changed from make?: string
  model?: string
}

interface Load {
  id: string
  referenceNumber: string
  status: string
  customerName: string
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  pickupDate: Date
  deliveryDate: Date
  driver?: {
    id: string
    firstName: string
    lastName: string
  } | null
  vehicle?: {
    id: string
    unitNumber: string
  } | null
  trailer?: {
    id: string
    unitNumber: string
  } | null
  commodity?: string
  weight?: number
  rate?: number
  miles?: number
}

interface DispatchBoardProps {
  loads: Load[]
  drivers: Driver[]
  vehicles: Vehicle[]
}

export function DispatchBoard({ loads, drivers, vehicles }: DispatchBoardProps) {
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const pendingLoads = loads.filter((load) => load.status === "pending")
  const assignedLoads = loads.filter((load) => load.status === "assigned")
  const inTransitLoads = loads.filter((load) => load.status === "in_transit")
  const completedLoads = loads.filter((load) => load.status === "completed")

  const handleLoadClick = (load: Load) => {
    setSelectedLoad(load)
    setIsDetailsOpen(true)
  }

  // Map vehicles to match LoadDetailsDialog expected type
  const mappedVehicles = vehicles.map((v) => ({
    ...v,
    make: v.make as ReactNode,
    model: v.model ?? "",
  }))

  return (
    <div className="space-y-6 mt-6">
    

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid grid-cols-5 w-full min-w-[500px] bg-zinc-800 rounded-md p-1">
            <TabsTrigger value="all" className={activeTab === "all" ? "font-bold border-b-2 border-primary bg-zinc-900" : ""}>
              All <Badge className={`ml-2 ${activeTab === "all" ? "bg-primary text-white" : "bg-zinc-900 text-white"}`}>{loads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className={activeTab === "pending" ? "font-bold border-b-2 border-yellow-500 bg-zinc-900" : ""}>
              Pending <Badge className={`ml-2 ${activeTab === "pending" ? "bg-yellow-500 text-black" : "bg-yellow-500/30 text-yellow-200"}`}>{pendingLoads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assigned" className={activeTab === "assigned" ? "font-bold border-b-2 border-blue-500 bg-zinc-900" : ""}>
              Assigned <Badge className={`ml-2 ${activeTab === "assigned" ? "bg-blue-500 text-white" : "bg-blue-500/30 text-blue-200"}`}>{assignedLoads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_transit" className={activeTab === "in_transit" ? "font-bold border-b-2 border-indigo-500 bg-zinc-900" : ""}>
              In Transit <Badge className={`ml-2 ${activeTab === "in_transit" ? "bg-indigo-500 text-white" : "bg-indigo-500/30 text-indigo-200"}`}>{inTransitLoads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className={activeTab === "completed" ? "font-bold border-b-2 border-green-500 bg-zinc-900" : ""}>
              Completed <Badge className={`ml-2 ${activeTab === "completed" ? "bg-green-500 text-white" : "bg-green-500/30 text-green-200"}`}>{completedLoads.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loads.length > 0 ? (
              loads.map((load) => <LoadCard key={load.id} load={load} onClick={() => handleLoadClick(load)} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No loads found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingLoads.length > 0 ? (
              pendingLoads.map((load) => <LoadCard key={load.id} load={load} onClick={() => handleLoadClick(load)} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No pending loads found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assigned" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedLoads.length > 0 ? (
              assignedLoads.map((load) => <LoadCard key={load.id} load={load} onClick={() => handleLoadClick(load)} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No assigned loads found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_transit" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inTransitLoads.length > 0 ? (
              inTransitLoads.map((load) => <LoadCard key={load.id} load={load} onClick={() => handleLoadClick(load)} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No in-transit loads found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedLoads.length > 0 ? (
              completedLoads.map((load) => <LoadCard key={load.id} load={load} onClick={() => handleLoadClick(load)} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No completed loads found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Load Form Dialog for New Load */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <LoadForm drivers={drivers} vehicles={vehicles} />
        </DialogContent>
      </Dialog>
      {/* Load Details Dialog for selected load */}
      {selectedLoad && (
        <LoadDetailsDialog
          load={selectedLoad}
          drivers={drivers}
          vehicles={mappedVehicles}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false)
            setSelectedLoad(null)
          }}
        />
      )}
    </div>
  )
}
