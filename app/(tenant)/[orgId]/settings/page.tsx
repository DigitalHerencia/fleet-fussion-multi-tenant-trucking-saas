import { SettingsDashboard } from '@/components/settings/settings-dashboard';
import { PageHeader } from '@/components/shared/PageHeader';

export default function SettingsPage() {
  return (
    <div className="settings-page mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="mt-8 mb-2 space-y-2">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your account and application settings
          </p>
        </div>
        <PageHeader />
      </div>
      <SettingsDashboard />
    </div>
  );
}
