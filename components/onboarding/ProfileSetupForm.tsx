"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSetupSchema, type ProfileSetupFormData } from "@/validations/onboarding";

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileSetupFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ProfileSetupFormData>;
}

export function ProfileSetupForm({ onSubmit, isLoading, initialData }: ProfileSetupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(ProfileSetupSchema),
    defaultValues: initialData,
    mode: "onChange"
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Enter your first name"
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Enter your last name"
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="Enter your phone number"
          type="tel"
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={!isValid || isLoading}
          className="px-8"
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </form>
  );
}
