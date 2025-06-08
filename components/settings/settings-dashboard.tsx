'use client';

import type React from 'react';
import { CreditCard, HelpCircle } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CompanySettings } from './company-settings';
import { UserSettings } from './user-settings';
import { NotificationSettings } from './notification-settings';
import { IntegrationSettings } from './integration-settings';
import { BillingSettingsForm } from './billing-settings';
import { Button } from '../ui/button';
import { useUserContext } from '@/components/auth/context';

// Loading component for Settings page
function SettingsLoading() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
    </div>
  );
}

// Billing Settings
function BillingSettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h4 className="font-medium">Current Plan: Professional</h4>
              <p className="text-muted-foreground text-sm">
                $99/month, billed monthly
              </p>
            </div>
            <Button className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
              Change Plan
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Payment Method</h4>
          <div className="rounded-lg border p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-muted-foreground text-sm">
                    Expires 12/2025
                  </p>
                </div>
              </div>
              <Button className="ring-offset-background focus-visible:ring-ring text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Billing Address</h4>
          <div className="rounded-lg border p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p>C & J Express Inc.</p>
                <p>123 Trucking Way</p>
                <p>Atlanta, GA 30301</p>
              </div>
              <Button className="ring-offset-background focus-visible:ring-ring text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Billing History</h4>
          <div className="rounded-lg border">
            <div className="flex flex-col justify-between gap-2 border-b p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">Invoice #INV-2023-11</p>
                <p className="text-muted-foreground text-sm">
                  Nov 1, 2023 - $99.00
                </p>
              </div>
              <Button className="ring-offset-background focus-visible:ring-ring text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                Download
              </Button>
            </div>
            <div className="flex flex-col justify-between gap-2 border-b p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">Invoice #INV-2023-10</p>
                <p className="text-muted-foreground text-sm">
                  Oct 1, 2023 - $99.00
                </p>
              </div>
              <Button className="ring-offset-background focus-visible:ring-ring text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                Download
              </Button>
            </div>
            <div className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium">Invoice #INV-2023-09</p>
                <p className="text-muted-foreground text-sm">
                  Sep 1, 2023 - $99.00
                </p>
              </div>
              <Button className="ring-offset-background focus-visible:ring-ring text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Support Settings
function SupportSettings() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h4 className="font-medium">Contact Support</h4>
          <p className="text-muted-foreground mb-4 text-sm">
            Our support team is available Monday-Friday, 9am-5pm ET
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm">support@fleetfusion.com</p>
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm">(800) 555-FLEET</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="subject"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Subject
            </label>
            <input
              id="subject"
              placeholder="Brief description of your issue"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Message
            </label>
            <textarea
              id="message"
              placeholder="Please describe your issue in detail"
              rows={5}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Attachments
            </label>
            <div className="flex items-center gap-2">
              <input
                id="attachments"
                type="file"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
          >
            Submit Support Request
          </Button>
        </form>

        <div className="mt-6 rounded-lg border p-4">
          <h4 className="mb-2 font-medium">Documentation & Resources</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <a href="#" className="text-blue-600 hover:underline">
                User Guide
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <a href="#" className="text-blue-600 hover:underline">
                Video Tutorials
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <a href="#" className="text-blue-600 hover:underline">
                FAQs
              </a>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <a href="#" className="text-blue-600 hover:underline">
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Settings Dashboard
export function SettingsDashboard() {
  const user = useUserContext();
  const role = user?.role ?? 'viewer';
  const tabsByRole: Record<string, string[]> = {
    admin: ['user', 'company', 'notifications', 'integrations', 'billing'],
    dispatcher: ['user', 'company', 'notifications'],
    driver: ['user', 'notifications'],
    compliance_officer: ['company', 'notifications'],
    accountant: ['company', 'billing'],
    viewer: ['user'],
  };
  const allowedTabs = tabsByRole[role] || ['user'];

  return (
    <Tabs defaultValue={allowedTabs[0]} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5">
        {allowedTabs.includes('user') && (
          <TabsTrigger value="user">User Profile</TabsTrigger>
        )}
        {allowedTabs.includes('company') && (
          <TabsTrigger value="company">Company</TabsTrigger>
        )}
        {allowedTabs.includes('notifications') && (
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        )}
        {allowedTabs.includes('integrations') && (
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        )}
        {allowedTabs.includes('billing') && (
          <TabsTrigger value="billing">Billing</TabsTrigger>
        )}
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
            <UserSettings />
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
      <TabsContent value="billing" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>
              Manage subscription and payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BillingSettingsForm
              initial={{
                orgId: user?.organizationId || '',
                paymentMethod: '',
                subscriptionPlan: '',
                billingEmail: user?.email || '',
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
