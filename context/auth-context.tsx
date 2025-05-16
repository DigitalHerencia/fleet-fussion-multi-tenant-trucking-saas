"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import logger from "@/lib/utils/logger";

export interface AuthContextType {
  user: ReturnType<typeof useUser>["user"];
  organization: ReturnType<typeof useOrganization>["organization"] | null;
  isSignedIn: boolean;
  isOrgSelected: boolean;
  orgId: string | null;
  userId: string | null;
  orgRole: string | null;
  redirectToSignIn: (redirectUrl?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn: isUserSignedIn } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const isOrgSelected = !!organization?.id;
  const orgId = organization?.id ?? null;
  const userId = user?.id ?? null;
  // Clerk org role is available on user.organizationMemberships
  const orgRole =
    user?.organizationMemberships?.find((m) => m.organization.id === orgId)
      ?.role ?? null;

  logger.debug("AuthContext: provider initialized", { userId, orgId, orgRole });

  const redirectToSignIn = (redirectUrl?: string) => {
    const baseUrl = "/sign-in";
    const url = redirectUrl
      ? `${baseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`
      : baseUrl;
    logger.info("AuthContext: redirectToSignIn", { url });
    router.push(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isSignedIn: !!isUserSignedIn,
        isOrgSelected,
        orgId,
        userId,
        orgRole,
        redirectToSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

