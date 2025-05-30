import { listDriversByOrg } from "@/lib/fetchers/driverFetchers";
import { DriverForm } from "@/components/drivers/DriverForm";

export default async function DriverListPage({ orgId }: { orgId: string }) {
  const drivers = await listDriversByOrg(orgId, {});
  // ...render driver list and form...
  return <div>{/* ...driver list... */}</div>;
}
