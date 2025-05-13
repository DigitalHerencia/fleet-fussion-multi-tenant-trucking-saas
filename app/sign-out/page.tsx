"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Button onClick={handleSignOut}>Sign Out</Button>
    </main>
  );
}
function signOut ()
{
  throw new Error( "Function not implemented." );
}

