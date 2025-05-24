import React from "react"

export default function ContactPage() {
  return (
    <main className="container mx-auto py-12 px-4 md:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
      <section className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Sales</h2>
          <p>sales@fleetfusion.ai · +1‑800‑555‑LOAD</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-1">Support</h2>
          <p>support@fleetfusion.ai · Live chat weekdays 8a‑8p CT</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-1">Address</h2>
          <p>123 Logistics Loop, Austin TX 78701</p>
        </div>
      </section>
    </main>
  )
}