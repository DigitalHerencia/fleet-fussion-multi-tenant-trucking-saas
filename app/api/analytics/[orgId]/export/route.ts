import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import ExcelJS from 'exceljs';

interface MetricValue {
  current?: number;
  previous?: number;
  change?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await params;
    
    // TODO: Fetch actual analytics data from your database
    const data = {
      current: [], // Replace with actual data fetching
      previous: []
    };
    
    const metrics: Record<string, MetricValue> = {
      // Add your metrics structure here
    };

    const workbook = new ExcelJS.Workbook();

    // Main Data Sheet
    const mainData = prepareDataForExport(data.current || [], metrics);
    const mainSheet = workbook.addWorksheet('Analytics Data');
    
    if (mainData.length) {
      mainSheet.columns = Object.keys(mainData[0]).map(key => ({ 
        header: key, 
        key 
      }));
      mainData.forEach(row => mainSheet.addRow(row));
    }

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Metric', 'Current Period', 'Previous Period', 'Change']);
    
    // Add summary data rows here
    Object.entries(metrics).forEach(([key, value]) => {
      summarySheet.addRow([
        key,
        (value as MetricValue)?.current || 0,
        (value as MetricValue)?.previous || 0,
        (value as MetricValue)?.change || 0
      ]);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="analytics-${orgId}-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// Helper function to prepare data for export
function prepareDataForExport(
  data: any[], 
  metrics: Record<string, any>
): Record<string, any>[] {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => ({
    id: item.id || '',
    timestamp: item.timestamp || new Date().toISOString(),
    value: item.value || 0,
    category: item.category || 'Unknown',
    // Add more fields based on your data structure
    ...item
  }));
}