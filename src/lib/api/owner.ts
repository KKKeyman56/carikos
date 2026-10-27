import type { Kos, RoomStatus } from "@/types";

import { MOCK_KOS } from "@/mocks/kos";
import { setRoomStatusOverride, withRoomStatusOverrides } from "@/mocks/room-status";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  return MOCK_KOS.filter((kos) => kos.ownerId === ownerId).map(withRoomStatusOverrides);
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

  const kos = MOCK_KOS.find((item) => item.id === kosId);
  if (!kos || !kos.rooms.some((room) => room.id === roomId)) {
    throw new Error("Kamar tidak ditemukan.");
  }

  setRoomStatusOverride(kosId, roomId, status);
}
