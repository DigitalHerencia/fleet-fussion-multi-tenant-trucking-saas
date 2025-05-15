"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NotificationSettings() {
  const [emailSettings, setEmailSettings] = useState({
    dispatchUpdates: true,
    driverAssignments: true,
    loadCompletions: true,
    maintenanceAlerts: true,
    complianceReminders: true,
    financialReports: true,
    systemUpdates: false,
    marketingNews: false,
  });

  const [smsSettings, setSmsSettings] = useState({
    dispatchUpdates: false,
    driverAssignments: true,
    loadCompletions: false,
    maintenanceAlerts: true,
    complianceReminders: true,
    financialReports: false,
    systemUpdates: false,
    marketingNews: false,
  });

  const [appSettings, setAppSettings] = useState({
    dispatchUpdates: true,
    driverAssignments: true,
    loadCompletions: true,
    maintenanceAlerts: true,
    complianceReminders: true,
    financialReports: true,
    systemUpdates: true,
    marketingNews: false,
  });

  const [contactInfo, setContactInfo] = useState({
    email: "admin@cjexpress.com",
    phone: "(312) 555-1234",
  });

  const toggleEmailSetting = (setting: string) => {
    setEmailSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const toggleSmsSetting = (setting: string) => {
    setSmsSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const toggleAppSetting = (setting: string) => {
    setAppSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="font-bold text-lg mb-2">Notification Settings</h2>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(emailSettings).map(([key, value]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={() => setEmailSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            />
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
        ))}
      </div>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
