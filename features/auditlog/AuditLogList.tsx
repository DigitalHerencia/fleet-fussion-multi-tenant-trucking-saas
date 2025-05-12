"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/fetchers/auditlog";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Define the AuditLog type for type safety
interface AuditLog {
  companyId: string;
  id: string;
  createdAt: Date | null;
  userId: string | null;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  details: unknown;
}

export function AuditLogList({ companyId }: { companyId: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const data = await getAuditLogs(companyId);
      setLogs(  data);
      setLoading(false);
    }
    fetchLogs();
  }, [companyId]);

  if (loading) return <LoadingSkeleton lines={4} />;

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Audit Logs</h3>
      <ul className="divide-y">
        {logs.map((log) => (
          <li key={log.id} className="py-2 text-xs">
            <span className="font-mono text-muted-foreground">
              {log.createdAt ?
                typeof log.createdAt === "string"
                  ? log.createdAt
                  : log.createdAt.toLocaleString()
                : ""}
            </span>{" "}
            &mdash; <b>{log.action}</b>{" "}
            {log.targetTable && (
              <>
                on <span className="font-mono">{log.targetTable}</span>
              </>
            )}{" "}
            
          </li>
        ))}
      </ul>
    </div>
  );
}
