/**
 * IFTA (International Fuel Tax Agreement) validation schemas
 * 
 * Schemas for IFTA reporting:
 * - Trip reporting
 * - Quarterly summaries
 * - State mileage and fuel tracking
 */
import { z } from "zod";
import { 
  uuidSchema,
  optionalUuidSchema,
  requiredString,
  nonNegativeNumber,
  optionalCalendarDateSchema,
  positiveNumber,
  optionalStateCodeSchema
} from "./common-schemas";

// IFTA quarter options
const iftaQuarterEnum = z.enum(["Q1", "Q2", "Q3", "Q4"]);

// Schema for IFTA quarterly report
export const iftaReportSchema = z.object({
  quarter: iftaQuarterEnum.describe("IFTA quarter"),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1).describe("Report year"),
  totalMiles: nonNegativeNumber.describe("Total miles"),
  totalGallons: nonNegativeNumber.describe("Total gallons"),
  submissionDate: optionalCalendarDateSchema.describe("Filing submission date"),
  notes: z.string().optional().describe("Notes"),
});

// Schema for recording IFTA trips
export const iftaTripSchema = z.object({
  vehicleId: uuidSchema.describe("Vehicle ID"),
  driverId: optionalUuidSchema.describe("Driver ID"),
  
  startDate: z.coerce.date().describe("Trip start date"),
  endDate: z.coerce.date().optional().describe("Trip end date"),
  
  startOdometer: positiveNumber.describe("Start odometer reading"),
  endOdometer: positiveNumber.describe("End odometer reading"),
  
  totalMiles: positiveNumber.describe("Total miles"),
  
  // State mileage breakdown
  stateMileage: z.array(
    z.object({
      state: optionalStateCodeSchema.describe("State code"),
      miles: nonNegativeNumber.describe("Miles in state"),
    })
  ).optional().default([]).describe("State mileage breakdown"),
  
  // Fuel purchase entries
  fuelPurchases: z.array(
    z.object({
      state: optionalStateCodeSchema.describe("Purchase state"),
      gallons: positiveNumber.describe("Gallons purchased"),
      cost: positiveNumber.describe("Fuel cost"),
      date: optionalCalendarDateSchema.describe("Purchase date"),
      receiptAvailable: z.boolean().default(false).describe("Receipt available"),
    })
  ).optional().default([]).describe("Fuel purchases"),
  
  notes: z.string().optional().describe("Trip notes"),
});

export const iftaCoreSchema = iftaReportSchema; // Ensure export of iftaCoreSchema
export type IFTAFilterData = IFTAReportData; // Export type IFTAFilterData

export type IFTAReportData = z.infer<typeof iftaReportSchema>;
export type IFTATripData = z.infer<typeof iftaTripSchema>;
