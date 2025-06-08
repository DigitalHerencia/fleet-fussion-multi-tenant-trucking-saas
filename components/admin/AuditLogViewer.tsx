import { getAuditLogs } from '@/lib/fetchers/adminFetchers';

export async function AuditLogViewer({ orgId }: { orgId: string }) {
  const logs = await getAuditLogs(orgId);
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit logs found.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left">
          <th className="px-2 py-1">User</th>
          <th className="px-2 py-1">Action</th>
          <th className="px-2 py-1">Target</th>
          <th className="px-2 py-1">Date</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id} className="border-t">
            <td className="px-2 py-1 font-mono">{log.userId}</td>
            <td className="px-2 py-1">{log.action}</td>
            <td className="px-2 py-1">{log.target}</td>
            <td className="px-2 py-1">
              {new Date(log.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
