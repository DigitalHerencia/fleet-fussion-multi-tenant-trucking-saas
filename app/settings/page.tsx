import { SettingsForm } from "@/features/settings/SettingsForm"
import { getCompanySettings } from "@/lib/fetchers/settings"

export default async function SettingsPage() {
    const companyId = Number(process.env.TEST_COMPANY_ID)
    const settings = await getCompanySettings(companyId)

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Company Settings</h1>
            <SettingsForm defaultValues={settings} />
        </div>
    )
}
