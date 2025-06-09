import { notFound } from 'next/navigation';

import { LoadForm } from '@/components/dispatch/load-form';
import {
  getLoadDetails,
  getAvailableDriversForLoad,
  getAvailableVehiclesForLoad,
  getAvailableTrailersForLoad,
} from '@/lib/fetchers/dispatchFetchers';
import { getCurrentCompany } from '@/lib/auth/auth';

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

interface PageProps {
  params: Promise<{ orgId: string; userId: string }>;
  searchParams: { id?: string };
}

export default async function EditLoadPage({
  params,
  searchParams,
}: PageProps) {
  const { orgId } = await params;
  const loadId = searchParams?.id;

  const company = await getCurrentCompany();
  if (!company) {
    return <div>Company not found. Please create a company first.</div>;
  }

  if (!loadId) {
    return notFound();
  }

  const [load, driversRes, vehiclesRes, trailersRes] = await Promise.all([
    getLoadDetails(orgId, loadId),
    getAvailableDriversForLoad(orgId),
    getAvailableVehiclesForLoad(orgId, {}),
    getAvailableTrailersForLoad(orgId, {}),
  ]);

  if (!load) return notFound();

  const drivers = driversRes?.data || [];
  const vehicles = [
    ...(vehiclesRes?.data || []),
    ...(trailersRes?.data || []),
  ];

  return (
    <div className="mt-6">
      <LoadForm drivers={drivers} vehicles={vehicles} load={load} />
    </div>
  );
}
