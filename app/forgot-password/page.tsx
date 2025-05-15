'use client'
import React, { useEffect, useState } from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()

  // Only redirect if user is signed in and hooks are loaded
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  if (!isLoaded) {
    // Show a loading spinner or fallback UI
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <span className="text-white">Loading...</span>
      </div>
    )
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setStep('reset')
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      if (result?.status === 'complete') {
        await setActive?.({ session: result?.createdSessionId }) 
        router.push('/dashboard')
      } else if (result?.status === 'needs_second_factor') {
        setError('2FA is required. Please complete second factor authentication.')
      } else {
        setError('Password reset failed. Try again.')
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="mt-2 text-3xl font-extrabold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email to receive a password reset code.
          </p>
        </div>
        <form
          onSubmit={step === 'request' ? handleRequest : handleReset}
          className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
        >
          {step === 'request' ? (
            <>
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
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </>
          ) : (
            <>
              <label className="text-gray-200 text-sm font-medium" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="text-gray-200 text-sm font-medium" htmlFor="code">
                Reset Code
              </label>
              <input
                id="code"
                type="text"
                required
                className="rounded-md border border-neutral-700 bg-black text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage