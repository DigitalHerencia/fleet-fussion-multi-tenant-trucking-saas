import {AuditLogList} from "@/features/auditlog/AuditLogList";

export default function AuditLogPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
      <AuditLogList companyId={ "" } />
    </main>
  );
}
