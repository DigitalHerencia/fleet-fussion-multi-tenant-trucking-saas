'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSignIn, useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MapPinned } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

// Add this at the top of the file, before any usage of window.Clerk
declare global {
  interface Window {
    Clerk?: {
      captcha?: {
        isSolved: () => boolean;
      };
    };
  }
}

function FadeTransition({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 1000); // 1s fade out
    }
  }, [show]);

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ minHeight: '100vh' }}
    >
      {visible && children}
    </div>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isLoaded: isSignInLoaded, setActive } = useSignIn();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [signInAttempted, setSignInAttempted] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    // If already signed in, redirect immediately (prevents showing sign-in page to signed-in users)
    if (isSignedIn && isUserLoaded && user && !signInAttempted) {
      setShowRedirect(true);
      const timeout = setTimeout(() => {
        setShowRedirect(false);
        const { publicMetadata } = user;
        const onboardingComplete = publicMetadata?.onboardingComplete as
          | boolean
          | undefined;
        const organizationId = publicMetadata?.organizationId as
          | string
          | undefined;
        const userId = user.id;
        if (onboardingComplete && organizationId && userId) {
          router.replace(`/${organizationId}/dashboard/${userId}`);
        } else {
          router.replace('/onboarding');
        }
      }, 1000); // 1s fade out before redirect
      return () => clearTimeout(timeout);
    }
    // After sign-in, redirect as before
    if (signInAttempted && isSignedIn && isUserLoaded && user) {
      const { publicMetadata } = user;
      const onboardingComplete = publicMetadata?.onboardingComplete as
        | boolean
        | undefined;
      const organizationId = publicMetadata?.organizationId as
        | string
        | undefined;
      const userId = user.id;
      if (onboardingComplete && organizationId && userId) {
        router.replace(`/${organizationId}/dashboard/${userId}`);
      } else {
        router.replace('/onboarding');
      }
      setSignInAttempted(false);
    } else if (signInAttempted && isSignedIn && isUserLoaded && !user) {
      router.push('/');
      setSignInAttempted(false);
    }
  }, [signInAttempted, isSignedIn, isUserLoaded, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!isSignInLoaded) {
      setLoading(false);
      return;
    }

    const captcha = window.Clerk?.captcha;
    if (captcha && !captcha.isSolved()) {
      setError('Please complete the CAPTCHA challenge.');
      setLoading(false);
      return;
    }

    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status !== 'complete') {
        const firstFactor = res.firstFactorVerification;
        if (firstFactor?.status === 'failed') {
          setError(
            firstFactor.error?.message || 'Sign in verification failed.'
          );
        } else {
          setError(
            'Further verification required or sign in failed. Please check your credentials and try again.'
          );
        }
        setLoading(false);
      } else {
        await setActive({ session: res.createdSessionId });
        setSignInAttempted(true);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);

      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const clerkError = err.errors[0];

        switch (clerkError.code) {
          case 'form_password_incorrect':
            setError('Incorrect password. Try again or reset your password.');
            break;
          case 'form_identifier_not_found':
            setError('No account found with that email.');
            break;
          case 'form_identifier_not_verified':
            setError('Please verify your email before signing in.');
            break;
          case 'session_exists':
            setError('You are already signed in.');
            setSignInAttempted(true);
            break;
          default:
            setError(clerkError.message || 'Sign in failed.');
        }
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError(
          'An unknown error occurred during sign in. Please try again later.'
        );
      }
      setLoading(false);
    }
  }

  // If already signed in, show a redirecting message and disable the form
  if (isSignedIn && isUserLoaded && user && !signInAttempted) {
    return (
      <FadeTransition show={showRedirect}>
        <div className="fixed inset-0 z-50 h-full w-full overflow-hidden bg-black">
          {/* Fullscreen background image */}
          <Image
            src="/twighlight_loading.png"
            alt="Loading Background"
            fill
            style={{ objectFit: 'cover', zIndex: 1 }}
            className="h-full w-full transition-opacity duration-1000"
            priority
          />
          {/* Overlay for contrast and message */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70">
            <div className="w-full max-w-md space-y-8 text-center">
              <h1 className="text-2xl font-bold text-white">Redirecting...</h1>
              <p className="text-gray-400">
                You are already signed in. Redirecting to your dashboard.
              </p>
            </div>
          </div>
        </div>
      </FadeTransition>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
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
            SIGN IN TO YOUR ACCOUNT
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Or{' '}
            <Link
              href="/sign-up"
              className="font-medium text-blue-500 hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-lg"
        >
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
            autoComplete="current-password"
            required
            className="rounded-md border border-neutral-700 bg-black px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !isSignInLoaded}
            className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
