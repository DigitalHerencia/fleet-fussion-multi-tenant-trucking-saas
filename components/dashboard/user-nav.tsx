"use client"

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <OrganizationSwitcher 
        appearance={{
          elements: {
            organizationSwitcherTrigger: "py-2 px-4 h-8 rounded-full"
          }
        }}
      />
      <UserButton 
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8"
          }
        }}
        afterSignOutUrl="/login"
      />
    </div>
  )
}
