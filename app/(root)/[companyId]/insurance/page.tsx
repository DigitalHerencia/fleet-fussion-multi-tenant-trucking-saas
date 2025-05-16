import { InsuranceForm } from "@/features/insurance/InsuranceForm";


export default function InsurancePage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Insurance</h1>
      <InsuranceForm />
    </main>
  );
}
