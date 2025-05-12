"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Truck, Calendar, Gauge, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface Vehicle {
  id: string;
  unitNumber: string;
  make: string;
  model: string;
  year: number;
  status: string;
  type: string;
  vin?: string;
  licensePlate?: string;
  state?: string;
  currentOdometer?: number;
  lastOdometerUpdate?: Date;
  fuelType?: string;
  maintenanceRecords?: {
    status: string;
    scheduledDate?: Date;
    [key: string]: unknown;
  }[];
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const getTypeIcon = () => {
    return <Truck className="h-4 w-4 text-muted-foreground" />;
  };

  const upcomingMaintenance = vehicle.maintenanceRecords?.find(
    (record) => record.status === "scheduled" && record.scheduledDate,
  );

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <h3 className="font-medium">{vehicle.unitNumber}</h3>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {vehicle.make} {vehicle.model} {vehicle.year}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          {vehicle.vin && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">VIN:</span>
              <span className="font-mono">{vehicle.vin}</span>
            </div>
          )}
          {vehicle.licensePlate && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">License:</span>
              <span>
                {vehicle.licensePlate} ({vehicle.state})
              </span>
            </div>
          )}
          {vehicle.currentOdometer && (
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span>
                {vehicle.currentOdometer.toLocaleString()} miles
                {vehicle.lastOdometerUpdate && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (as of {formatDate(vehicle.lastOdometerUpdate)})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        {upcomingMaintenance ? (
          <div className="w-full flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
            <span className="text-yellow-700">
              Maintenance scheduled:{" "}
              {formatDate(upcomingMaintenance.scheduledDate!)}
            </span>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>No upcoming maintenance</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
