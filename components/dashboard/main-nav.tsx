import Link from "next/link"
import { cn } from "@/lib/utils"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
        Dashboard
      </Link>
      <Link href="/dispatch" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Dispatch
      </Link>
      <Link href="/drivers" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Drivers
      </Link>
      <Link href="/vehicles" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Vehicles
      </Link>
      <Link
        href="/compliance"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Compliance
      </Link>
      <Link href="/ifta" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        IFTA
      </Link>
      <Link
        href="/analytics"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Analytics
      </Link>
      <Link href="/settings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Settings
      </Link>
    </nav>
  )
}
