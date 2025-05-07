import { ComplianceForm } from "@/features/compliance/ComplianceForm"

export default function NewCompliancePage() {
    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Add Compliance Record</h1>
            <ComplianceForm />
        </div>
    )
}
