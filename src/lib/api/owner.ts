import type { Facility, Kos, KosInput, Room, RoomStatus } from "@/types";

import { FACILITIES, DEFAULT_RULES, placeholderOwnerPhone, toSlug } from "@/mocks/kos";
import { getAllKos, isSlugTaken, saveStoredKos } from "@/mocks/owner-kos-store";
import { setRoomStatusOverride, withRoomStatusOverrides } from "@/mocks/room-status";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function facilitiesByIds(ids: number[]): Facility[] {
  return FACILITIES.filter((facility) => ids.includes(facility.id));
}

/** Builds a slug that no other listing uses, e.g. "kos-melati-2". */
function uniqueSlug(name: string, exceptId?: number): string {
  const base = toSlug(name) || `kos-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (isSlugTaken(candidate, exceptId)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/**
 * Lists the kos owned by a user for the owner dashboard.
 *
 * NOTE: mock implementation — replace the body with a GET to
 * `${NEXT_PUBLIC_API_BASE_URL}/owner/kos` (auth token identifies the owner) and
 * keep this exact signature.
 */
export async function listOwnerKos(ownerId: number): Promise<Kos[]> {
  await sleep(MOCK_LATENCY_MS);

  return getAllKos()
    .filter((kos) => kos.ownerId === ownerId)
    .map(withRoomStatusOverrides);
}

/**
 * Creates a listing for the signed-in owner.
 *
 * NOTE: mock implementation — replace the body with a POST to
 * `${NEXT_PUBLIC_API_BASE_URL}/kos` and keep this exact signature.
 */
export async function createKos(ownerId: number, input: KosInput): Promise<Kos> {
  await sleep(MOCK_LATENCY_MS);

  if (input.rooms.length === 0) {
    throw new Error("Minimal satu kamar harus diisi.");
  }

  const id = getAllKos().reduce((max, kos) => Math.max(max, kos.id), 0) + 1;
  const slug = uniqueSlug(input.name);
  const now = new Date().toISOString();

  const rooms: Room[] = input.rooms.map((room, index) => ({
    id: id * 100 + index,
    kosId: id,
    name: room.name.trim(),
    size: room.size.trim(),
    status: "kosong",
    monthlyPrice: room.monthlyPrice,
  }));
  const prices = rooms.map((room) => room.monthlyPrice);

  const kos: Kos = {
    id,
    ownerId,
    name: input.name.trim(),
    slug,
    description: input.description.trim(),
    gender: input.gender,
    address: input.address.trim(),
    district: input.district.trim(),
    city: "Depok",
    latitude: input.latitude,
    longitude: input.longitude,
    distanceToCampusKm: input.distanceToCampusKm,
    monthlyPriceMin: Math.min(...prices),
    monthlyPriceMax: Math.max(...prices),
    facilities: facilitiesByIds(input.facilityIds),
    rooms,
    photoUrls: [1, 2, 3].map((n) => `https://picsum.photos/seed/carikos-${slug}-${n}/640/480`),
    rules: DEFAULT_RULES,
    // ASSUMPTION: the backend derives the owner contact from the auth token.
    ownerPhone: placeholderOwnerPhone(id, ownerId),
    // A fresh listing has no reviews yet; the UI renders this as "Baru".
    ratingAvg: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  saveStoredKos(kos);
  return kos;
}

/**
 * Updates one of the owner's listings, keeping room ids stable so saved room
 * availability and favorites stay attached.
 *
 * NOTE: mock implementation — replace the body with a PUT to
 * `${NEXT_PUBLIC_API_BASE_URL}/kos/${kosId}` and keep this exact signature.
 */
export async function updateKos(ownerId: number, kosId: number, input: KosInput): Promise<Kos> {
  await sleep(MOCK_LATENCY_MS);

  const existing = getAllKos().find((kos) => kos.id === kosId);
  if (!existing || existing.ownerId !== ownerId) {
    throw new Error("Kos nggak ditemukan atau bukan milik akun ini.");
  }
  if (input.rooms.length === 0) {
    throw new Error("Minimal satu kamar harus diisi.");
  }

  // Read through the room-status overlay so an owner toggling a room on the
  // dashboard and then editing the listing does not reset its status.
  const current = withRoomStatusOverrides(existing);
  const slug = existing.name === input.name ? existing.slug : uniqueSlug(input.name, kosId);

  let nextRoomId = current.rooms.reduce((max, room) => Math.max(max, room.id), kosId * 100) + 1;
  const rooms: Room[] = input.rooms.map((room) => {
    const previous =
      room.id === undefined ? undefined : current.rooms.find((item) => item.id === room.id);
    return {
      id: previous?.id ?? nextRoomId++,
      kosId,
      name: room.name.trim(),
      size: room.size.trim(),
      status: previous?.status ?? "kosong",
      monthlyPrice: room.monthlyPrice,
    };
  });
  const prices = rooms.map((room) => room.monthlyPrice);

  const updated: Kos = {
    ...existing,
    name: input.name.trim(),
    slug,
    description: input.description.trim(),
    gender: input.gender,
    address: input.address.trim(),
    district: input.district.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    distanceToCampusKm: input.distanceToCampusKm,
    monthlyPriceMin: Math.min(...prices),
    monthlyPriceMax: Math.max(...prices),
    facilities: facilitiesByIds(input.facilityIds),
    rooms,
    updatedAt: new Date().toISOString(),
  };

  saveStoredKos(updated);
  return updated;
}

/**
 * Marks one room as available or occupied.
 *
 * NOTE: mock implementation — replace the body with a PATCH to
 * `${NEXT_PUBLIC_API_BASE_URL}/kos/${kosId}/rooms/${roomId}`. ASSUMPTION: the
 * real endpoint authorizes the request against the signed-in owner.
 */
export async function updateRoomStatus(
  kosId: number,
  roomId: number,
  status: RoomStatus,
): Promise<void> {
  await sleep(MOCK_LATENCY_MS);

  const kos = getAllKos().find((item) => item.id === kosId);
  if (!kos || !kos.rooms.some((room) => room.id === roomId)) {
    throw new Error("Kamar tidak ditemukan.");
  }

  setRoomStatusOverride(kosId, roomId, status);
}
