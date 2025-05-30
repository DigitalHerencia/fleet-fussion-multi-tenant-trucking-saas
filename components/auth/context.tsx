'use client'

/**
 * Minimal RBAC-only Auth Context (client-side user info only)
 * 
 * Provides a lightweight authentication context for client-side
 * user information with Role-Based Access Control (RBAC) support
 */

import { createContext, useContext } from 'react';

export interface RBACUserContext {
  userId: string;
  role: string;
  email: string;
}

const AuthContext = createContext<RBACUserContext | null>(null);

/**
 * Auth Provider Component
 * Provides the RBAC user context to the application
 */
export function AuthProvider({ user, children }: { user: RBACUserContext | null, children: React.ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state
 */
export function useAuth() {
  return useContext(AuthContext);
}
