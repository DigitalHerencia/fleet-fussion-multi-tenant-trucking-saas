"use client"

import { useAuth } from "@/context/auth-context"

export function useCurrentCompany() {
  const { organization, orgId } = useAuth()
  
  return {
    company: organization ? {
      ...organization
    } : null
  }
}
