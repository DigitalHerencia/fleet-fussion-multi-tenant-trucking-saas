import  ComplianceDocuments from "./compliance-documents";
import { getComplianceDocumentData } from "@/lib/fetchers/compliance";
import type { ComplianceDocument } from "@/types/compliance";

export default async function ComplianceDocumentsServer({ companyId }: { companyId: string }) {
  // Fetch documents server-side
  const rawDocuments = await getComplianceDocumentData(companyId);
  // Normalize lastUpdated to always be a string
  const documents: ComplianceDocument[] = rawDocuments.map((doc: any) => ({
    ...doc,
    lastUpdated: doc.lastUpdated ?? "",
  }));
  return <ComplianceDocuments documents={documents} />;
}
