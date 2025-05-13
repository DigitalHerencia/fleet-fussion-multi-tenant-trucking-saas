"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <SignUp routing="path" path="/sign-up" />
    </main>
  );
}
