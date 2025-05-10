import { parse } from "json2csv"

export function exportToCSV<T>(data: T[], fields?: string[]): string {
    if (!data || data.length === 0) return ""
    const opts = fields ? { fields } : {}
    return parse(data, opts)
}
