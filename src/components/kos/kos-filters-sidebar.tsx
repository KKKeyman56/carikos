"use client";

import type { FilterUpdate } from "@/hooks/use-kos-filters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Facility, KosFilters } from "@/types";

const GENDER_OPTIONS = [
  { value: null, label: "Semua" },
  { value: "putra", label: "Putra" },
  { value: "putri", label: "Putri" },
  { value: "campur", label: "Campur" },
] satisfies Array<{ value: KosFilterGender | null; label: string }>;

type KosFilterGender = NonNullable<KosFilters["gender"]>;

const DISTANCE_OPTIONS = [
  { value: null, label: "Semua jarak" },
  { value: "1", label: "\u2264 1 km" },
  { value: "3", label: "\u2264 3 km" },
  { value: "5", label: "\u2264 5 km" },
  { value: "10", label: "\u2264 10 km" },
] as const;

export interface KosFiltersSidebarProps {
  filters: KosFilters;
  facilities: Facility[];
  facilitiesPending: boolean;
  draft: Record<"q" | "minPrice" | "maxPrice", string>;
  onSetFilters: (updates: FilterUpdate) => void;
  onDraftChange: (key: "q" | "minPrice" | "maxPrice", value: string) => void;
  onReset: () => void;
}

/**
 * The filter controls shared by the desktop sidebar and the mobile
 * filter drawer. Kept presentational: state lives in `useKosFilters`.
 */
export function KosFiltersSidebar({
  filters,
  facilities,
  facilitiesPending,
  draft,
  onSetFilters,
  onDraftChange,
  onReset,
}: KosFiltersSidebarProps) {
  const selectedFacilityIds = filters.facilityIds ?? [];

  const toggleFacility = (facilityId: number, checked: boolean) => {
    const next = checked
      ? [...selectedFacilityIds, facilityId]
      : selectedFacilityIds.filter((id) => id !== facilityId);
    onSetFilters({ facilities: next.length > 0 ? next.join(",") : null });
  };

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="text-sm font-semibold">Tipe kos</legend>
        <div role="group" aria-label="Tipe kos" className="mt-2 flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => {
            const selected = (filters.gender ?? null) === option.value;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={selected}
                className={`flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
                onClick={() => onSetFilters({ gender: selected ? null : option.value })}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Harga per bulan</legend>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
            >
              Rp
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={50000}
              placeholder="Terendah"
              aria-label="Harga minimum per bulan"
              className="h-11 pl-8"
              value={draft.minPrice}
              onChange={(event) => onDraftChange("minPrice", event.target.value)}
            />
          </div>
          <span aria-hidden="true" className="text-muted-foreground">
            &ndash;
          </span>
          <div className="relative flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
            >
              Rp
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              step={50000}
              placeholder="Tertinggi"
              aria-label="Harga maksimum per bulan"
              className="h-11 pl-8"
              value={draft.maxPrice}
              onChange={(event) => onDraftChange("maxPrice", event.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Jarak ke kampus</legend>
        <div role="group" aria-label="Jarak ke kampus" className="mt-2 flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((option) => {
            const selected =
              option.value === null
                ? filters.maxDistanceKm === undefined
                : filters.maxDistanceKm === Number(option.value);
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={selected}
                className={`flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
                onClick={() => onSetFilters({ maxDistance: selected ? null : option.value })}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Fasilitas</legend>
        {facilitiesPending ? (
          <div className="mt-3 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-3/4" />
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {facilities.map((facility) => (
              <div key={facility.id} className="flex items-center gap-3">
                <Checkbox
                  id={`facility-${facility.id}`}
                  checked={selectedFacilityIds.includes(facility.id)}
                  onCheckedChange={(checked) => {
                    toggleFacility(facility.id, checked === true);
                  }}
                />
                <Label htmlFor={`facility-${facility.id}`} className="font-normal">
                  {facility.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <Button variant="outline" onClick={onReset}>
        Atur ulang filter
      </Button>
    </div>
  );
}
