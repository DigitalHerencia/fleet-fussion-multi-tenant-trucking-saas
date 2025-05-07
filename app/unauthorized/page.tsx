import Link from "next/link"

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Access Denied</h1>
            <p className="mb-6 text-lg text-muted-foreground">
                You do not have permission to view this page.
                <br />
                If you believe this is an error, please contact your administrator.
            </p>
            <Link href="/" className="text-blue-600 underline hover:text-blue-800">
                Return to Dashboard
            </Link>
        </div>
    )
}
