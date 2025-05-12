// Shared pricing section for landing and pricing pages
import React from "react";
import Image from "next/image";

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
      "90-day log retention",
    ],
    highlight: false,
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
      "Custom reports",
    ],
    highlight: true, // Recommended plan
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
      "Custom integrations",
    ],
    highlight: false,
  },
];

export default function PricingSection({
  showTitle = true,
}: {
  showTitle?: boolean;
}) {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/tiers-bg.png"
          alt="Pricing Background"
          fill
          className="object-cover object-center"
          priority={false}
          quality={80}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/20" />
      </div>
      <div className="container px-4 md:px-8 xl:px-32 relative z-10">
        {showTitle && (
          <>
            <h2 className="text-5xl font-extrabold text-white/90 text-center mb-8">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-lg text-muted-foreground mb-12">
              Affordable for every fleet size. 30-day free trial on all plans.
            </p>
          </>
        )}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex-1 rounded-2xl shadow-lg border p-8 flex flex-col items-center transition-transform duration-200 bg-white dark:bg-zinc-900 ${plan.highlight ? "border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900 scale-105 z-10" : "border-gray-200 dark:border-zinc-800"}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground dark:text-white">
                  {plan.name}
                </span>
                {plan.highlight && (
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">
                {plan.price}
              </div>
              <div className="text-muted-foreground mb-6 text-center">
                {plan.description}
              </div>
              <ul className="mb-8 space-y-2 w-full">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-foreground dark:text-zinc-200"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-lg font-semibold text-white ${plan.highlight ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-800"} transition-colors`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          All prices in USD. Taxes & SMS fees extra. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
