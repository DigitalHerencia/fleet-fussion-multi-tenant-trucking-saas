// Shared DocumentUpload component for document upload UI/logic reuse
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import React from "react"

interface DocumentUploadProps {
  label?: string
  description?: string
  onUpload?: () => void
  buttonText?: string
}

export function DocumentUpload({
  label = "Upload Document",
  description = "Add documents to keep track of important paperwork",
  onUpload,
  buttonText = "Upload",
}: DocumentUploadProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-1">
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={onUpload} type="button">
        <FileText className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

// Shared DocumentList placeholder for empty state
export function DocumentListEmpty({ message = "No documents uploaded yet", subtext = "Upload documents to keep track of important paperwork" }) {
  return (
    <div className="border rounded-md p-4">
      <div className="text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{message}</p>
        <p className="text-sm">{subtext}</p>
      </div>
    </div>
  )
}
