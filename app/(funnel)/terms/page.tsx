import Link from "next/link"
import Image from "next/image"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background gradient overlay for fade effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent pointer-events-none" style={{ zIndex: 0 }} />
      
      {/* Background image positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <Image 
          src="/winding_bg.png"
          alt="Sunset highway with truck silhouette"
          width={1200}
          height={800}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <main className="flex-1 relative z-10">
        <div className="container mx-auto py-12 px-4 md:px-8">
          <div className="w-full max-w-3xl bg-card/90 backdrop-blur-sm rounded-lg shadow-md p-6 md:p-8 mx-auto mb-60 md:mb-80 lg:mb-96">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">📜 Terms of Service</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">Effective Date: April 27, 2025<br/>Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States</p>
            <ol className="list-decimal pl-6 space-y-4 text-base text-foreground">
              <li>
                <strong>Acceptance of Terms</strong><br/>
                By accessing or using Fleet Fusion's services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.
              </li>
              <li>
                <strong>Services</strong><br/>
                Fleet Fusion provides a Transportation Management Software (TMS) platform as a service (SaaS) designed for small to mid-sized enterprises (SMEs) managing fleet operations. Services include dispatch, compliance, billing, maintenance tracking, analytics, and related features.
              </li>
              <li>
                <strong>Eligibility</strong><br/>
                You must be at least 18 years old and capable of entering into a legally binding agreement to use our Services.
              </li>
              <li>
                <strong>Account Registration</strong><br/>
                You must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your credentials and all activities under your account.
              </li>
              <li>
                <strong>Subscription and Payment</strong><br/>
                <ul className="list-disc pl-6">
                  <li>Starter Plan: $149/mo</li>
                  <li>Growth Plan: $349/mo</li>
                  <li>Enterprise Plan: $15/truck (minimum $699/mo)</li>
                </ul>
                <span className="block mt-2">All prices are in USD. Taxes, SMS fees, and overages may apply. Payment is due monthly in advance. Failure to pay may result in suspension or termination of your account.</span>
              </li>
              <li>
                <strong>License Grant</strong><br/>
                Fleet Fusion grants you a non-exclusive, non-transferable, revocable license to use the Services for your internal business operations.
              </li>
              <li>
                <strong>Restrictions</strong><br/>
                You agree not to:
                <ul className="list-disc pl-6">
                  <li>Reverse engineer, decompile, or disassemble the software;</li>
                  <li>Access the Services to build a competitive product;</li>
                  <li>Use the platform for any illegal purpose.</li>
                </ul>
              </li>
              <li>
                <strong>Data Ownership and Usage</strong><br/>
                You retain ownership of all fleet data entered into the system. By using the Services, you grant Fleet Fusion a limited license to use anonymized, aggregated data to improve the Services.
              </li>
              <li>
                <strong>Termination</strong><br/>
                Fleet Fusion may suspend or terminate access if you breach these Terms. Upon termination, your access to data will be limited as described in the Privacy Policy.
              </li>
              <li>
                <strong>Modifications</strong><br/>
                Fleet Fusion may modify these Terms at any time by posting updated Terms on the website. Continued use constitutes acceptance.
              </li>
              <li>
                <strong>Warranties and Disclaimers</strong><br/>
                Fleet Fusion provides Services "as is." We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.
              </li>
              <li>
                <strong>Limitation of Liability</strong><br/>
                Fleet Fusion shall not be liable for indirect, incidental, special, or consequential damages arising out of the use or inability to use the Services.
              </li>
              <li>
                <strong>Indemnification</strong><br/>
                You agree to indemnify and hold harmless Fleet Fusion and its affiliates from any claims, damages, liabilities, or expenses arising from your use of the Services.
              </li>
              <li>
                <strong>Governing Law</strong><br/>
                These Terms are governed by the laws of the State of New Mexico, without regard to its conflict of law principles.
              </li>
              <li>
                <strong>Contact</strong><br/>
                Questions about these Terms? Email us at <a href="mailto:support@fleetfusion.app" className="text-primary underline">support@fleetfusion.app</a>
              </li>
            </ol>
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