import { Badge } from "@/components/ui/badge"

export type StatusBadgeType =
    | "active"
    | "inactive"
    | "on_leave"
    | "pending"
    | "assigned"
    | "in_transit"
    | "completed"
    | "cancelled"
    | "maintenance"
    | string

interface StatusBadgeProps {
    status: StatusBadgeType
    className?: string
}

const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-800 hover:bg-green-200",
    inactive: "bg-red-100 text-red-800 hover:bg-red-200",
    on_leave: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    assigned: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    in_transit: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
    maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    default: "bg-gray-100 text-gray-800 hover:bg-gray-200"
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const style = statusStyles[status] || statusStyles.default
    return (
        <Badge className={`${style} ${className ?? ""}`.trim()}>
            {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
    )
}
