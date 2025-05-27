'use client'

import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const [loading, setLoading] = useState(false)

  return (
    <button
      onClick={async () => {
        setLoading(true)
        await signOut({ redirectUrl: '/' })
        setLoading(false)
      }}
      disabled={loading}
      className="px-4 py-2 rounded bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}