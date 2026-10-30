import type { Favorite, Kos } from "@/types";

import { getAllKos } from "@/mocks/owner-kos-store";
import { withReviewAggregates } from "@/mocks/reviews";
import { withRoomStatusOverrides } from "@/mocks/room-status";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Favorites are per account, so one browser can hold several users' lists. */
function storageKey(userId: number): string {
  return `carikos.favorites.${userId}`;
}

function loadFavorites(userId: number): Favorite[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey(userId));
  if (raw === null) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is Favorite =>
        typeof entry === "object" &&
        entry !== null &&
        "kosId" in entry &&
        typeof entry.kosId === "number" &&
        "createdAt" in entry &&
        typeof entry.createdAt === "string",
    );
  } catch {
    // Corrupted storage is treated as "no favorites" instead of crashing.
    return [];
  }
}

function persistFavorites(userId: number, favorites: Favorite[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), JSON.stringify(favorites));
}

/**
 * Returns the kos saved by a user, newest first.
 *
 * NOTE: mock implementation — replace the body with a GET to
 * `${NEXT_PUBLIC_API_BASE_URL}/users/${userId}/favorites` and keep this exact
 * signature. ASSUMPTION: the endpoint returns populated kos objects; if it
 * returns IDs only, resolve them here so components stay unchanged.
 */
export async function listFavorites(userId: number): Promise<Kos[]> {
  await sleep(MOCK_LATENCY_MS);

  const allKos = withReviewAggregates(getAllKos());

  return loadFavorites(userId)
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((favorite) => allKos.find((kos) => kos.id === favorite.kosId))
    .filter((kos): kos is Kos => kos !== undefined)
    .map(withRoomStatusOverrides);
}

/**
 * Saves a kos to the user's favorites. Idempotent: saving twice is a no-op.
 *
 * NOTE: mock implementation — replace the body with a POST to
 * `${NEXT_PUBLIC_API_BASE_URL}/users/${userId}/favorites`.
 */
export async function addFavorite(userId: number, kosId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);

  if (!getAllKos().some((kos) => kos.id === kosId)) {
    throw new Error("Kos tidak ditemukan.");
  }

  const favorites = loadFavorites(userId);
  if (favorites.some((favorite) => favorite.kosId === kosId)) return;

  favorites.push({ kosId, createdAt: new Date().toISOString() });
  persistFavorites(userId, favorites);
}

/**
 * Removes a kos from the user's favorites. Idempotent: removing an unsaved kos
 * is a no-op.
 *
 * NOTE: mock implementation — replace the body with a DELETE to
 * `${NEXT_PUBLIC_API_BASE_URL}/users/${userId}/favorites/${kosId}`.
 */
export async function removeFavorite(userId: number, kosId: number): Promise<void> {
  await sleep(MOCK_LATENCY_MS);

  const favorites = loadFavorites(userId);
  persistFavorites(
    userId,
    favorites.filter((favorite) => favorite.kosId !== kosId),
  );
}
