import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Shield, BarChart3, FileText, MapPin, Users, Calendar, CreditCard } from "lucide-react"
import PricingSection from "@/components/pricing/pricing-section"
import { SharedFooter } from "@/components/shared/shared-footer"
import Image from "next/image"
import Link from "next/link"
import { PublicNav } from "@/components/shared/public-nav"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNav />
      {/* Main content area */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-0 xl:py-0 relative lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px] overflow-hidden">
          {/* Background image for large screens */}
          <div className="hidden lg:block absolute inset-0 w-full h-full z-0">
            <Image
              src="/landing_hero.png"
              alt="FleetFusion Hero Background"
              width={1920}
              height={1080}
              className="w-full h-full object-cover object-right-bottom"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="container px-4 md:px-6 relative z-10 flex items-center min-h-[400px] lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 w-full">
              <div className="flex flex-col justify-center space-y-4 pl-6 md:pl-12 xl:pl-20 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none bg-black/70 rounded-xl p-6 lg:p-0">
                <h1 className="text-5xl font-extrabold text-white tracking-tighter md:text-6xl/tight">
                  Enterprise-Grade Fleet Management
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl text-white/90 lg:text-muted-foreground">
                  FleetFusion unifies dispatch, compliance, and real‑time analytics so you can get freight out the door—faster, safer, smarter.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    asChild
                    className="w-full py-2 rounded-lg font-semibold text-white bg-blue-400 hover:bg-blue-700 transition-colors"
                  >
                    <Link href="/sign-up">
                      Start Free 30-Day Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Show hero image only on small screens */}
              <div className="flex items-center justify-center lg:hidden">
                <Image
                  alt="Automated Compliance Management"
                  className="aspect-video overflow-hidden rounded-xl object-cover object-center shadow-lg border border-muted"
                  src="/trucksz_splash.png"
                  width={600}
                  height={400}
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-5xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tighter md:text-5xl/tight">
                  Comprehensive Fleet Management Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your fleet operations efficiently and effectively.
                </p>
              </div>
            </div>
            <div className="flex justify-center w-full">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                  {/* Feature 1 Example */}
                  <Truck className="h-10 w-10 text-blue-500 mb-2" />
                  <h3 className="text-xl font-bold">Dispatch & Routing</h3>
                  <p className="text-muted-foreground text-center">Optimize loads, assign drivers, and track vehicles in real time.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                  <Shield className="h-10 w-10 text-green-500 mb-2" />
                  <h3 className="text-xl font-bold">Compliance Automation</h3>
                  <p className="text-muted-foreground text-center">Automate document management, HOS, and safety compliance.</p>
                </div>
                <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                  <BarChart3 className="h-10 w-10 text-purple-500 mb-2" />
                  <h3 className="text-xl font-bold">Analytics & Reporting</h3>
                  <p className="text-muted-foreground text-center">Gain insights into performance, costs, and utilization.</p>
                </div>
              </div>
            </div>
          </section>
        <PricingSection />
      </main>
      <SharedFooter />
    </div>
  )
}
// Ensure all images referenced above exist in /public. For remote images, add their domains to next.config.ts.