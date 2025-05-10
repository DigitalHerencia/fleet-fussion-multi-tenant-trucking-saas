"use client";
/**
 * ComplianceDocuments component
 *
 * Displays a list of compliance documents with search, filter, upload, and preview functionality.
 * Integrates with backend actions for document creation and fetchers for data retrieval.
 *
 * Props:
 * - documents: ComplianceDocument[] — List of compliance documents to display
 *
 * Usage:
 * ```tsx
 * <ComplianceDocuments documents={documents} />
 * ```
 */
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, FileText } from "lucide-react"
import { createComplianceDocument } from "@/lib/actions/compliance-actions"
import type { ComplianceDocument } from "@/types/types"

interface ComplianceDocumentsProps {
    documents: ComplianceDocument[]
}

export default function ComplianceDocuments({
    documents: initialDocuments
}: ComplianceDocumentsProps) {
    const [documents, setDocuments] = useState(initialDocuments)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("")
    const [showUpload, setShowUpload] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filteredDocs = documents.filter(doc => {
        const matchesSearch =
            doc.name.toLowerCase().includes(search.toLowerCase()) ||
            doc.type.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter ? doc.type === filter : true
        return matchesSearch && matchesFilter
    })

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const res = await createComplianceDocument(formData)
        if (res.success) {
            setShowUpload(false)
            window.location.reload()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-col md:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input w-full md:w-64"
                    />
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="input"
                    >
                        <option value="">All Types</option>
                        <option value="Required">Required</option>
                        <option value="Optional">Optional</option>
                    </select>
                </div>
                <Button onClick={() => setShowUpload(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </div>
            {showUpload && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <form
                        className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md"
                        onSubmit={handleUpload}
                    >
                        <h3 className="text-lg font-semibold">Upload Compliance Document</h3>
                        <input
                            name="documentType"
                            placeholder="Document Name"
                            className="input w-full"
                            required
                        />
                        <select name="type" className="input w-full" required>
                            <option value="Required">Required</option>
                            <option value="Optional">Optional</option>
                        </select>
                        <input name="expiryDate" type="date" className="input w-full" />
                        <input
                            name="file"
                            type="file"
                            ref={fileInputRef}
                            className="input w-full"
                            required
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowUpload(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Upload</Button>
                        </div>
                    </form>
                </div>
            )}
            <div className="grid gap-4">
                {filteredDocs.map(doc => {
                    let expiring = false
                    let expired = false
                    if (doc.expirationDate) {
                        const exp = new Date(doc.expirationDate)
                        const now = new Date()
                        expired = exp < now
                        expiring =
                            !expired && (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30
                    }
                    return (
                        <div
                            key={doc.id}
                            className="border rounded-md p-4 flex justify-between items-center"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <h3 className="font-medium">{doc.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Last updated:{" "}
                                        {doc.lastUpdated
                                            ? new Date(doc.lastUpdated).toLocaleDateString()
                                            : "-"}
                                    </p>
                                    {doc.expirationDate && (
                                        <span
                                            className={`text-xs ml-2 ${expired ? "text-red-600" : expiring ? "text-amber-600" : "text-green-600"}`}
                                        >
                                            {expired
                                                ? "Expired"
                                                : expiring
                                                  ? "Expiring Soon"
                                                  : "Valid"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={
                                        doc.status === "Complete"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-amber-100 text-amber-800"
                                    }
                                >
                                    {doc.status}
                                </Badge>
                                {doc.fileUrl && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPreviewUrl(doc.fileUrl!)}
                                        title="Preview Document"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                )}
                                {doc.fileUrl && (
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Download Document"
                                    >
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            {previewUrl && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setPreviewUrl(null)}
                        >
                            ×
                        </Button>
                        {typeof previewUrl === "string" && previewUrl.match(/\.(pdf)$/i) ? (
                            <iframe src={previewUrl} className="w-full h-[60vh]" />
                        ) : typeof previewUrl === "string" &&
                          previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                                src={previewUrl || undefined}
                                alt="Document Preview"
                                className="max-w-full max-h-[60vh] mx-auto"
                            />
                        ) : (
                            <p>Preview not available for this file type.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
