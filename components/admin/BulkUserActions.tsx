import { Button } from '@/components/ui/button';
import { inviteUsersAction, activateUsersAction, deactivateUsersAction } from '@/lib/actions/adminActions';

export function BulkUserActions({ orgId }: { orgId: string }) {
  // Wrap each action to accept FormData and return void as required by <form action={...}>
  const invite = async (formData: FormData) => {
    await inviteUsersAction(orgId, formData);
  };
  const activate = async (formData: FormData) => {
    await activateUsersAction(orgId, formData);
  };
  const deactivate = async (formData: FormData) => {
    await deactivateUsersAction(orgId, formData);
  };

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
