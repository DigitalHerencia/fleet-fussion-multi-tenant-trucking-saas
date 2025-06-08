'use server';

import { auth } from '@clerk/nextjs/server';
import { getDashboardSummary } from '@/lib/fetchers/analyticsFetchers';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function exportAnalyticsReport(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const orgId = formData.get('orgId');
  const timeRange = (formData.get('timeRange') as string) || '30d';
  const format = (formData.get('format') as string) || 'csv';
  const driverId = formData.get('driver') as string | null;

  if (!orgId || typeof orgId !== 'string') {
    return new Response('Organization ID is required', { status: 400 });
  }

  const filters = driverId ? { driverId } : {};
  const summary = await getDashboardSummary(orgId, timeRange, filters);

  const rows = [
    ['Metric', 'Value'],
    ['Total Revenue', summary.totalRevenue.toString()],
    ['Total Miles', summary.totalMiles.toString()],
    ['Total Loads', summary.totalLoads.toString()],
    ['Active Drivers', summary.activeDrivers.toString()],
    ['Active Vehicles', summary.activeVehicles.toString()],
    [
      'Avg Revenue per Mile',
      summary.averageRevenuePerMile.toFixed(2),
    ],
  ];

  if (format === 'pdf') {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const { width, height } = page.getSize();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let y = height - 40;
    page.drawText('Analytics Report', { x: 50, y, size: 18, font });
    y -= 30;
    rows.slice(1).forEach(row => {
      page.drawText(`${row[0]}: ${row[1]}`, { x: 50, y, size: 12, font });
      y -= 16;
    });
    const pdfBytes = await doc.save();
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="analytics-report.pdf"',
      },
    });
  }

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = rows.map(row => row.map(escape).join(',')).join('\n');

  const fileName = `analytics-report-${new Date()
    .toISOString()
    .split('T')[0]}.${format}`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
