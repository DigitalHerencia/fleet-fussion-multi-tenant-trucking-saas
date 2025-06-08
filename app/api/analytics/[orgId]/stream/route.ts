import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getDashboardSummary } from '@/lib/fetchers/analyticsFetchers';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const orgId = params.orgId;
  const searchParams = req.nextUrl.searchParams;
  const timeRange = searchParams.get('timeRange') || '30d';
  const driver = searchParams.get('driver');
  const filters = driver ? { driverId: driver } : {};

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const data = await getDashboardSummary(orgId, timeRange, filters);
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      await send();
      const interval = setInterval(send, 10000);
      this.interval = interval;
    },
    cancel() {
      clearInterval((this as any).interval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
