"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SignIn, useSignIn } from "@clerk/nextjs"

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();

  // Optionally, you can use Clerk's <SignIn /> component for magic link/social
  // But here is a custom form for email/password
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!isLoaded) return;
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        router.push("/company-selection");
      } else {
        setError("Sign in failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center space-x-2 mb-2">
            <Image src="/white.png" alt="FleetFusion Logo" width={220} height={60} priority />
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Or{' '}
            <Link href="/sign-up" className="font-medium text-blue-400 hover:underline">create a new account</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4">
          <label className="text-gray-200 text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label className="text-gray-200 text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <Link href="/forgot-password" className="text-blue-400 text-sm hover:underline">Forgot password?</Link>
          </div>
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}