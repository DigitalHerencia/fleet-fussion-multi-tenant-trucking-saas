import Link from "next/link"

export function SharedFooter() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6 bg-background/80 backdrop-blur-sm relative z-10">
      <p className="text-xs text-muted-foreground">© 2025 FleetFusion. All rights reserved.</p>
      <nav className="sm:ml-auto flex gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href="/terms">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
          Privacy
        </Link>
      </nav>
    </footer>
  )
}
