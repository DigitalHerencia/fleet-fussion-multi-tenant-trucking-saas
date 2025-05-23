/**
 * Validation schemas for driver-related forms
 * Using Zod for runtime validation
 */

import { z } from "zod"

export const createDriverSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseState: z.string().min(1, "License state is required"),
  licenseExpiration: z.string().min(1, "License expiration date is required"),
  medicalCardExpiration: z.string().min(1, "Medical card expiration date is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  homeTerminal: z.string().min(1, "Home terminal is required"),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
})

export const updateDriverSchema = z.object({
  id: z.string(),
  status: z.enum(["available", "on_duty", "driving", "off_duty", "inactive"]).optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
  licenseExpiration: z.string().optional(),
  medicalCardExpiration: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
})

export const driverFilterSchema = z.object({
  status: z.enum(["all", "available", "on_duty", "driving", "off_duty", "inactive"]).optional(),
  search: z.string().optional(),
  licenseExpiringIn: z.number().optional(), // days
  medicalCardExpiringIn: z.number().optional(), // days
})

export const hosLogEntrySchema = z.object({
  status: z.enum(["driving", "on_duty", "off_duty", "sleeper_berth"]),
  location: z.string().min(1, "Location is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
})
