"use client";

import React, { useRef, useState } from "react";
import { saveUploadedDocument } from "@/lib/actions/fileUploadActions";
import { upload } from "@vercel/blob/client";

export function DocumentUploadForm({ onUpload }: { onUpload: (file: File, metadata: any) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type/size (example: max 10MB, PDF/JPG/PNG)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }
    if (!/\.(pdf|jpg|jpeg|png)$/i.test(file.name)) {
      setError("Invalid file type. Only PDF, JPG, PNG allowed.");
      return;
    }
    setUploading(true);
    try {
      const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      const { url } = await upload(file.name, file, { access: "public", token });
      const result = await saveUploadedDocument({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url,
        entityType: "company", // TODO: make dynamic
        entityId: "demo-entity-id", // TODO: make dynamic
        documentType: "other",
      });
      if (result.success && 'data' in result) {
        onUpload(file, result.data);
      } else if ('error' in result) {
        setError(result.error || "Upload failed");
      } else {
        setError("Upload failed");
      }
    } catch (err) {
      setError("Upload error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Uploading...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </form>
  );
}
