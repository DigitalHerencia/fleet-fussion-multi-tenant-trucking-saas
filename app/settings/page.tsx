import { SettingsForm } from "@/features/settings/SettingsForm"
import { getCompanySettings } from "@/lib/fetchers/settings"
import { getCurrentCompanyId } from "@/lib/auth"

export default async function SettingsPage() {
    const companyId = await getCurrentCompanyId()
    const settings = await getCompanySettings(String(companyId))

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Company Settings</h1>
            <SettingsForm defaultValues={settings} />
        </div>
    )
}
