import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/database/db';

export const runtime = 'nodejs';

// GET /api/dispatch/[orgId]/stream - Server-Sent Events endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { orgId } = await params;
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');

  // Check if user belongs to organization
  const user = await db.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
  });

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectionMsg = JSON.stringify({
        type: 'connected',
        data: {
          timestamp: new Date().toISOString(),
          orgId,
        },
      });
      controller.enqueue(encoder.encode(`data: ${connectionMsg}\n\n`));

      let lastCheck = since ? new Date(since) : new Date();

      const sendUpdates = async () => {
        try {
          const now = new Date();
          
          // Get loads updated since last check
          const updatedLoads = await db.load.findMany({
            where: {
              organizationId: orgId,
              updatedAt: {
                gt: lastCheck,
              },
            },
            select: {
              id: true,
              status: true,
              referenceNumber: true,
              customerName: true,
              origin: true,
              destination: true,
              scheduledPickupDate: true,
              scheduledDeliveryDate: true,
              updatedAt: true,
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
                  make: true,
                  model: true,
                },
              },
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 50,
          });

          // Send load updates
          for (const load of updatedLoads) {
            const update = JSON.stringify({
              type: 'load_update',
              data: {
                loadId: load.id,
                load: {
                  id: load.id,
                  status: load.status,
                  referenceNumber: load.referenceNumber,
                  customerName: load.customerName,
                  origin: load.origin,
                  destination: load.destination,
                  scheduledPickupDate: load.scheduledPickupDate?.toISOString(),
                  scheduledDeliveryDate: load.scheduledDeliveryDate?.toISOString(),
                  driver: load.driver,
                  vehicle: load.vehicle,
                },
                timestamp: load.updatedAt.toISOString(),
              },
            });
            controller.enqueue(encoder.encode(`data: ${update}\n\n`));
          }

          // Get system alerts
          const criticalAlerts = await getCriticalDispatchAlerts(orgId);
          for (const alert of criticalAlerts) {
            const alertMsg = JSON.stringify({
              type: 'alert',
              level: alert.severity,
              message: alert.message,
              data: {
                loadId: alert.loadId,
                alertType: alert.type,
                timestamp: alert.timestamp.toISOString(),
              },
            });
            controller.enqueue(encoder.encode(`data: ${alertMsg}\n\n`));
          }

          lastCheck = now;
        } catch (error) {
          console.error('Error sending dispatch updates:', error);
          const errorMsg = JSON.stringify({
            type: 'error',
            message: 'Failed to fetch dispatch updates',
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(encoder.encode(`data: ${errorMsg}\n\n`));
        }
      };

      // Send initial updates
      sendUpdates();

      // Send updates every 30 seconds
      const interval = setInterval(sendUpdates, 30000);

      // Send heartbeat every 5 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        const heartbeatMsg = JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`data: ${heartbeatMsg}\n\n`));
      }, 5000);

      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Helper function to get critical dispatch alerts
async function getCriticalDispatchAlerts(orgId: string) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  type DispatchAlert = {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    loadId: string;
    timestamp: Date;
  };

  const alerts: DispatchAlert[] = [];

  try {
    // Overdue pickups
    const overduePickups = await db.load.findMany({
      where: {
        organizationId: orgId,
        status: 'assigned',
        scheduledPickupDate: {
          lt: today,
        },
      },
      select: {
        id: true,
        referenceNumber: true,
        customerName: true,
        scheduledPickupDate: true,
      },
      take: 5,
    });

    overduePickups.forEach(load => {
      alerts.push({
        type: 'overdue_pickup',
        severity: 'high',
        message: `Load ${load.referenceNumber} pickup is overdue`,
        loadId: load.id,
        timestamp: new Date(),
      });
    });

    // Unassigned loads due soon
    const unassignedLoads = await db.load.findMany({
      where: {
        organizationId: orgId,
        status: 'pending',
        driverId: null,
        scheduledPickupDate: {
          lte: tomorrow,
        },
      },
      select: {
        id: true,
        referenceNumber: true,
        customerName: true,
        scheduledPickupDate: true,
      },
      take: 5,
    });

    unassignedLoads.forEach(load => {
      alerts.push({
        type: 'unassigned_load',
        severity: 'medium',
        message: `Load ${load.referenceNumber} needs driver assignment`,
        loadId: load.id,
        timestamp: new Date(),
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error fetching dispatch alerts:', error);
    return [];
  }
}
