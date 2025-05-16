import {SettlementForm} from "@/features/settlements/SettlementForm";

export default function SettlementsPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settlements</h1>
      <SettlementForm />
    </main>
  );
}
