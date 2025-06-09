import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAdvancedAnalytics } from '@/lib/fetchers/analyticsFetchers';

interface ExportRequest {
  format: 'pdf' | 'excel' | 'csv';
  filters: any;
  metrics?: string[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await params;
    const body: ExportRequest = await request.json();
    const { format, filters, metrics } = body;

    // Get analytics data
    const analyticsData = await getAdvancedAnalytics(orgId, filters);

    // Generate export based on format
    switch (format) {
      case 'csv':
        return generateCSVExport(analyticsData, metrics);
      case 'excel':
        return generateExcelExport(analyticsData, metrics);
      case 'pdf':
        return generatePDFExport(analyticsData, metrics);
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function generateCSVExport(data: any, metrics?: string[]) {
  const csvData = convertToCSV(data.current || [], metrics);
  
  return new NextResponse(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.csv"`,
    },
  });
}

async function generateExcelExport(data: any, metrics?: string[]) {
  // Dynamically import XLSX to avoid ESM/CJS issues in Next.js API routes
  const XLSX = (await import('xlsx')).default;
  const workbook = XLSX.utils.book_new();
  
  // Add main data sheet
  const mainData = prepareDataForExport(data.current || [], metrics);
  const mainSheet = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Analytics Data');
  
  // Add comparison data if available
  if (data.previous) {
    const comparisonData = prepareDataForExport(data.previous, metrics);
    const comparisonSheet = XLSX.utils.json_to_sheet(comparisonData);
    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Previous Period');
  }
  
  // Add summary sheet
  if (data.comparison) {
    const summaryData = [
      { metric: 'Revenue Change', value: `${data.comparison.revenueChange?.percentage || 0}%` },
      { metric: 'Loads Change', value: `${data.comparison.loadsChange?.percentage || 0}%` },
      { metric: 'Miles Change', value: `${data.comparison.milesChange?.percentage || 0}%` },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="analytics-export-${Date.now()}.xlsx"`,
    },
  });
}

async function generatePDFExport(data: any, metrics?: string[]) {
  // For now, return a simple text-based PDF
  // In production, you'd use a library like Puppeteer or jsPDF
  const reportContent = generateReportContent(data, metrics);
  
  return new NextResponse(reportContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="analytics-report-${Date.now()}.txt"`,
    },
  });
}

function convertToCSV(data: any[], metrics?: string[]): string {
  if (!data.length) return '';
  
  const processedData = prepareDataForExport(data, metrics);
  const headers = Object.keys(processedData[0]).join(',');
  const rows = processedData.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

function prepareDataForExport(data: any[], metrics?: string[]) {
  return data.map(item => {
    const exportItem: any = {
      Date: item.date,
      Revenue: `$${item.revenue?.toFixed(2) || 0}`,
      Loads: item.loads || 0,
      Miles: item.miles || 0,
      'Drivers Count': item.drivers || 0,
      'Vehicles Count': item.vehicles || 0,
      'Customers Count': item.customers || 0,
      'Revenue per Mile': `$${item.revenuePerMile?.toFixed(2) || 0}`,
    };
    
    // Filter by requested metrics if specified
    if (metrics && metrics.length > 0) {
      const filteredItem: any = {};
      metrics.forEach(metric => {
        const key = formatMetricKey(metric);
        if (exportItem[key] !== undefined) {
          filteredItem[key] = exportItem[key];
        }
      });
      return Object.keys(filteredItem).length > 0 ? filteredItem : exportItem;
    }
    
    return exportItem;
  });
}

function formatMetricKey(metricId: string): string {
  const metricMap: Record<string, string> = {
    revenue: 'Revenue',
    loads: 'Loads', 
    miles: 'Miles',
    drivers: 'Drivers Count',
    vehicles: 'Vehicles Count',
    customers: 'Customers Count',
    revenue_per_mile: 'Revenue per Mile',
  };
  
  return metricMap[metricId] || metricId;
}

function generateReportContent(data: any, metrics?: string[]): string {
  const lines = [
    'ANALYTICS REPORT',
    '================',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Time Period: ${data.timeRange?.from} to ${data.timeRange?.to}`,
    '',
  ];
  
  if (data.current) {
    lines.push('CURRENT PERIOD DATA:');
    lines.push('-------------------');
    data.current.forEach((item: any) => {
      lines.push(`Date: ${item.date}`);
      lines.push(`  Revenue: $${item.revenue?.toFixed(2) || 0}`);
      lines.push(`  Loads: ${item.loads || 0}`);
      lines.push(`  Miles: ${item.miles || 0}`);
      lines.push('');
    });
  }
  
  if (data.comparison) {
    lines.push('COMPARISON WITH PREVIOUS PERIOD:');
    lines.push('--------------------------------');
    lines.push(`Revenue Change: ${data.comparison.revenueChange?.percentage || 0}%`);
    lines.push(`Loads Change: ${data.comparison.loadsChange?.percentage || 0}%`);
    lines.push(`Miles Change: ${data.comparison.milesChange?.percentage || 0}%`);
    lines.push('');
  }
  
  return lines.join('\n');
}
