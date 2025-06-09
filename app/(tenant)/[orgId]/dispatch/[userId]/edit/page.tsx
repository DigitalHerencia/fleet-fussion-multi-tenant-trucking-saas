import { LoadForm } from '@/components/dispatch/load-form';
import { getLoadById } from '@/lib/actions/dispatchActions';

interface PageProps {
  params: { orgId: string; userId: string };
  searchParams: { id?: string };
}

// Add index signature to allow string indexing
export type Dispatches = Record<
  string,
  {
    id: string;
    referenceNumber: string;
    status: string;
    customerName: string;
    customerContact: string;
    customerPhone: string;
    customerEmail: string;
    // ...other properties...
    trailerId: string;
  }
>;

export default async function EditLoadPage({
  params,
  searchParams,
}: PageProps) {
  const loadId = searchParams.id;
  if (!loadId) {
    return <div className="mt-6">Load not found</div>;
  }

  const result = await getLoadById(params.orgId, loadId);

  if (!result.success || !result.data) {
    return (
      <div className="mt-6 text-red-500">
        Error: {result.error || 'Load not found'}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <LoadForm drivers={[]} vehicles={[]} load={result.data} />
    </div>
  );
}
