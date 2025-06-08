'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

import type { Vehicle } from '@/types/vehicles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/vehicles/vehicle-card';

import AddVehicleDialog from './add-vehicle-dialog';

interface Props {
  orgId: string;
  initialVehicles: Vehicle[];
}

export default function VehicleListClient({ orgId, initialVehicles }: Props) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = vehicles.filter(v =>
    [v.unitNumber, v.vin, v.make, v.model]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAdd = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start space-y-2">
          <h1 className="text-2xl font-bold">Fleet Vehicles</h1>
          <p className="text-muted-foreground text-sm">
            Manage your fleet vehicles
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <div className="relative w-full md:w-auto">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Search vehicles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 md:w-[250px]"
            />
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          No vehicles found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => (
            <VehicleCard key={v.id} vehicle={v} onClick={() => {}} />
          ))}
        </div>
      )}
      <AddVehicleDialog
        orgId={orgId}
        onSuccess={handleAdd}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
