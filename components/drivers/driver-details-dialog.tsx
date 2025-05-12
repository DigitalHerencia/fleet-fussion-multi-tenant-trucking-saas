import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import type { Driver } from "../../types/types"
import React from "react"
import { Button } from "../../components/ui/button"
import { DialogCard } from "../../components/ui/dialog-card"

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
        <DialogCard
            open={isOpen}
            onOpenChange={onClose}
            title={`${driver.firstName} ${driver.lastName}`}
            description={`Status: ${driver.status}`}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
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
        </DialogCard>
    )
}
