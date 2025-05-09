import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Driver } from "@/types/types"
import React from "react"

interface DriverDetailsDialogProps {
  driver: Driver
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
}

export function DriverDetailsDialog({ driver, isOpen, onClose, children }: DriverDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="font-bold text-lg">{driver.firstName} {driver.lastName}</div>
            <div className="text-muted-foreground">Status: {driver.status}</div>
          </TabsContent>
          <TabsContent value="documents" className="space-y-4 mt-4">
            {children}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
