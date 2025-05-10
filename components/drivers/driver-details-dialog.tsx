import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Driver } from "@/types/types"
import React from "react"
import { Button } from "@/components/ui/button"

interface DriverDetailsDialogProps {
    driver: Driver
    isOpen: boolean
    onClose: () => void
    children?: React.ReactNode
}

export function DriverDetailsDialog({
    driver,
    isOpen,
    onClose,
    children
}: DriverDetailsDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {driver.firstName} {driver.lastName}
                    </DialogTitle>
                    <DialogDescription>Status: {driver.status}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-4 mt-4">
                        {/* Additional driver details can go here */}
                    </TabsContent>
                    <TabsContent value="documents" className="space-y-4 mt-4">
                        {children}
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
