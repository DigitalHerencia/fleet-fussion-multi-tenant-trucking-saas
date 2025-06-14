'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSignUp, useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MapPinned } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect already signed-in users away from sign-up page
  useEffect(() => {
    if (isSignedIn && isUserLoaded && user) {
      const onboardingComplete = user.publicMetadata?.onboardingComplete as
        | boolean
        | undefined;
      const organizationId = user.publicMetadata?.organizationId as
        | string
        | undefined;
      const userId = user.id;
      if (onboardingComplete && organizationId && userId) {
        router.replace(`/${organizationId}/dashboard/${userId}`);
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isSignedIn, isUserLoaded, user, router]);

  if (isSignedIn && isUserLoaded && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <span className="text-white">Redirecting...</span>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLoaded) return;

    try {
      const res = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });

      // Handle verification if needed
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/onboarding');
        return;
      } else {
        // Handle email verification flow
        router.replace('/verify-email');
        return;
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const clerkError = err.errors[0];
        switch (clerkError.code) {
          case 'form_password_pwned':
            setError(
              'This password is too common. Please choose a stronger password.'
            );
            break;
          case 'form_password_length':
            setError('Password is too short. Minimum 8 characters required.');
            break;
          case 'form_identifier_exists':
            setError(
              'An account with this email already exists. Please sign in.'
            );
            break;
          case 'form_password_validation':
            setError(
              'Password must contain at least 8 characters with letters and numbers.'
            );
            break;
          default:
            setError(clerkError.message || 'Sign up failed. Please try again.');
        }
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Sign up failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex flex-1 items-center">
            <Link
              className="flex items-center justify-center underline-offset-4 hover:text-blue-500 hover:underline"
              href="/"
            >
              <MapPinned className="mr-1 h-6 w-6 text-blue-500" />
              <span className="text-2xl font-extrabold text-white dark:text-white">
                FleetFusion
              </span>
            </Link>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            CREATE YOUR ACCOUNT
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-blue-500 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-lg"
        >
          <label className="text-sm font-medium text-gray-200" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label className="text-sm font-medium text-gray-200" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label
            className="text-sm font-medium text-gray-200"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {/* Clerk CAPTCHA Widget */}
          <div
            id="clerk-captcha"
            data-cl-theme="dark"
            data-cl-size="flexible"
            data-cl-language="auto"
            className="my-4 flex justify-center"
          />

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
