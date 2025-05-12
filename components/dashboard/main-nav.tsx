import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm font-bold transition-colors hover:text-primary"
      >
        <Image
          src="/map-pinned.png"
          alt="FleetFusion Logo"
          width={28}
          height={28}
          className="rounded"
          priority={false}
          quality={80}
        />
        FleetFusion
      </Link>
      <Link
        href="/dispatch"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Dispatch
      </Link>
      <Link
        href="/drivers"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Drivers
      </Link>
      <Link
        href="/vehicles"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Vehicles
      </Link>
      <Link
        href="/compliance"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Compliance
      </Link>
      <Link
        href="/ifta"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        IFTA
      </Link>
      <Link
        href="/analytics"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Analytics
      </Link>
      <Link
        href="/settings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Settings
      </Link>
    </nav>
  );
}
