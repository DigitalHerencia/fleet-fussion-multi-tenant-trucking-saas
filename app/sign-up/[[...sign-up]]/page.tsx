"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { signUp, isLoaded } = useSignUp()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        if (!isLoaded) return
        try {
            const res = await signUp.create({
                emailAddress: email,
                password,
                firstName: name.split(" ")[0] || name,
                lastName: name.split(" ").slice(1).join(" ") || undefined
            })
            if (res.status === "complete") {
                router.push("/onboarding")
            } else {
                setError(
                    "Sign up incomplete. Please check your email to verify your account and then sign in."
                )
            }
        } catch (err: any) {
            setError(err?.errors?.[0]?.message || "Sign up failed.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <Link href="/" className="flex items-center space-x-2 mb-2">
                        <Image
                            src="/white.png"
                            alt="FleetFusion Logo"
                            width={220}
                            height={60}
                            priority
                        />
                    </Link>
                    <h1 className="mt-2 text-3xl font-extrabold text-white">Create your account</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="font-medium text-blue-400 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
                >
                    <label className="text-gray-200 text-sm font-medium" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label className="text-gray-200 text-sm font-medium" htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <label className="text-gray-200 text-sm font-medium" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {/* Clerk Smart CAPTCHA widget mount point */}
                    <div
                        id="clerk-captcha"
                        className="my-2"
                        data-cl-theme="auto"
                        data-cl-size="flexible"
                        data-cl-language="auto"
                    />
                    {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>
                </form>
                {/* Optionally, show Clerk's <SignUp /> for social/magic link */}
                {/* <SignUp afterSignUpUrl="/onboarding" /> */}
            </div>
        </div>
    )
}
