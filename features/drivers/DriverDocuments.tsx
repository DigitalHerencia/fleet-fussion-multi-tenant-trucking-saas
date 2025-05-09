"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye } from "lucide-react"
import { uploadDocument } from "@/lib/actions/document-actions"
import type { Document } from "@/types/types"

interface DriverDocumentsProps {
  driverId: string
  documents: Document[]
}

export default function DriverDocuments({ driverId, documents: initialDocuments }: DriverDocumentsProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [showUpload, setShowUpload] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("driverId", driverId)
    const res = await uploadDocument(formData)
    if (res.success) {
      setShowUpload(false)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowUpload(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Upload Driver Document
      </Button>
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md" onSubmit={handleUpload}>
            <h3 className="text-lg font-semibold">Upload Driver Document</h3>
            <input name="name" placeholder="Document Name" className="input w-full" required />
            <input name="type" placeholder="Type (e.g. License)" className="input w-full" required />
            <input name="notes" placeholder="Notes" className="input w-full" />
            <input name="file" type="file" ref={fileInputRef} className="input w-full" required />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </div>
      )}
      <div className="grid gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="border rounded-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-sm text-muted-foreground">{doc.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {doc.fileUrl && (
                <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(doc.fileUrl!)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title={`Download ${doc.name}`}>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setPreviewUrl(null)}>
              ×
            </Button>
            {previewUrl.match(/\.(pdf)$/i) ? (
              <iframe src={previewUrl} className="w-full h-[60vh]" />
            ) : previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img src={previewUrl} alt="Document Preview" className="max-w-full max-h-[60vh] mx-auto" />
            ) : (
              <p>Preview not available for this file type.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
