import React from "react";
import { z } from "zod";
import { driverFormSchema } from "@/schemas/drivers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type DriverFormProps = {
  form: {
    values: z.infer<typeof driverFormSchema>;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    submitting: boolean;
    serverError?: string;
    mode: "create" | "edit";
  };
  onUploadDocument?: () => void;
};

export function DriverForm({ form, onUploadDocument }: DriverFormProps) {
  const { values, errors, onChange, onSubmit, submitting, serverError, mode } = form;
  return (
    <form className="space-y-6" onSubmit={onSubmit} autoComplete="off">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={values.firstName}
            onChange={e => onChange("firstName", e.target.value)}
            disabled={submitting}
            required
            autoFocus
            className={cn(errors.firstName && "border-red-500")}
          />
          {errors.firstName && <div className="text-xs text-red-500 mt-1">{errors.firstName}</div>}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={values.lastName}
            onChange={e => onChange("lastName", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.lastName && "border-red-500")}
          />
          {errors.lastName && <div className="text-xs text-red-500 mt-1">{errors.lastName}</div>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={e => onChange("email", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.email && "border-red-500")}
          />
          {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={values.phone}
            onChange={e => onChange("phone", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.phone && "border-red-500")}
          />
          {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
        </div>
        <div>
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            value={values.hireDate}
            onChange={e => onChange("hireDate", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.hireDate && "border-red-500")}
          />
          {errors.hireDate && <div className="text-xs text-red-500 mt-1">{errors.hireDate}</div>}
        </div>
        <div>
          <Label htmlFor="homeTerminal">Home Terminal</Label>
          <Input
            id="homeTerminal"
            value={values.homeTerminal}
            onChange={e => onChange("homeTerminal", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.homeTerminal && "border-red-500")}
          />
          {errors.homeTerminal && <div className="text-xs text-red-500 mt-1">{errors.homeTerminal}</div>}
        </div>
        <div>
          <Label htmlFor="cdlNumber">CDL Number</Label>
          <Input
            id="cdlNumber"
            value={values.cdlNumber}
            onChange={e => onChange("cdlNumber", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.cdlNumber && "border-red-500")}
          />
          {errors.cdlNumber && <div className="text-xs text-red-500 mt-1">{errors.cdlNumber}</div>}
        </div>
        <div>
          <Label htmlFor="cdlState">CDL State</Label>
          <Input
            id="cdlState"
            value={values.cdlState}
            onChange={e => onChange("cdlState", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.cdlState && "border-red-500")}
            maxLength={2}
          />
          {errors.cdlState && <div className="text-xs text-red-500 mt-1">{errors.cdlState}</div>}
        </div>
        <div>
          <Label htmlFor="cdlClass">CDL Class</Label>
          <Input
            id="cdlClass"
            value={values.cdlClass}
            onChange={e => onChange("cdlClass", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.cdlClass && "border-red-500")}
            maxLength={1}
          />
          {errors.cdlClass && <div className="text-xs text-red-500 mt-1">{errors.cdlClass}</div>}
        </div>
        <div>
          <Label htmlFor="cdlExpiration">CDL Expiration</Label>
          <Input
            id="cdlExpiration"
            type="date"
            value={values.cdlExpiration}
            onChange={e => onChange("cdlExpiration", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.cdlExpiration && "border-red-500")}
          />
          {errors.cdlExpiration && <div className="text-xs text-red-500 mt-1">{errors.cdlExpiration}</div>}
        </div>
        <div>
          <Label htmlFor="medicalCardExpiration">Medical Card Expiration</Label>
          <Input
            id="medicalCardExpiration"
            type="date"
            value={values.medicalCardExpiration}
            onChange={e => onChange("medicalCardExpiration", e.target.value)}
            disabled={submitting}
            required
            className={cn(errors.medicalCardExpiration && "border-red-500")}
          />
          {errors.medicalCardExpiration && <div className="text-xs text-red-500 mt-1">{errors.medicalCardExpiration}</div>}
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={values.notes || ""}
          onChange={e => onChange("notes", e.target.value)}
          disabled={submitting}
          className={cn(errors.notes && "border-red-500")}
        />
        {errors.notes && <div className="text-xs text-red-500 mt-1">{errors.notes}</div>}
      </div>
      {serverError && <div className="text-sm text-red-600 font-medium">{serverError}</div>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={submitting} className="bg-black">
          {mode === "edit" ? "Update Driver" : "Add Driver"}
        </Button>
        {onUploadDocument && (
          <Button type="button" variant="outline" onClick={onUploadDocument} disabled={submitting}>
            Upload Document
          </Button>
        )}
      </div>
    </form>
  );
}
