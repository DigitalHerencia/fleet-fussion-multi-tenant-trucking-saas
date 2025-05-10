"use client"

import { useAuth } from "@/context/auth-context"

export function useCurrentUser() {
  const { user, userId } = useAuth()
  
  return {
    user: user ? {
      ...user
    } : null
  }
}
