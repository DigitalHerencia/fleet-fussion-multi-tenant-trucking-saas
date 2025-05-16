import { DriverForm } from "@/features/drivers/DriverForm";

export default function NewDriverPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Driver</h1>
      <DriverForm />
    </div>
  );
}
