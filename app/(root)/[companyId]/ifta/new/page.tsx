import { IFTAForm } from "@/features/ifta/IFTAForm";

export default function NewIFTARecordPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Submit IFTA Record</h1>
      <IFTAForm />
    </div>
  );
}
