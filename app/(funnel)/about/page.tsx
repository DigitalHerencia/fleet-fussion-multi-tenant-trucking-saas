import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background gradient overlay for fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Background image positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <Image 
          src="/sunset_bg.png"
          alt="Highway with truck"
          width={1200}
          height={800}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <main className="flex-1 container mx-auto py-12 px-4 md:px-8 relative z-10">
        <div className="w-full max-w-3xl bg-card/90 backdrop-blur-sm rounded-lg shadow-md p-6 md:p-8 mx-auto mb-60 md:mb-80 lg:mb-96">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">🛣️ About Us</h1>
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
              <p>At Fleet Fusion, our mission is to empower small and mid-sized trucking and logistics companies with cutting-edge, affordable, and easy-to-use Transportation Management Software (TMS). We believe technology should accelerate your fleet’s success — not complicate it.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Who We Are</h2>
              <p>Fleet Fusion is proudly based in Anthony, New Mexico — strategically positioned to serve fleets across the Southwest and beyond. We are logistics specialists, technologists, and passionate innovators committed to building world-class fleet management solutions tailored for the SME market.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">What We Offer</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Real-time live dispatch board</li>
                <li>Driver Hubs with full compliance tracking</li>
                <li>Maintenance scheduling and tracking</li>
                <li>IFTA fuel tax reporting</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Billing, settlements, and insurance management</li>
                <li>Secure customer portals and shipment visibility tools</li>
              </ul>
              <p className="mt-2">Our flexible plans are designed to grow with your business, from small startups to enterprise-level operations.</p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Our Values</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Transparency: Clear, simple pricing with no hidden fees.</li>
                <li>Reliability: 99.9% uptime and priority support.</li>
                <li>Innovation: Constantly evolving features powered by user feedback.</li>
                <li>Customer-Centricity: We succeed when you succeed.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Why Fleet Fusion?</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Purpose-built for trucking and logistics SMEs</li>
                <li>30-day free trial on all plans</li>
                <li>Dedicated support with every subscription</li>
                <li>Continual upgrades and innovation</li>
              </ul>
              <p className="mt-2">Join a growing community of fleet operators who trust Fleet Fusion to manage their operations, improve compliance, and boost profitability.</p>
            </div>
          </section>
        </div>
      </main>
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
    </div>
  )
}