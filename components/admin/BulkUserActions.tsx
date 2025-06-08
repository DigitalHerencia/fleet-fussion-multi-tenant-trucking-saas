import { Button } from '@/components/ui/button';
import { inviteUsersAction, activateUsersAction, deactivateUsersAction } from '@/lib/actions/adminActions';

export function BulkUserActions({ orgId }: { orgId: string }) {
  const invite = inviteUsersAction.bind(null, orgId);
  const activate = activateUsersAction.bind(null, orgId);
  const deactivate = deactivateUsersAction.bind(null, orgId);
  return (
    <div className="flex gap-2">
      <form action={invite}>
        <Button type="submit" variant="outline">
          Invite
        </Button>
      </form>
      <form action={activate}>
        <Button type="submit" variant="outline">
          Activate
        </Button>
      </form>
      <form action={deactivate}>
        <Button type="submit" variant="outline">
          Deactivate
        </Button>
      </form>
    </div>
  );
}
