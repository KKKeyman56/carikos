"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";

import { KosCard, KosCardSkeleton } from "@/components/kos/kos-card";
import { KosFiltersSidebar } from "@/components/kos/kos-filters-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useKosFilters } from "@/hooks/use-kos-filters";
import { getKosFacilities, listKos } from "@/lib/api/kos";
import type { KosFilters } from "@/types";

const SORT_OPTIONS: Array<{
  value: NonNullable<KosFilters["sort"]>;
  label: string;
}> = [
  { value: "relevan", label: "Paling relevan" },
  { value: "termurah", label: "Harga termurah" },
  { value: "termahal", label: "Harga termahal" },
  { value: "terdekat", label: "Terdekat ke kampus" },
  { value: "rating", label: "Rating tertinggi" },
];

function ResultsSkeleton() {
  return (
    <ul aria-hidden="true" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index}>
          <KosCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/**
 * Client-side search view: filter state lives in the URL, data comes from
 * `lib/api` through TanStack Query with loading / empty / error states.
 */
export function KosSearch() {
  const {
    filters,
    draft,
    isUpdating,
    setFilters,
    handleDraftChange,
    resetFilters,
    activeFilterCount,
  } = useKosFilters();

  const kosListQuery = useQuery({
    queryKey: ["kos", "list", filters],
    queryFn: () => listKos(filters),
  });

  // Facility list is effectively static, so it can live long in cache.
  const facilitiesQuery = useQuery({
    queryKey: ["kos", "facilities"],
    queryFn: getKosFacilities,
    staleTime: Infinity,
  });

  const kosList = kosListQuery.data;

  const filterSidebar = (
    <KosFiltersSidebar
      filters={filters}
      facilities={facilitiesQuery.data ?? []}
      facilitiesPending={facilitiesQuery.isPending}
      draft={draft}
      onSetFilters={setFilters}
      onDraftChange={handleDraftChange}
      onReset={resetFilters}
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Desktop filters sidebar */}
      <aside aria-label="Filter pencarian" className="hidden lg:block">
        <div className="sticky top-20">{filterSidebar}</div>
      </aside>

      <section aria-label="Hasil pencarian" className="min-w-0">
        {/* Search & sort toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Cari nama, area, atau jalan…"
              aria-label="Cari kos"
              className="h-11 pl-10"
              value={draft.q}
              onChange={(event) => handleDraftChange("q", event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="lg"
                    aria-label={
                      activeFilterCount > 0
                        ? `Buka filter, ${activeFilterCount} filter aktif`
                        : "Buka filter"
                    }
                    className="lg:hidden"
                  />
                }
              >
                <SlidersHorizontal aria-hidden="true" />
                Filter
                {activeFilterCount > 0 ? (
                  <Badge className="size-5 min-w-5 p-0 tabular-nums">{activeFilterCount}</Badge>
                ) : null}
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle>Filter pencarian</SheetTitle>
                </SheetHeader>
                <div className="p-4">{filterSidebar}</div>
              </SheetContent>
            </Sheet>
            <Select
              value={filters.sort ?? "relevan"}
              onValueChange={(value) => setFilters({ sort: value === "relevan" ? null : value })}
            >
              {/* `h-11!` wins over the variant-defined height inside SelectTrigger. */}
              <SelectTrigger aria-label="Urutkan hasil" className="h-11! w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result states */}
        {kosListQuery.isPending ? (
          <ResultsSkeleton />
        ) : kosListQuery.isError ? (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
            <p className="font-semibold">Gagal memuat daftar kos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Koneksi lagi ngadat. Coba ulang, ya.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void kosListQuery.refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : kosList && kosList.totalItems === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
            <p className="font-heading font-semibold">Waduh, belum ada kos yang cocok</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coba longgarkan filternya — naikin harga maksimal atau hapus fasilitas tertentu.
            </p>
            <Button className="mt-4" variant="outline" onClick={resetFilters}>
              Atur ulang filter
            </Button>
          </div>
        ) : kosList ? (
          <div className={`mt-6 transition-opacity ${isUpdating ? "opacity-60" : ""}`}>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {kosList.totalItems} kos ditemukan
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {kosList.data.map((kos) => (
                <li key={kos.id}>
                  <KosCard kos={kos} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
