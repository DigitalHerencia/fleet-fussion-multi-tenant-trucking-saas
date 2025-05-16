import {InvoiceForm} from "@/features/invoices/InvoiceForm";

export default function InvoicesPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <InvoiceForm />
    </main>
  );
}
