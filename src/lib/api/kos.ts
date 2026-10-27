import type { Facility, Kos, KosFilters, Paginated } from "@/types";

import { FACILITIES } from "@/mocks/kos";
import { getAllKos } from "@/mocks/owner-kos-store";
import { withRoomStatusOverrides } from "@/mocks/room-status";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lists kos matching the search filters.
 *
 * NOTE: mock implementation — filtering/sorting happens in memory. When the
 * real API is ready, replace the body with a fetch to
 * `${process.env.NEXT_PUBLIC_API_BASE_URL}/kos` and keep this exact signature,
 * so no component code changes.
 */
export async function listKos(filters: KosFilters): Promise<Paginated<Kos>> {
  await sleep(MOCK_LATENCY_MS);

  const query = filters.query?.trim().toLowerCase();
  const facilityIds = filters.facilityIds ?? [];

  const filtered = getAllKos().filter((kos) => {
    if (filters.gender && kos.gender !== filters.gender) return false;
    // ASSUMPTION: price filtering compares against the kos starting price.
    if (filters.minPrice !== undefined && kos.monthlyPriceMin < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && kos.monthlyPriceMin > filters.maxPrice) return false;
    if (filters.maxDistanceKm !== undefined && kos.distanceToCampusKm > filters.maxDistanceKm)
      return false;
    if (
      facilityIds.length > 0 &&
      !facilityIds.every((id) => kos.facilities.some((f) => f.id === id))
    ) {
      return false;
    }
    if (query) {
      const haystack =
        `${kos.name} ${kos.district} ${kos.address} ${kos.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "termurah":
      sorted.sort((a, b) => a.monthlyPriceMin - b.monthlyPriceMin);
      break;
    case "termahal":
      sorted.sort((a, b) => b.monthlyPriceMin - a.monthlyPriceMin);
      break;
    case "terdekat":
      sorted.sort((a, b) => a.distanceToCampusKm - b.distanceToCampusKm);
      break;
    case "rating":
      sorted.sort((a, b) => b.ratingAvg - a.ratingAvg);
      break;
    case "terbaru":
      sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    default:
      // "relevan" / no sort: keep the curated default order.
      break;
  }

  // NOTE: pagination is deferred until the real API lands; the mock always
  // returns a single page containing everything.
  return {
    data: sorted.map(withRoomStatusOverrides),
    page: 1,
    perPage: sorted.length,
    totalItems: sorted.length,
  };
}

/** Returns the full facility list for the filter UI. */
export async function getKosFacilities(): Promise<Facility[]> {
  await sleep(MOCK_LATENCY_MS);
  return FACILITIES;
}

/**
 * Finds a single kos by slug for the detail page.
 * Returns null when nothing matches, so the page can render a 404.
 */
export async function getKos(slug: string): Promise<Kos | null> {
  await sleep(MOCK_LATENCY_MS);
  const kos = getAllKos().find((item) => item.slug === slug);
  return kos ? withRoomStatusOverrides(kos) : null;
}
