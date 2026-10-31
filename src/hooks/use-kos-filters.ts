"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { KosFilters, KosGender } from "@/types";

const DEBOUNCE_MS = 350;

/** Keys that receive typed text get debounced before they hit the URL. */
type DraftKey = "q" | "minPrice" | "maxPrice";

export type FilterUpdate = Partial<
  Record<
    "q" | "gender" | "minPrice" | "maxPrice" | "facilities" | "maxDistance" | "sort" | "view",
    string | null
  >
>;

const GENDERS: KosGender[] = ["putra", "putri", "campur"];

const SORTS: NonNullable<KosFilters["sort"]>[] = [
  "relevan",
  "terbaru",
  "termurah",
  "termahal",
  "terdekat",
  "rating",
];

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  if (!value) return undefined;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  return undefined;
}

function parseNumberParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Owns the search filter state and keeps it synced with URL search params,
 * so any result set can be shared via its link.
 */
export function useKosFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isUpdating, startTransition] = useTransition();

  // Draft values for text-like fields so typing feels instant; the URL (and
  // therefore the query) only updates once the debounce timer settles.
  const [draft, setDraft] = useState<Record<DraftKey, string>>({
    q: searchParams.get("q") ?? "",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback(
    (updates: FilterUpdate) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const queryString = next.toString();
      startTransition(() =>
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false }),
      );
    },
    [pathname, router, searchParams],
  );

  /** Commits discrete controls (gender, distance, facilities, sort) right away. */
  const setFilters = useCallback((updates: FilterUpdate) => commit(updates), [commit]);

  /** Debounced commit for text-like inputs. */
  const handleDraftChange = useCallback(
    (key: DraftKey, value: string) => {
      setDraft((current) => ({ ...current, [key]: value }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => commit({ [key]: value }), DEBOUNCE_MS);
    },
    [commit],
  );

  const resetFilters = useCallback(() => {
    setDraft({ q: "", minPrice: "", maxPrice: "" });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commit({
      q: null,
      gender: null,
      minPrice: null,
      maxPrice: null,
      facilities: null,
      maxDistance: null,
      sort: null,
    });
  }, [commit]);

  // Clear any pending debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filters = useMemo<KosFilters>(() => {
    const facilityRaw = searchParams.get("facilities");
    const facilityIds = facilityRaw
      ? facilityRaw
          .split(",")
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];
    const query = searchParams.get("q");
    return {
      query: query ? query : undefined,
      gender: parseEnum(searchParams.get("gender"), GENDERS),
      minPrice: parseNumberParam(searchParams.get("minPrice")),
      maxPrice: parseNumberParam(searchParams.get("maxPrice")),
      facilityIds: facilityIds.length > 0 ? facilityIds : undefined,
      maxDistanceKm: parseNumberParam(searchParams.get("maxDistance")),
      sort: parseEnum(searchParams.get("sort"), SORTS),
    };
  }, [searchParams]);

  // Map/list view is stored in the URL too, so shared links keep the chosen view.
  const view = searchParams.get("view") === "map" ? "map" : "list";

  /** Active filter count for the mobile filter button badge (query excluded). */
  const activeFilterCount = useMemo(
    () =>
      [
        filters.gender,
        filters.minPrice,
        filters.maxPrice,
        filters.facilityIds,
        filters.maxDistanceKm,
      ].filter(Boolean).length,
    [filters],
  );

  return {
    filters,
    draft,
    view,
    isUpdating,
    setFilters,
    handleDraftChange,
    resetFilters,
    activeFilterCount,
  };
}
