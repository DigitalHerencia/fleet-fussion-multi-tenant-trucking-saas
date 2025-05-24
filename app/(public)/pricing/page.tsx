import PricingSection from "@/components/pricing/pricing-section"
import { SharedFooter } from "@/components/shared/shared-footer"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div >
      <main>
        <PricingSection showTitle={true} />
        <div className="text-center">
        </div>
      </main>
      <SharedFooter />
    </div>
  )
}