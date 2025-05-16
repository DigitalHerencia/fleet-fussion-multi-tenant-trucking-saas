// "use client" directive for Next.js client-side component
"use client";

// SECTION: Imports
// Import necessary modules and components
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs"; // Clerk hook for sign-up functionality
import logger from "@/lib/utils/logger"; // Custom logger utility

// SECTION: Component Definition
export default function SignUpPage() {
  // SECTION: State Variables
  const [email, setEmail] = useState(""); // State for email input
  const [name, setName] = useState(""); // State for name input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for displaying error messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const router = useRouter(); // Next.js router hook
  const { signUp, isLoaded } = useSignUp(); // Clerk sign-up hook and loading status

  // SECTION: handleSubmit Function
  // Handles the form submission for user sign-up
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true
    setError(""); // Clear any previous errors
    logger.debug("SignUp: form submit", { email });

    // Ensure Clerk is loaded before proceeding
    if (!isLoaded) return;

    // LABEL: CAPTCHA Verification
    // Enforce Clerk CAPTCHA if present
    const captcha = (window as Window & typeof globalThis & { Clerk?: { captcha?: {
      isSolved (): unknown; getToken: () => Promise<string | null> 
} } }).Clerk?.captcha;
    if (captcha && !captcha.isSolved()) {
      setError("Please complete the CAPTCHA challenge.");
      logger.warn("SignUp: CAPTCHA not solved", { email });
      setLoading(false);
      return;
    }

    try {
      // LABEL: Clerk Sign-Up Attempt
      // Attempt to create a new user with Clerk
      const res = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0] || name, // Extract first name
        lastName: name.split(" ").slice(1).join(" ") || undefined, // Extract last name
      });
      logger.info("SignUp: Clerk signUp.create result", { status: res.status, email });

      // LABEL: Handle Sign-Up Completion
      if (res.status === "complete") {
        if (res.createdSessionId) {
          // The `setActive` call here was problematic as `orgId` is not defined in this context.
          // For a new user, organization selection or creation typically happens in onboarding.
          // await setActive({ organization: orgId }); // This line should be reviewed or removed if orgId is not available.
          
          // Redirect to onboarding after successful sign-up.
          // This is the primary Clerk-configured redirection point.
          logger.info("SignUp: redirecting to onboarding", { onboarding: "/onboarding" });
          router.push("/onboarding"); // Redirect to onboarding page
        } else {
          // Handle cases where sign-up is complete but no session is created (e.g., email verification needed)
          setError(
            "Sign up incomplete. Please check your email to verify your account and then sign in."
          );
          logger.warn("SignUp: incomplete status, verification likely needed", { email });
        }
      }
      // Note: Clerk might have other statuses like 'missing_requirements' that could be handled here.
    } catch (rawError: unknown) { // Renamed err to rawError for clarity
      // LABEL: Error Handling
      logger.error("SignUp: error", rawError);

      // Define a type for the expected error structure from Clerk
      interface ClerkErrorType {
        errors?: Array<{
          code?: string;
          message?: string;
          longMessage?: string;
        }>;
        message?: string; // Fallback for other error types or direct message property
      }

      const error = rawError as ClerkErrorType; // Assert rawError to our defined type

      // Clerk specific error handling
      if (error?.errors?.[0]?.code === "form_password_pwned") {
        setError("This password is too common. Please choose a stronger password.");
      } else if (error?.errors?.[0]?.code === "form_password_length") {
        setError("Password is too short. Minimum 8 characters required.");
      } else if (error?.errors?.[0]?.code === "form_identifier_exists") {
        setError("An account with this email already exists. Please sign in.");
      } else {
        // Generic error message
        // Prefer message from Clerk error structure, then from Error instance, then fallback
        setError(error?.message || (rawError instanceof Error ? rawError.message : "Sign up failed."));
      }
    } finally {
      // LABEL: Final Actions
      setLoading(false); // Reset loading state regardless of outcome
    }
  }

  // SECTION: JSX Structure
  return (
    // LABEL: Page Container
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* LABEL: Header Section */}
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
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        {/* LABEL: Sign-Up Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-neutral-900 p-6 shadow-lg rounded-lg border border-neutral-800 flex flex-col gap-4"
        >
          {/* LABEL: Email Input Field */}
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
          {/* LABEL: Name Input Field */}
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
            onChange={(e) => setName(e.target.value)}
          />
          {/* LABEL: Password Input Field */}
          <label
            className="text-gray-200 text-sm font-medium"
            htmlFor="password"
          >
            Password
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
          {/* LABEL: Clerk CAPTCHA Widget */}
          {/* Clerk Smart CAPTCHA widget mount point */}
          <div
            id="clerk-captcha"
            className="my-2"
            data-cl-theme="auto" // Clerk CAPTCHA theme setting
            data-cl-size="flexible" // Clerk CAPTCHA size setting
            data-cl-language="auto" // Clerk CAPTCHA language setting
          />
          {/* LABEL: Error Display */}
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          {/* LABEL: Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-60"
            disabled={loading} // Disable button when loading
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        {/* Optionally, show Clerk's <SignUp /> for social/magic link if not using a custom UI */}
        <div className="mt-6">
          {/* This space can be used for alternative sign-up methods or additional info */}
        </div>
      </div>
    </div>
  );
}
