"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { useUser, UserButton, OrganizationSwitcher } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export function UserNav() {
    const { isSignedIn } = useAuth()
    const { user } = useUser()
    const { resolvedTheme } = useTheme()
    const isDarkMode = resolvedTheme === "dark"

    if (!isSignedIn) {
        return null
    }

    return (
        <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Clerk Organization Switcher */}
            <OrganizationSwitcher
                appearance={{
                    elements: {
                        organizationSwitcherTrigger:
                            "py-2 px-4 h-8 rounded-full border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
                        organizationSwitcherPopoverCard:
                            "bg-popover border border-border shadow-md",
                        organizationPreview: "hover:bg-accent",
                        organizationSwitcherPopoverFooter: "border-t border-border"
                    }
                }}
            />

            {/* Clerk User Button */}
            <UserButton
                appearance={{
                    elements: {
                        avatarBox: "h-8 w-8",
                        userButtonPopoverCard: "bg-popover border border-border shadow-md",
                        userButtonPopoverFooter: "border-t border-border",
                        userPreview: "hover:bg-accent"
                    }
                }}
            />
        </div>
    )
}
