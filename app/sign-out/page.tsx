"use client";
import { SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <SignOutButton afterSignOutUrl="/sign-in"/>
    </main>
  );
}
