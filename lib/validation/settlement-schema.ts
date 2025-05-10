import { z } from "zod";

export const settlementSchema = z.object({
  driverId: z.string().uuid().optional(),
  loadId: z.string().uuid().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  status: z.enum(["pending", "paid"]).default("pending"),
  issuedDate: z.coerce.date().optional(),
  paidDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type SettlementFormValues = z.infer<typeof settlementSchema>;
