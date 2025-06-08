import {
  ArrowRight,
  Truck,
  Shield,
  BarChart3,
  FileText,
  MapPin,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import PricingSection from '@/components/pricing/pricing-section';
import { SharedFooter } from '@/components/shared/SharedFooter';
import { PublicNav } from '@/components/shared/PublicNav';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      {/* Main content area */}
      <main className="flex-1">
        <section className="relative w-full overflow-hidden py-12 md:py-24 lg:min-h-[600px] lg:py-0 xl:min-h-[700px] xl:py-0 2xl:min-h-[800px]">
          {/* Background image for large screens */}
          <div className="absolute inset-0 z-0 hidden h-full w-full lg:block">
            <Image
              src="/landing_hero.png"
              alt="FleetFusion Hero Background"
              width={1920}
              height={1080}
              className="h-full w-full object-cover object-right-bottom"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative z-10 container flex min-h-[400px] items-center px-4 md:px-6 lg:min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px]">
            <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4 rounded-xl bg-black/70 p-6 pl-6 md:pl-12 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:pl-20">
                <h1 className="text-3xl font-extrabold tracking-tighter text-white md:text-4xl">
                  ENTERPRISE-GRADE FLEET MANAGEMENT
                </h1>
                <p className="lg:text-muted-foreground max-w-[600px] text-white/90 md:text-xl">
                  FLEETFUSION UNIFIES DISPATCH, COMPLIANCE, AND REAL‑TIME
                  ANALYTICS SO YOU CAN GET FREIGHT OUT THE DOOR—FASTER, SAFER,
                  SMARTER.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    asChild
                    className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white transition-colors hover:bg-blue-800"
                  >
                    <Link href="/sign-up">
                      Start Free 30-Day Trial{' '}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {/* Show hero image only on small screens */}
              <div className="flex items-center justify-center lg:hidden">
                <Image
                  alt="Automated Compliance Management"
                  className="border-muted aspect-video overflow-hidden rounded-xl border object-cover object-center shadow-lg"
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
              <h2 className="text-5xl font-extrabold tracking-tighter text-blue-800 md:text-5xl/tight dark:text-blue-500">
                COMPREHENSIVE FLEET MANAGEMENT FEATURES
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to manage your fleet operations efficiently
                and effectively.
              </p>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                {/* Feature 1 Example */}
                <Truck className="mb-2 h-10 w-10 text-blue-500" />
                <h3 className="text-xl font-bold">Dispatch & Routing</h3>
                <p className="text-muted-foreground text-center">
                  Optimize loads, assign drivers, and track vehicles in real
                  time.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <Shield className="mb-2 h-10 w-10 text-green-500" />
                <h3 className="text-xl font-bold">Compliance Automation</h3>
                <p className="text-muted-foreground text-center">
                  Automate document management, HOS, and safety compliance.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <BarChart3 className="mb-2 h-10 w-10 text-purple-500" />
                <h3 className="text-xl font-bold">Analytics & Reporting</h3>
                <p className="text-muted-foreground text-center">
                  Gain insights into performance, costs, and utilization.
                </p>
              </div>
              {/* New Feature 4 */}
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <FileText className="mb-2 h-10 w-10 text-yellow-500" />
                <h3 className="text-xl font-bold">Document Management</h3>
                <p className="text-muted-foreground text-center">
                  Centralize and securely store all fleet and driver documents.
                </p>
              </div>
              {/* New Feature 5 */}
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <MapPin className="mb-2 h-10 w-10 text-red-500" />
                <h3 className="text-xl font-bold">
                  IFTA & Fuel Tax Management
                </h3>
                <p className="text-muted-foreground text-center">
                  Automate IFTA reporting and fuel tax calculations to ensure
                  compliance and save time.
                </p>
              </div>
              {/* New Feature 6 */}
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                <Users className="mb-2 h-10 w-10 text-cyan-500" />
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-muted-foreground text-center">
                  Empower your team with shared schedules, notes, and
                  communication tools.
                </p>
              </div>
            </div>
          </div>
        </section>
        <PricingSection />
      </main>
      <SharedFooter />
    </div>
  );
}
// Ensure all images referenced above exist in /public. For remote images, add their domains to next.config.ts.
