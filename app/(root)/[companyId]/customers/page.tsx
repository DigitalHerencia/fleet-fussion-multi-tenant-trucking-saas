import {CustomerForm} from "@/features/customers/CustomerForm";

export default function CustomersPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <CustomerForm />
    </main>
  );
}
