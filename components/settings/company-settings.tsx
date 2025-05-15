"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  UserPlus,
  Trash2,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  getCompanyDetails,
  updateCompany,
  inviteOrganizationMember,
  deleteCompany,
  getUserRole,
} from "@/lib/actions/company-actions";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { CompanyUser } from "@/types/types";

export function CompanySettings() {
  const { toast } = useToast();
  const { user, organization } = useAuth();

  const [formState, setFormState] = useState({
    name: "",
    dotNumber: "",
    mcNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    primaryColor: "#0f766e",
  });

  return (
    <form className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="font-bold text-lg mb-2">Company Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border rounded px-2 py-1"
          placeholder="Company Name"
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="DOT Number"
          value={formState.dotNumber}
          onChange={(e) =>
            setFormState({ ...formState, dotNumber: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="MC Number"
          value={formState.mcNumber}
          onChange={(e) =>
            setFormState({ ...formState, mcNumber: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Address"
          value={formState.address}
          onChange={(e) =>
            setFormState({ ...formState, address: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="City"
          value={formState.city}
          onChange={(e) =>
            setFormState({ ...formState, city: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="State"
          value={formState.state}
          onChange={(e) =>
            setFormState({ ...formState, state: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="ZIP"
          value={formState.zip}
          onChange={(e) => setFormState({ ...formState, zip: e.target.value })}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Phone"
          value={formState.phone}
          onChange={(e) =>
            setFormState({ ...formState, phone: e.target.value })
          }
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Email"
          value={formState.email}
          onChange={(e) =>
            setFormState({ ...formState, email: e.target.value })
          }
        />
        <div className="flex items-center gap-2">
          <label htmlFor="primaryColor">Primary Color:</label>
          <input
            id="primaryColor"
            type="color"
            value={formState.primaryColor}
            onChange={(e) =>
              setFormState({ ...formState, primaryColor: e.target.value })
            }
          />
        </div>
      </div>
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </form>
  );
}
