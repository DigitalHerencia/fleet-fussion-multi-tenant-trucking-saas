import { SettingsDashboard } from "@/components/settings/settings-dashboard"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Settings"
                description="Manage your account and application settings"
                breadcrumbs={[{ label: "Settings", href: "/settings" }]}
                actions={
                    <Button size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                }
            />
            <SettingsDashboard />
        </div>
    )
}
