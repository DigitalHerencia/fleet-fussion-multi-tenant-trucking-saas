import Link from "next/link"
import Image from "next/image"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background gradient overlay for fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Background image positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <Image 
          src="/mountain_bg.png"
          alt="Road leading to mountains"
          width={1200}
          height={800}
          className="w-full h-auto object-cover"
          priority
        />
      </div>
      
      <main className="flex-1 relative z-10">
        <div className="container mx-auto py-12 px-4 md:px-8">
          <div className="w-full max-w-4xl bg-card/90 backdrop-blur-sm rounded-lg shadow-md p-6 md:p-8 mx-auto mb-60 md:mb-80 lg:mb-96">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-6 text-center">Comprehensive Fleet Management Features</h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Everything you need to manage your fleet operations efficiently and effectively.
            </p>

            {/* Expanded feature sections with marketing copy */}
            <div className="space-y-8">
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Live Dispatch Board</h2>
                <p className="mb-4 text-base text-foreground">Our real-time dispatch board offers a drag-and-drop interface for scheduling loads, assigning drivers, and tracking vehicles. Geofenced ETAs and live status updates keep your team and customers informed at every step. The intuitive UI ensures that even new dispatchers can manage complex operations with ease.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Driver Hub</h2>
                <p className="mb-4 text-base text-foreground">Empower your drivers with a mobile-friendly hub for ELD-ready HOS logs, DVIR submissions, fuel receipt uploads, and instant document scanning. The streamlined UX minimizes paperwork and maximizes time on the road, while compliance is always just a tap away.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Compliance & Safety</h2>
                <p className="mb-4 text-base text-foreground">Stay ahead of FMCSA requirements with automated compliance reminders, CSA score monitoring, and instant access to safety snapshots. Our dashboard surfaces critical compliance tasks and deadlines, reducing risk and administrative overhead.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Maintenance Tracking</h2>
                <p className="mb-4 text-base text-foreground">Track preventive maintenance, work orders, and warranty/recall alerts with a visual timeline. The UI makes it easy to schedule service, log repairs, and keep your fleet in peak condition, reducing costly breakdowns and downtime.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">IFTA & Fuel Tax</h2>
                <p className="mb-4 text-base text-foreground">Automate jurisdiction mileage tracking and generate quarterly IFTA reports in just a few clicks. The user experience is designed for accuracy and speed, saving hours of manual calculation and paperwork each quarter.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Billing & Settlements</h2>
                <p className="mb-4 text-base text-foreground">From rate-confirm to invoice, our billing workflows are seamless and transparent. Driver settlements are calculated automatically, and the UI provides clear visibility into every transaction, reducing disputes and speeding up payments.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Insurance & Risk</h2>
                <p className="mb-4 text-base text-foreground">Manage certificates of insurance, receive expiration alerts, and generate loss-run reports with ease. The insurance vault keeps all your documents organized and accessible, while proactive notifications help you stay compliant and protected.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Analytics Studio</h2>
                <p className="mb-4 text-base text-foreground">Unlock insights with customizable dashboards for cost-per-mile, empty-mile percentage, and more. The analytics studio's modern UI makes it easy to visualize trends, identify inefficiencies, and drive smarter decisions across your fleet.</p>
              </section>
              <section className="w-full">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">Customer Portal</h2>
                <p className="mb-4 text-base text-foreground">Give your customers real-time shipment visibility, downloadable e-PODs, and live map tracking. The portal's clean, branded interface enhances your customer experience and reduces check-call volume for your team.</p>
              </section>
            </div>
            <div className="mt-10 text-sm text-muted-foreground text-center max-w-xl mx-auto">
              For a full list of features and integrations, contact <a href="mailto:support@fleetfusion.ai" className="underline hover:text-blue-400 transition-colors">support@fleetfusion.ai</a>.
            </div>
          </div>
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