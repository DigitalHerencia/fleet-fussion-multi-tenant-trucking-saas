"use client";

import { useState, useEffect } from "react";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { getVehiclesForCompany } from "@/lib/fetchers/vehicles";
import { getDriversForCompany } from "@/lib/fetchers/drivers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { IftaReportTable } from "./ifta-report-table";
import { IftaTripTable } from "./ifta-trip-table";
import {
  BarChart,
  Calendar,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react";
import { FuelPurchaseForm } from "@/features/ifta/FuelPurchaseForm";

export function IftaDashboard() {
  const [quarter, setQuarter] = useState("2023-Q2");
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [vehicles, setVehicles] = useState<{ id: string; unitNumber: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const { companyId } = useCurrentCompany();

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const v = await getVehiclesForCompany(Number(companyId));
        setVehicles(
          v.map((veh: any) => ({ id: veh.id, unitNumber: veh.unitNumber }))
        );
        const d = await getDriversForCompany(Number(companyId));
        setDrivers(
          d.map((drv: any) => ({ id: drv.id, name: drv.firstName + " " + drv.lastName }))
        );
      } catch (err) {
        // Optionally handle error
      }
    })();
  }, [companyId]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <label htmlFor="quarter">Quarter:</label>
        <select
          id="quarter"
          value={quarter}
          onChange={e => setQuarter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="2023-Q1">2023-Q1</option>
          <option value="2023-Q2">2023-Q2</option>
          <option value="2023-Q3">2023-Q3</option>
          <option value="2023-Q4">2023-Q4</option>
        </select>
        <button
          className="ml-2 px-3 py-1 bg-primary text-white rounded"
          onClick={() => setShowFuelModal(true)}
        >
          Add Fuel
        </button>
      </div>
      <div>
        <h3 className="font-semibold">Vehicles</h3>
        <ul className="list-disc ml-6">
          {vehicles.map((v) => (
            <li key={v.id}>{v.unitNumber}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Drivers</h3>
        <ul className="list-disc ml-6">
          {drivers.map((d) => (
            <li key={d.id}>{d.name}</li>
          ))}
        </ul>
      </div>
      {showFuelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h4 className="font-bold mb-2">Add Fuel Entry</h4>
            <button className="mt-4 px-3 py-1 bg-gray-200 rounded" onClick={() => setShowFuelModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
