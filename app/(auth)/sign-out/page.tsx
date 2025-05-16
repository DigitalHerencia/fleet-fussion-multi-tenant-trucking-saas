"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import logger from "@/lib/utils/logger";

export default function SignOutPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    logger.debug("SignOut: sign out button clicked");
    try {
      await signOut();
      logger.info("SignOut: sign out success");
      router.push("/sign-in");
    } catch (err) {
      logger.error("SignOut: error", err);
    }
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

