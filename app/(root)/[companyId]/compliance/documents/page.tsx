import { getComplianceDocuments } from "@/lib/fetchers/compliance-documents";
import ComplianceDocuments from "@/features/compliance/ComplianceDocuments";
import { getCurrentCompanyId } from "@/lib/auth";

export default async function ComplianceDocumentsPage() {
  const companyId = await getCurrentCompanyId();
  if (!companyId) return <div className="p-8">No company selected.</div>;
  const documents = await getComplianceDocuments({ companyId });
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Compliance Documents</h1>
      <ComplianceDocuments documents={documents} />
    </div>
  );
}
