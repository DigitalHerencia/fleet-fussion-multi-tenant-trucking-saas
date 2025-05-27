/**
 * Validation schemas for dispatch-related forms
 * Using Zod for runtime validation
 */

import { z } from "zod"

export const createLoadSchema = z.object({
  referenceNumber: z.string().min(1, "Reference number is required"),
  customer: z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Customer name is required"),
    contactName: z.string().optional(),
    email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
  }),
  origin: z.object({
    name: z.string().min(1, "Origin name is required"),
    address: z.string().min(1, "Origin address is required"),
    city: z.string().min(1, "Origin city is required"),
    state: z.string().min(1, "Origin state is required"),
    zipCode: z.string().min(1, "Origin zip code is required"),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    notes: z.string().optional(),
  }),
  destination: z.object({
    name: z.string().min(1, "Destination name is required"),
    address: z.string().min(1, "Destination address is required"),
    city: z.string().min(1, "Destination city is required"),
    state: z.string().min(1, "Destination state is required"),
    zipCode: z.string().min(1, "Destination zip code is required"),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    notes: z.string().optional(),
  }),
  pickupDate: z.string().min(1, "Pickup date is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  driver: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  vehicle: z
    .object({
      id: z.string().optional(),
      number: z.string().optional(),
    })
    .optional(),
  trailer: z
    .object({
      id: z.string().optional(),
      number: z.string().optional(),
    })
    .optional(),
  rate: z.object({
    total: z.number().min(0, "Rate must be a positive number"),
    currency: z.string().default("USD"),
    type: z.enum(["flat", "per_mile"]),
    detention: z.number().optional(),
    additionalStops: z.number().optional(),
    fuelSurcharge: z.number().optional(),
    other: z.number().optional(),
  }),
  notes: z.string().optional(),
})

export const updateLoadSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "assigned", "in_transit", "delivered", "completed", "cancelled"]).optional(),
  driver: z
    .object({
      id: z.string(),
      name: z.string().optional(),
    })
    .optional(),
  vehicle: z
    .object({
      id: z.string(),
      number: z.string().optional(),
    })
    .optional(),
  trailer: z
    .object({
      id: z.string(),
      number: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
})

export const loadFilterSchema = z.object({
  status: z.enum(["all", "pending", "assigned", "in_transit", "delivered", "completed", "cancelled"]).optional(),
  driverId: z.string().optional(),
  vehicleId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
})
