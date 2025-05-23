/**
 * Validation schemas for authentication-related forms
 * Using Zod for runtime validation
 */

import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  tenantId: z.string().optional(),
})

export const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    companyName: z.string().min(2, "Company name must be at least 2 characters"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const onboardingSchema = z.object({
  companyDetails: z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    dotNumber: z.string().optional(),
    mcNumber: z.string().optional(),
  }),
  businessType: z.enum(["sole_proprietor", "partnership", "llc", "corporation"]),
  fleetSize: z.enum(["1_5", "6_15", "16_50", "51_100", "100_plus"]),
  services: z.array(z.enum(["truckload", "ltl", "intermodal", "specialized", "refrigerated", "flatbed", "other"])),
  referralSource: z.enum(["search", "social_media", "referral", "advertisement", "other"]).optional(),
})
