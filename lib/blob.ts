// lib/blob.ts
import { put } from "@vercel/blob";

/**
 * Uploads a file to Vercel Blob Storage and returns the blob URL.
 * @param file - The file to upload (from FormData)
 * @param path - The storage path (e.g., 'compliance-documents/')
 */
export async function uploadToVercelBlob(file: File, path: string = "compliance-documents/") {
  if (!file) throw new Error("No file provided");
  const blob = await put(path + file.name, file, { access: "public" });
  return blob.url;
}
