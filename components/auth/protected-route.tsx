"use client"

import type React from "react"

import { useAuth } from "@/components/auth/context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth()

  const router = useRouter()
  const pathname = usePathname()



  
  return <>{children}</>
}
