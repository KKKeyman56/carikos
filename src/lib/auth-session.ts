import type { User } from "@/types";

/**
 * Session store for the mock auth flow — an external system backed by
 * localStorage, exposed through useSyncExternalStore semantics so React
 * controls grid tearing and hydration (no effect-time setState).
 *
 * ASSUMPTION: the real backend will issue tokens/cookies instead — when that
 * lands, swap this store for whatever the API layer provides and keep the
 * same listener contract.
 */
const STORAGE_KEY = "carikos.user";

type SessionListener = () => void;

const listeners = new Set<SessionListener>();

/** Cached snapshot: read once, then kept in sync by signIn/signOut. */
let cachedUser: User | null = null;
/** Marker so getSnapshot can hydrate lazily on first client read. */
let isHydrated = false;

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function parseStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    // Light shape check so corrupted storage falls back to "not signed in".
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "name" in parsed &&
      "role" in parsed
    ) {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

function subscribeSession(listener: SessionListener): () => void {
  listeners.add(listener);
  // React to sign-ins in other tabs too.
  const onStorage = (event: StorageEvent): void => {
    if (event.key === STORAGE_KEY || event.key === null) {
      listener();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Client snapshot; hydrates from storage on the very first read. */
function getSnapshot(): User | null {
  if (!isHydrated) {
    cachedUser = parseStoredUser();
    isHydrated = true;
  }
  return cachedUser;
}

/** Server snapshot: always "not signed in" during SSR/hydration. */
function getServerSnapshot(): User | null {
  return null;
}

/**
 * Persists the signed-in user and notifies all subscribers (same tab; other
 * tabs learn via the `storage` event).
 */
function setSessionUser(user: User): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  cachedUser = user;
  isHydrated = true;
  emit();
}

function removeSessionUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  cachedUser = null;
  isHydrated = true;
  emit();
}

export {
  getServerSnapshot as getSessionServerSnapshot,
  getSnapshot as getSessionSnapshot,
  removeSessionUser,
  setSessionUser,
  subscribeSession,
};
