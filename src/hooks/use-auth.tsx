"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

import {
  getSessionServerSnapshot,
  getSessionSnapshot,
  removeSessionUser,
  setSessionUser,
  subscribeSession,
} from "@/lib/auth-session";
import type { User } from "@/types";

interface AuthContextValue {
  /** Signed-in user, or null. Reads through an external session store. */
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Session state for the mock auth flow. The user value comes from an external
 * store via useSyncExternalStore: hydration-safe (server renders null), no
 * effect-time state updates, and cross-tab sign-in/out just works.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionServerSnapshot);

  const value: AuthContextValue = {
    user,
    signIn: setSessionUser,
    signOut: removeSessionUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
