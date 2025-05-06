import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <Shield className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have the necessary permissions to access this page. Please contact your administrator for more information.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}