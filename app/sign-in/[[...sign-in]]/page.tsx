"use client"

import Link from "next/link"
import { MapPinned } from "lucide-react"
import { SignIn } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export default function SignInPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
      
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center space-x-2">
            <MapPinned className="h-8 w-8 text-primary" />
            <span className="font-extrabold text-blue-700 dark:text-blue-400 text-3xl">
              FleetFusion
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>
        
        <div className="mt-8 bg-background p-6 shadow-sm sm:rounded-lg sm:px-10 border flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-primary hover:bg-primary/80 text-primary-foreground",
                card: "bg-transparent shadow-none",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-border text-foreground",
                formFieldLabel: "text-foreground",
                formFieldInput: "bg-background border-input",
                footer: "hidden",
              }
            }}
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  )
}