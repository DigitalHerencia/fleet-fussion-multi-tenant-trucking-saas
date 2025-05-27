"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-sm font-medium">Theme</p>
          <ThemeToggle />
        </div>
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/dashboard"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/dispatch"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Dispatch
          </Link>
          <Link
            href="/drivers"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Drivers
          </Link>
          <Link
            href="/vehicles"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Vehicles
          </Link>
          <Link
            href="/compliance"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Compliance
          </Link>
          <Link
            href="/compliance/hos-logs"
            className="flex w-full items-center rounded-md pl-6 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            HOS Logs
          </Link>
          <Link
            href="/ifta"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            IFTA
          </Link>
          <Link
            href="/analytics"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Analytics
          </Link>
          <Link
            href="/settings"
            className="flex w-full items-center rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
