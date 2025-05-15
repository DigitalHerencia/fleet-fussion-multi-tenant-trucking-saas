// filepath: types/ifta-report.ts

// DEPRECATED: All types have been consolidated into types/types.ts. Please import from there.

/**
 * Shared type for IFTA reports
 */
export interface RawIftaReport {
  id: string;
  quarter: number;
  dueDate: string;
  status: string | null;
  totalMiles: number | null;
  totalGallons: number | null;
  reportData?: {
    taxPaid?: number;
  };
}
