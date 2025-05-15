/**
 * Invoice validation schemas
 * 
 * Schemas for customer invoices with:
 * - UUIDs for entity references
 * - Proper validation for monetary values
 * - Date handling for invoice dates
 */
import { z } from "zod";
import { 
  optionalUuidSchema,
  positiveNumber,
  optionalCalendarDateSchema,
  optionalString,
  optionalPositiveNumber
} from "./common-schemas";

// Invoice status options
const invoiceStatusEnum = z.enum([
  "draft",
  "pending",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
  "void"
]);

// Schema for creating/updating an invoice
export const invoiceSchema = z.object({
  // Entity references
  customerId: optionalUuidSchema.describe("Customer ID"),
  loadId: optionalUuidSchema.describe("Load ID"),
  
  // Invoice details
  invoiceNumber: optionalString.describe("Invoice number"),
  amount: positiveNumber.describe("Invoice amount"),
  status: invoiceStatusEnum.default("pending").describe("Invoice status"),
  
  // Dates
  issuedDate: optionalCalendarDateSchema.describe("Date issued"),
  dueDate: optionalCalendarDateSchema.describe("Due date"),
  paidDate: optionalCalendarDateSchema.describe("Date paid"),
  
  // Payment tracking
  amountPaid: optionalPositiveNumber.describe("Amount paid"),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "check", "cash", "other"]).optional().describe("Payment method"),
  paymentReference: optionalString.describe("Payment reference number"),
  
  // Additional fields
  terms: optionalString.describe("Payment terms"),
  notes: optionalString.describe("Notes"),
});

// Schema for filtering invoices
export const invoiceFilterSchema = z.object({
  customerId: optionalUuidSchema,
  loadId: optionalUuidSchema,
  status: invoiceStatusEnum.optional(),
  issuedDateFrom: optionalCalendarDateSchema,
  issuedDateTo: optionalCalendarDateSchema,
  dueDateFrom: optionalCalendarDateSchema,
  dueDateTo: optionalCalendarDateSchema,
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type InvoiceFilterValues = z.infer<typeof invoiceFilterSchema>;
