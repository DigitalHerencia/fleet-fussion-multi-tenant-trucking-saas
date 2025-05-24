'use client'

import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export const SignOutButton = () => {
  const { signOut } = useClerk()

  return (
    // Clicking this button signs out a user
    // Middleware will handle the redirect after sign out
    <Button onClick={() => signOut()}>Sign out</Button>
  )
}