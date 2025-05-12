"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "./company-settings";
import { UserSettings } from "./user-settings";
import { NotificationSettings } from "./notification-settings";
import { IntegrationSettings } from "./integration-settings";

// Loading component for Settings page

// Billing Settings

// Support Settings

// Main Settings Dashboard
export function SettingsDashboard() {
  return (
    <Tabs defaultValue="user" className="w-full">
      <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4">
        <TabsTrigger value="user">User Profile</TabsTrigger>
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
      </TabsList>
      <TabsContent value="user" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              Manage your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserSettings users={[]} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="company" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>
              Manage your company information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanySettings />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how and when you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="integrations" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect with third-party services and APIs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationSettings />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
