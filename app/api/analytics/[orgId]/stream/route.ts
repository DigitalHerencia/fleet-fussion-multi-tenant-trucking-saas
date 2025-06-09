import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getDashboardSummary } from '@/lib/fetchers/analyticsFetchers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { orgId } = await params;
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
      const intervalId = setInterval(send, 10000);
      (controller as any).intervalId = intervalId;
    },
    cancel() {
      const intervalId = (this as any).intervalId;
      if (intervalId) {
        clearInterval(intervalId);
      }
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
