import Link from "next/link"

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto py-12 px-4 md:px-8">
        <div className="w-full max-w-3xl bg-card rounded-lg shadow-md p-8 mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-6 text-center">💵 Refund Policy</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">Effective Date: April 27, 2025<br/>Fleet Fusion, LLC &mdash; Anthony, New Mexico, United States</p>
          <ol className="list-decimal pl-6 space-y-4 text-base text-foreground">
            <li>
              <strong>Subscription Fees</strong><br/>
              All subscription payments (Starter, Growth, Enterprise) are non-refundable once processed, except as explicitly stated in this policy or required by law.
            </li>
            <li>
              <strong>30-Day Free Trial</strong><br/>
              Fleet Fusion offers a 30-day free trial on all plans. If you cancel during the trial period, you will not be charged.
            </li>
            <li>
              <strong>Cancellations</strong><br/>
              You may cancel your subscription at any time via your account settings. Cancellations are effective at the end of the current billing cycle. No partial refunds are issued for unused portions of a billing cycle.
            </li>
            <li>
              <strong>Refunds for Downtime</strong><br/>
              If Fleet Fusion fails to meet its SLA obligations, Customers may be eligible for service credits as described in the SLA, not monetary refunds.
            </li>
            <li>
              <strong>Exceptional Circumstances</strong><br/>
              Fleet Fusion may, at its sole discretion, consider refund requests in exceptional cases such as:
              <ul className="list-disc pl-6">
                <li>Duplicate charges</li>
                <li>Billing errors attributable to Fleet Fusion</li>
                <li>Non-delivery of promised service features (with documented support communications)</li>
              </ul>
              All refund requests must be submitted within 30 days of the billing event via <a href="mailto:support@fleetfusion.app" className="text-primary underline">support@fleetfusion.app</a>.
            </li>
            <li>
              <strong>Chargebacks</strong><br/>
              If you initiate a chargeback or dispute on a legitimate charge, your account may be immediately suspended pending resolution.
            </li>
            <li>
              <strong>Modifications</strong><br/>
              Fleet Fusion reserves the right to update or modify this Refund Policy at any time. Updates will be posted on the website.
            </li>
          </ol>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
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