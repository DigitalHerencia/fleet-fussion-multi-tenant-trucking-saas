import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Download, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { createComplianceDocument } from "@/lib/actions/compliance-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ComplianceDocument } from "@/types/types";

// Export the columns definition
export const columns: ColumnDef<ComplianceDocument>[] = [
  {
    accessorKey: "name",
    header: "Document Name",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: any }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "Required" ? "default" : "outline"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }: { row: any }) => {
      return (
        <div>{new Date(row.getValue("lastUpdated")).toLocaleDateString()}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className={
            status === "Complete"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-amber-100 text-amber-800 hover:bg-amber-100"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const fileUrl = row.original.fileUrl;
      // Use a custom event to trigger preview from the DataTable context
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {fileUrl && (
              <DropdownMenuItem
                onClick={() => {
                  const event = new CustomEvent("document-preview", {
                    detail: fileUrl,
                  });
                  window.dispatchEvent(event);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
            )}
            {fileUrl && (
              <DropdownMenuItem asChild>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ComplianceDocuments({ documents: initialDocuments }: { documents: ComplianceDocument[] }) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [assignedToFilter, setAssignedToFilter] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for the custom event to set previewUrl
  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<string>).detail;
      setPreviewUrl(url);
    };
    window.addEventListener("document-preview", handler as EventListener);
    return () =>
      window.removeEventListener("document-preview", handler as EventListener);
  }, []);

  // Dynamically generate filter options
  const typeOptions = Array.from(
    new Set(documents.map((doc) => doc.type)),
  ).filter(Boolean);
  const statusOptions = Array.from(
    new Set(documents.map((doc) => doc.status)),
  ).filter(Boolean);
  const assignedToOptions = Array.from(
    new Set(documents.map((doc) => doc.assignedTo)),
  ).filter(Boolean);

  // Filtered and searched documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.type.toLowerCase().includes(search.toLowerCase()) ||
      doc.status.toLowerCase().includes(search.toLowerCase()) ||
      (doc.assignedTo?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesType = typeFilter ? doc.type === typeFilter : true;
    const matchesStatus = statusFilter ? doc.status === statusFilter : true;
    const matchesAssignedTo = assignedToFilter
      ? doc.assignedTo === assignedToFilter
      : true;
    return matchesSearch && matchesType && matchesStatus && matchesAssignedTo;
  });

  // Handle file upload
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createComplianceDocument(formData);
    if (res.success) {
      setShowUpload(false);
      // Refresh document list
      fetch("/api/compliance/documents")
        .then((res) => res.json())
        .then((data) => setDocuments(data));
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
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full md:w-64"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="input"
          >
            <option value="">All Assignees</option>
            {assignedToOptions.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md"
            onSubmit={handleUpload}
          >
            <h3 className="text-lg font-semibold">
              Upload Compliance Document
            </h3>
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

      {/* Document list */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocs.map((doc) => {
            let expiring = false;
            let expired = false;
            if (doc["expirationDate"]) {
              const exp = new Date(doc["expirationDate"]);
              const now = new Date();
              expired = exp < now;
              expiring =
                !expired &&
                (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30;
            }
            return (
              <TableRow key={doc.id}>
                <TableCell>
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
                      {doc["expirationDate"] && (
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
                </TableCell>
                <TableCell>
                  <Badge
                    variant={doc.type === "Required" ? "default" : "outline"}
                  >
                    {doc.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {doc.lastUpdated
                    ? new Date(doc.lastUpdated).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      doc.status === "Complete"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>{doc.assignedTo}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {doc["fileUrl"] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewUrl(doc["fileUrl"] ?? null)}
                        title="Preview Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {doc["fileUrl"] && (
                      <a
                        href={doc["fileUrl"]}
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Preview Modal */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              Preview the selected document below. Close to return to the
              document list.
            </DialogDescription>
          </DialogHeader>
          {previewUrl &&
            (previewUrl.match(/\.(pdf)$/i) ? (
              <iframe src={previewUrl} className="w-full h-[60vh]" />
            ) : previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={previewUrl}
                alt="Document Preview"
                className="max-w-full max-h-[60vh] mx-auto"
              />
            ) : (
              <p>Preview not available for this file type.</p>
            ))}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewUrl(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
