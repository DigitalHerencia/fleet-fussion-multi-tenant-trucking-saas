"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PreferencesSchema, type PreferencesFormData } from "@/schemas/onboarding";
import { Bell, Globe, Monitor } from "lucide-react";

interface PreferencesFormProps {
  onSubmit: (data: PreferencesFormData) => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  initialData?: Partial<PreferencesFormData>;
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" }
];

const THEMES = [
  { 
    value: "light", 
    label: "Light", 
    description: "Use light theme",
    icon: "☀️"
  },
  { 
    value: "dark", 
    label: "Dark", 
    description: "Use dark theme",
    icon: "🌙"
  },
  { 
    value: "system", 
    label: "System", 
    description: "Follow system preference",
    icon: "💻"
  }
];

export function PreferencesForm({ onSubmit, onPrevious, isLoading, initialData }: PreferencesFormProps) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PreferencesFormData>({
    defaultValues: {
      notifications: {
        email: true,
        push: true
      },
      language: "en",
      theme: "system",
      ...initialData
    },
    mode: "onChange"
  });

  const watchedNotifications = watch("notifications");
  const watchedLanguage = watch("language");
  const watchedTheme = watch("theme");

  const handleNotificationChange = (type: "email" | "push", value: boolean) => {
    setValue(`notifications.${type}`, value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Preferences</h2>
        <p className="text-muted-foreground">
          Customize your experience and notification settings
        </p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose how you want to receive updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch
              checked={watchedNotifications?.email || false}
              onCheckedChange={(value) => handleNotificationChange("email", value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts in the browser
              </p>
            </div>
            <Switch
              checked={watchedNotifications?.push || false}
              onCheckedChange={(value) => handleNotificationChange("push", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language
          </CardTitle>
          <CardDescription>
            Select your preferred language for the interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Interface Language</Label>
            <Select
              value={watchedLanguage}
              onValueChange={(value) => setValue("language", value)}
            >
              <SelectTrigger className={errors.language ? "border-red-500" : ""}>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-red-500">{errors.language.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theme Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose your preferred theme and visual style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <div
                  key={theme.value}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${watchedTheme === theme.value 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-primary/50"
                    }
                  `}
                  onClick={() => setValue("theme", theme.value as "light" | "dark" | "system")}
                >
                  <div className="text-center space-y-2">
                    <div className="text-2xl">{theme.icon}</div>
                    <div className="font-medium">{theme.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {theme.description}
                    </div>
                  </div>
                  {watchedTheme === theme.value && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
            {errors.theme && (
              <p className="text-sm text-red-500">{errors.theme.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        {onPrevious && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
        <div className="flex-1" />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? "Completing Setup..." : "Complete Setup"}
        </Button>
      </div>
    </form>
  );
}
