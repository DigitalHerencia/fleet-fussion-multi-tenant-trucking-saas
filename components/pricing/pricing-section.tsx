// Shared pricing section for landing and pricing pages
import Link from "next/link"
import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$149/mo",
    description: "Perfect for small fleets just getting started.",
    features: [
      "Up to 5 trucks",
      "2 dispatcher seats",
      "5 driver apps",
      "Core TMS features",
      "90-day log retention"
    ],
    highlight: false
  },
  {
    name: "Growth",
    price: "$349/mo",
    description: "For growing fleets that need more power and flexibility.",
    features: [
      "Up to 25 trucks",
      "Unlimited dispatcher seats",
      "25 driver apps",
      "IFTA engine",
      "Custom reports"
    ],
    highlight: true // Recommended plan
  },
  {
    name: "Enterprise",
    price: "$15/truck",
    description: "Advanced features and support for large operations.",
    features: [
      "Minimum $699/mo",
      "Priority SLA",
      "Dedicated CSM",
      "SSO & API rate bump",
      "Custom integrations"
    ],
    highlight: false
  }
]

export default function PricingSection({ showTitle = true }: { showTitle?: boolean }) {
  return (
    <section className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full z-10">
        <Image
          src="/tiers_bg.png"
          alt="Pricing Background"
          className="w-full h-full object-cover object-center"
          width={1920}
          height={1080}
          priority
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/20" />
      </div>
      <div className="w-full container px-4 md:px-8 xl:px-32 relative z-10 py-12 md:py-24">
        {showTitle && (
          <>
            <h2 className="text-5xl font-extrabold text-white/90 text-center mb-8">Simple, Transparent Pricing</h2>
            <p className="text-center text-lg text-muted-foreground mb-12">Affordable for every fleet size. 30-day free trial on all plans.</p>
          </>
        )}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-transform duration-200 bg-white dark:bg-zinc-900 ${plan.highlight ? 'ring-2 ring-blue-200 dark:ring-blue-900 scale-105 z-10' : ''}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground dark:text-white">{plan.name}</span>
                {plan.highlight && (
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">Most Popular</span>
                )}
              </div>
              <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">{plan.price}</div>
              <div className="text-muted-foreground mb-6 text-center">{plan.description}</div>
              <ul className="mb-8 space-y-2 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground dark:text-zinc-200">
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto w-full">
                <Button className={`w-full py-2 rounded-lg font-semibold text-white ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-800'} transition-colors`}>
                  Choose {plan.name}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8 mb-10">All prices in USD. Taxes & SMS fees extra. Cancel anytime.</p>
        <div className="text-center mt-4">
          <Link href="/refund" className="text-primary underline text-sm">
            View our Refund Policy
          </Link>
        </div>
      </div>
    </section>
  )
}