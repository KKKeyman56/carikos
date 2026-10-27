import type { Kos, RoomStatus } from "@/types";

/**
 * Mock-only persistence for room availability edited from the owner dashboard.
 *
 * The mock catalogue in `@/mocks/kos` is static module data, so edits are kept
 * as an overlay in localStorage and applied whenever kos data is read. This
 * module is scaffolding for the mock phase: once the backend owns room status,
 * delete it and let the API return the real value.
 *
 * ASSUMPTION: the backend will expose something like
 * `PATCH /kos/:kosId/rooms/:roomId` with `{ status }`.
 */
const STORAGE_KEY = "carikos.roomStatusOverrides";

type RoomStatusOverrides = Record<string, RoomStatus>;

function overrideKey(kosId: number, roomId: number): string {
  return `${kosId}:${roomId}`;
}

function readOverrides(): RoomStatusOverrides {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const overrides: RoomStatusOverrides = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === "kosong" || value === "terisi") {
        overrides[key] = value;
      }
    }
    return overrides;
  } catch {
    return {};
  }
}

/** Stores an availability change for one room. */
export function setRoomStatusOverride(kosId: number, roomId: number, status: RoomStatus): void {
  if (typeof window === "undefined") return;
  const overrides = readOverrides();
  overrides[overrideKey(kosId, roomId)] = status;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/** Returns a copy of the kos with the stored room statuses applied. */
export function withRoomStatusOverrides(kos: Kos): Kos {
  const overrides = readOverrides();
  let changed = false;

  const rooms = kos.rooms.map((room) => {
    const override = overrides[overrideKey(kos.id, room.id)];
    if (override === undefined || override === room.status) return room;
    changed = true;
    return { ...room, status: override };
  });

  return changed ? { ...kos, rooms } : kos;
}
