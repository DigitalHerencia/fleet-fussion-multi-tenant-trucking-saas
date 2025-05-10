"use client"

import { useEffect, useState } from "react"
import { getAuditLogs } from "@/lib/fetchers/auditlog"

export function AuditLogList({ companyId }: { companyId: string }) {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true)
            const data = await getAuditLogs(companyId)
            setLogs(data)
            setLoading(false)
        }
        fetchLogs()
    }, [companyId])

    if (loading) return <div>Loading audit logs...</div>

    return (
        <div className="space-y-2">
            <h3 className="font-bold">Audit Logs</h3>
            <ul className="divide-y">
                {logs.map(log => (
                    <li key={log.id} className="py-2 text-xs">
                        <span className="font-mono text-muted-foreground">{log.createdAt}</span>{" "}
                        &mdash; <b>{log.action}</b>{" "}
                        {log.targetTable && (
                            <>
                                on <span className="font-mono">{log.targetTable}</span>
                            </>
                        )}{" "}
                        {log.details && (
                            <span className="text-muted-foreground">
                                ({JSON.stringify(log.details)})
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
