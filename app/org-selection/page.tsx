import { OrganizationList } from '@clerk/nextjs'

export default function OrganizationSelectionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Select Your Organization</h1>
        <OrganizationList
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  )
}