import { PublicNav } from "@/components/public-nav"
import PricingSection from "@/components/pricing-section"
import Link from "next/link"

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PublicNav />
            <main className="flex-1 container mx-auto py-12 px-4 md:px-8">
                <PricingSection showTitle={true} />
                <div className="text-center mt-8">
                    <Link href="/refund" className="text-primary underline text-sm">
                        View our Refund Policy
                    </Link>
                </div>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
                <p className="text-xs text-muted-foreground">
                    © 2025 FleetFusion. All rights reserved.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="/terms">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    )
}
