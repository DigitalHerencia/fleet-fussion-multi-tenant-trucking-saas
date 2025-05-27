'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

export default function SignOutPage() {
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ redirectUrl: '/' })
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
    handleSignOut()
  }, [signOut])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Signing you out...</p>
        <a href="/" className="text-xs text-blue-400 hover:underline">Return to home</a>
      </div>
    </div>
  )
}