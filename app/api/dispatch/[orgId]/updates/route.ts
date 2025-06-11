import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/database/db';

// GET /api/dispatch/[orgId]/updates - Polling endpoint
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
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    // Check if user belongs to organization
    const user = await db.user.findFirst({
      where: { clerkId: userId, organizationId: orgId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build where clause for updates since last check
    const where: any = {
      organizationId: orgId,
    };

    if (since) {
      where.updatedAt = {
        gt: new Date(since),
      };
    } else {
      // If no timestamp, get updates from last 5 minutes
      where.updatedAt = {
        gt: new Date(Date.now() - 5 * 60 * 1000),
      };
    }

    // Get recent load updates
    const recentLoads = await db.load.findMany({
      where,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        referenceNumber: true,
        customerName: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 100, // Limit to recent updates
    });

    // Format updates
    const updates = recentLoads.map(load => ({
      type: 'load_update',
      data: {
        loadId: load.id,
        load: {
          id: load.id,
          status: load.status,
          referenceNumber: load.referenceNumber,
          customerName: load.customerName,
          driver: load.driver,
          vehicle: load.vehicle,
        },
        timestamp: load.updatedAt.toISOString(),
      },
    }));

    return NextResponse.json({
      updates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching dispatch updates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
