import { z } from "zod";

export const loadSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  driverId: z.coerce.number().int().positive("Driver is required"),
  vehicleId: z.coerce.number().int().positive("Vehicle is required"),
});

export type LoadFormData = z.infer<typeof loadSchema>;
