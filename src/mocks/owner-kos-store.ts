import type { Kos } from "@/types";

import { MOCK_KOS } from "@/mocks/kos";

/**
 * Mock-only storage for listings created or edited from the owner dashboard.
 *
 * The seeded catalogue in `@/mocks/kos` is static module data, so owner edits
 * are kept as an overlay in localStorage and merged back whenever kos data is
 * read. This module is scaffolding for the mock phase: once the backend owns
 * listings, delete it and let the API return the real data.
 *
 * ASSUMPTION: the backend will expose `POST /kos` and `PUT /kos/:id` with the
 * same `KosInput` shape used by the dashboard form.
 */
const STORAGE_KEY = "carikos.ownerKos";

/** Minimal runtime guard so corrupted localStorage cannot break the app. */
function isKos(value: unknown): value is Kos {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.ownerId === "number" &&
    typeof candidate.slug === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.rooms) &&
    Array.isArray(candidate.photoUrls) &&
    Array.isArray(candidate.facilities)
  );
}

/** Stored listings (created or edited), newest first. */
export function readStoredKos(): Kos[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isKos);
  } catch {
    return [];
  }
}

/** Inserts or replaces one stored listing by id. */
export function saveStoredKos(kos: Kos): void {
  if (typeof window === "undefined") return;
  const stored = readStoredKos();
  const next = [kos, ...stored.filter((item) => item.id !== kos.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/**
 * Seed catalogue with the owner overlay applied: edited listings replace the
 * seeded version by id, and newly created listings are prepended.
 */
export function getAllKos(): Kos[] {
  const stored = readStoredKos();
  if (stored.length === 0) return MOCK_KOS;

  const storedById = new Map(stored.map((kos) => [kos.id, kos]));
  const seeded = MOCK_KOS.map((kos) => storedById.get(kos.id) ?? kos);
  const seededIds = new Set(MOCK_KOS.map((kos) => kos.id));
  const created = stored.filter((kos) => !seededIds.has(kos.id));

  return [...created, ...seeded];
}

/** Checks whether another listing already uses this slug. */
export function isSlugTaken(slug: string, exceptId?: number): boolean {
  return getAllKos().some((kos) => kos.slug === slug && kos.id !== exceptId);
}
