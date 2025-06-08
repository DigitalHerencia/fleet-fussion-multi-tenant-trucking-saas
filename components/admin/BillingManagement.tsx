import { Button } from '@/components/ui/button';
import { getBillingInfo } from '@/lib/fetchers/adminFetchers';

export async function BillingManagement({ orgId }: { orgId: string }) {
  const info = await getBillingInfo(orgId);
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Current Plan: {info.plan}</h4>
        <p className="text-muted-foreground text-sm">Status: {info.status}</p>
        <p className="text-muted-foreground text-sm">
          Period ends: {new Date(info.currentPeriodEnds).toLocaleDateString()}
        </p>
      </div>
      <Button>Manage Subscription</Button>
    </div>
  );
}
