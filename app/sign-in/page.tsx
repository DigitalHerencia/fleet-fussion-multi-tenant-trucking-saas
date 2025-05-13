"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <SignIn routing="path" path="/sign-in" />
    </main>
  );
}
