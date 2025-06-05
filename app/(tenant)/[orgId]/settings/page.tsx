import { SettingsDashboard } from "@/components/settings/settings-dashboard"
import { PageHeader } from "@/components/shared/PageHeader"

export default function SettingsPage() {
  return (
    <div className="settings-page w-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        <div className="space-y-2 mb-2 mt-8">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and application settings</p>
        </div>
        <PageHeader />
      </div>
      <SettingsDashboard />
    </div>
  )
}
