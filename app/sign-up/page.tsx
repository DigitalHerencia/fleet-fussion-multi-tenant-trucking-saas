import React from "react"
import Image from "next/image"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Image
                        src="/map-pinned.png"
                        alt="FleetFusion Logo"
                        width={64}
                        height={64}
                        className="mx-auto"
                    />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Start managing your fleet efficiently with FleetFusion
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-primary hover:bg-primary/90 text-primary-foreground",
                                card: "bg-transparent shadow-none",
                                footer: "text-xs text-gray-500 dark:text-gray-400"
                            }
                        }}
                        redirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_REDIRECT_URL}
                        path="/sign-up"
                    />
                </div>

                <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} FleetFusion. Enterprise-grade fleet
                    management.
                </p>
            </div>
        </div>
    )
}
