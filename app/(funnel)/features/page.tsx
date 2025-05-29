import Link from "next/link"
import Image from "next/image"
import {
  MapPinned,
  UserCog,
  ShieldCheck,
  Wrench,
  Fuel,
  FileText,
  FileBarChart2,
  BarChart3,
} from "lucide-react"

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
          <div className="w-full max-w-2xl mx-auto mb-60 md:mb-80 lg:mb-96">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 dark:text-blue-500 mb-6 text-center drop-shadow-lg font-sans tracking-tight uppercase">COMPREHENSIVE FLEET MANAGEMENT FEATURES</h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10 leading-relaxed">
              Everything you need to manage your fleet operations efficiently and effectively.
            </p>
            {/* Feature cards */}
            <div className="flex flex-col items-center gap-8">
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-blue-900/30 hover:scale-[1.015] transition-transform w-full">
                <MapPinned className="text-blue-500 dark:text-blue-400 bg-blue-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-blue-500 mb-2 tracking-tight text-center uppercase">LIVE DISPATCH BOARD</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Our real-time dispatch board offers a <span className='font-semibold text-blue-200'>drag-and-drop interface</span> for scheduling loads, assigning drivers, and tracking vehicles. <span className='text-blue-200'>Geofenced ETAs</span> and live status updates keep your team and customers informed at every step. The intuitive UI ensures that even new dispatchers can manage complex operations with ease.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-green-900/30 hover:scale-[1.015] transition-transform w-full">
                <UserCog className="text-green-500 dark:text-green-400 bg-green-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-green-500 mb-2 tracking-tight text-center uppercase">DRIVER HUB</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Empower your drivers with a <span className='font-semibold text-green-200'>mobile-friendly hub</span> for ELD-ready HOS logs, DVIR submissions, fuel receipt uploads, and instant document scanning. The streamlined UX minimizes paperwork and maximizes time on the road, while compliance is always just a tap away.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-yellow-900/30 hover:scale-[1.015] transition-transform w-full">
                <ShieldCheck className="text-yellow-500 dark:text-yellow-400 bg-yellow-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-yellow-500 mb-2 tracking-tight text-center uppercase">COMPLIANCE & SAFETY</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Stay ahead of FMCSA requirements with <span className='font-semibold text-yellow-200'>automated compliance reminders</span>, CSA score monitoring, and instant access to safety snapshots. Our dashboard surfaces critical compliance tasks and deadlines, reducing risk and administrative overhead.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-orange-900/30 hover:scale-[1.015] transition-transform w-full">
                <Wrench className="text-orange-500 dark:text-orange-400 bg-orange-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-orange-500 mb-2 tracking-tight text-center uppercase">MAINTENANCE TRACKING</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Track preventive maintenance, work orders, and warranty/recall alerts with a <span className='font-semibold text-orange-200'>visual timeline</span>. The UI makes it easy to schedule service, log repairs, and keep your fleet in peak condition, reducing costly breakdowns and downtime.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-fuchsia-900/30 hover:scale-[1.015] transition-transform w-full">
                <Fuel className="text-fuchsia-500 dark:text-fuchsia-400 bg-fuchsia-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-fuchsia-500 mb-2 tracking-tight text-center uppercase">IFTA & FUEL TAX</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Automate jurisdiction mileage tracking and generate quarterly IFTA reports in just a few clicks. The user experience is designed for <span className='font-semibold text-fuchsia-200'>accuracy and speed</span>, saving hours of manual calculation and paperwork each quarter.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-cyan-900/30 hover:scale-[1.015] transition-transform w-full">
                <FileText className="text-cyan-500 dark:text-cyan-400 bg-cyan-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-cyan-500 mb-2 tracking-tight text-center uppercase">BILLING & SETTLEMENTS</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">From rate-confirm to invoice, our billing workflows are <span className='font-semibold text-cyan-200'>seamless and transparent</span>. Driver settlements are calculated automatically, and the UI provides clear visibility into every transaction, reducing disputes and speeding up payments.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-rose-900/30 hover:scale-[1.015] transition-transform w-full">
                <FileBarChart2 className="text-rose-500 dark:text-rose-400 bg-rose-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-rose-500 mb-2 tracking-tight text-center uppercase">INSURANCE & RISK</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Manage certificates of insurance, receive expiration alerts, and generate loss-run reports with ease. The insurance vault keeps all your documents organized and accessible, while proactive notifications help you stay compliant and protected.</p>
              </div>
              <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 flex flex-col items-center border border-indigo-900/30 hover:scale-[1.015] transition-transform w-full">
                <BarChart3 className="text-indigo-500 dark:text-indigo-400 bg-indigo-100/10 rounded-lg p-1 h-10 w-10 mb-4 drop-shadow-md mx-auto" />
                <h2 className="text-2xl font-extrabold text-indigo-500 mb-2 tracking-tight text-center uppercase">ANALYTICS STUDIO</h2>
                <p className="text-base text-zinc-100 leading-relaxed text-center">Unlock insights with customizable dashboards for cost-per-mile, empty-mile percentage, and more. The analytics studio's modern UI makes it easy to visualize trends, identify inefficiencies, and drive smarter decisions across your fleet.</p>
              </div>
            </div>
            <div className="mt-12 text-sm text-blue-200 text-center max-w-xl mx-auto drop-shadow-md">
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