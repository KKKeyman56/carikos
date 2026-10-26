/**
 * Single source of truth for data shapes shared between frontend and backend.
 *
 * The backend contract is not final yet, so everything marked with
 * `ASSUMPTION:` must be re-checked before API integration.
 */

/** ASSUMPTION: user roles as defined in the spec. */
export type UserRole = "seeker" | "owner" | "admin";

/** ASSUMPTION: kos gender policy, values from the spec. */
export type KosGender = "putra" | "putri" | "campur";

/** ASSUMPTION: room availability status, exact enum needs backend confirmation. */
export type RoomStatus = "kosong" | "terisi";

export interface User {
  id: number; // ASSUMPTION: numeric ID from the database
  name: string;
  email: string;
  phone: string; // ASSUMPTION: required, used for the WhatsApp contact flow
  role: UserRole;
  avatarUrl: string | null; // null when the user has no photo yet
}

export interface Facility {
  id: number;
  name: string;
  /** ASSUMPTION: we render icons ourselves; could be a slug like "ac" | "wifi". */
  icon: string | null;
}

export interface Room {
  id: number;
  kosId: number;
  name: string;
  /** ASSUMPTION: free-form size string like "3x4 m" until backend confirms. */
  size: string;
  status: RoomStatus;
  /** Monthly price in IDR, integer (e.g. 750000). */
  monthlyPrice: number;
}

export interface Kos {
  id: number;
  ownerId: number;
  name: string;
  /** Used in the detail page URL, e.g. /kos/kos-melati-depok. */
  slug: string;
  description: string;
  gender: KosGender;
  address: string;
  /** Area of Depok, e.g. "Beji", "Pancoran Mas". */
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  /** Distance to the Universitas Gunadarma campus in km. ASSUMPTION: provided by backend. */
  distanceToCampusKm: number;
  /** Monthly price range in IDR. */
  monthlyPriceMin: number;
  monthlyPriceMax: number;
  facilities: Facility[];
  rooms: Room[];
  photoUrls: string[];
  /** ASSUMPTION: house rules as plain text until backend defines the structure. */
  rules: string[];
  /**
   * ASSUMPTION: single contact number for the WhatsApp flow. The real API may
   * expose a nested owner object instead — adapt here, not in components.
   */
  ownerPhone: string;
  /** 0-5, rounded to one decimal. */
  ratingAvg: number;
  /** ISO date strings. */
  createdAt: string;
  updatedAt: string;
}

/**
 * A saved/bookmarked kos. Kept out of the `Kos` shape because it is per-user
 * state, not a property of the listing itself.
 *
 * ASSUMPTION: the backend may return favorites as a relation or a list of IDs
 * instead of this envelope — adapt inside `lib/api/favorites.ts`.
 */
export interface Favorite {
  kosId: number;
  /** ISO date string, used to keep the newest favorites first. */
  createdAt: string;
}

/** ASSUMPTION: pagination envelope — confirm the exact shape with the backend. */
export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  totalItems: number;
}

/** Search filter values; kept in URL search params so results are shareable. */
export interface KosFilters {
  query?: string;
  gender?: KosGender;
  /** Price range in IDR per month. */
  minPrice?: number;
  maxPrice?: number;
  facilityIds?: number[];
  /** Max distance to the campus in km. */
  maxDistanceKm?: number;
  sort?: "relevan" | "terbaru" | "termurah" | "termahal" | "terdekat" | "rating";
}

/**
 * ASSUMPTION: auth request/response shapes until the backend contract is set.
 * Passwords travel plainly inside this mock layer only — the real API is
 * expected to handle hashing, sessions, and tokens server-side.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
}
