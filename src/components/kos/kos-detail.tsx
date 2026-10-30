"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Heart, MapPin, MessageCircle, Star } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";

import { GenderBadge } from "@/components/kos/gender-badge";
import { KosGallery } from "@/components/kos/kos-gallery";
import { ReviewSection } from "@/components/kos/review-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { getKos } from "@/lib/api/kos";
import { formatIDR } from "@/lib/format";
import { cn } from "cn";
import type { Kos, RoomStatus } from "@/types";

// Leaflet accesses `window`, so the map must be loaded client-side only.
const KosLocationMap = dynamic(
  () => import("@/components/kos/kos-location-map").then((m) => m.KosLocationMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  },
);

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-heading text-lg font-semibold">{children}</h2>;
}

function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return status === "kosong" ? (
    <Badge className="bg-success/10 text-success dark:bg-success/20">Tersedia</Badge>
  ) : (
    <Badge variant="secondary">Terisi</Badge>
  );
}

/** Shell shown while the detail data loads or as a Suspense fallback. */
export function KosDetailSkeleton() {
  return (
    <div aria-hidden="true" className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-9 w-2/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-4 aspect-[16/9] w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="mt-8 flex flex-col gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      <Card className="py-4">
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Detail view for a single kos. Data flows through the api layer only
 * (`getKos`), with explicit pending / error / not-found states.
 */
export function KosDetail({ slug }: { slug: string }) {
  const kosQuery = useQuery({
    queryKey: ["kos", "detail", slug],
    queryFn: () => getKos(slug),
  });

  if (kosQuery.isPending) {
    return <KosDetailSkeleton />;
  }

  if (kosQuery.isError) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">Gagal memuat detail kos</p>
        <p className="mt-1 text-sm text-muted-foreground">Koneksi lagi ngadat. Coba ulang, ya.</p>
        <Button className="mt-4" variant="outline" onClick={() => void kosQuery.refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  const kos = kosQuery.data;
  if (!kos) {
    // Slug resolved but no match: treat the URL as stale, not a crash.
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-heading font-semibold">Kos tidak ditemukan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Listing-nya mungkin sudah ditutup atau URL-nya salah.
        </p>
        <Button className="mt-4" variant="outline" render={<Link href="/kos" />}>
          Kembali ke halaman Cari Kos
        </Button>
      </div>
    );
  }

  // `key` resets the favorite toggle state when a different kos loads.
  return <KosDetailContent key={kos.id} kos={kos} />;
}

function KosDetailContent({ kos }: { kos: Kos }) {
  const { user } = useAuth();
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const isSaved = favoritesQuery.favorites.some((favorite) => favorite.id === kos.id);
  const availableRooms = kos.rooms.filter((room) => room.status === "kosong").length;
  const hasPriceRange = kos.monthlyPriceMax > kos.monthlyPriceMin;

  // Favorites live behind the api layer (`lib/api/favorites.ts`, mock-backed per
  // account); the real endpoints can replace the mock without touching this view.
  const waMessage = encodeURIComponent(
    `Halo, saya tertarik dengan ${kos.name} (${kos.district}). Apakah masih ada kamar yang tersedia?`,
  );
  const waUrl = `https://wa.me/${kos.ownerPhone.replace(/\D/g, "").replace(/^0/, "62")}?text=${waMessage}`;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Link
          href="/kos"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kembali ke hasil pencarian
        </Link>

        <header className="[&:not(:first-child)]:mt-4">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{kos.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <GenderBadge gender={kos.gender} />
            <span className="flex items-center gap-1">
              <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
              {/* New listings have no reviews yet. */}
              {kos.ratingAvg > 0 ? (
                <>
                  {kos.ratingAvg.toFixed(1)}
                  <span className="text-xs">({kos.reviewCount})</span>
                </>
              ) : (
                "Baru"
              )}
            </span>
            <span className="flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {kos.district}, {kos.city}
            </span>
          </div>
        </header>

        <div className="mt-4">
          <KosGallery kos={kos} />
        </div>

        <section className="mt-8 flex flex-col gap-3">
          <SectionHeading>Tentang kos ini</SectionHeading>
          <p className="text-sm leading-relaxed text-foreground/90">{kos.description}</p>
        </section>

        <section className="mt-8 flex flex-col gap-3">
          <SectionHeading>Fasilitas</SectionHeading>
          <ul className="flex flex-wrap gap-2" aria-label="Fasilitas kos">
            {kos.facilities.map((facility) => (
              <li key={facility.id}>
                <Badge variant="secondary" className="h-7 px-3">
                  <Check aria-hidden="true" />
                  {facility.name}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 flex flex-col gap-3">
          <SectionHeading>Aturan kos</SectionHeading>
          <ul
            className="list-disc space-y-1 pl-5 text-sm text-foreground/90"
            aria-label="Aturan kos"
          >
            {kos.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 flex flex-col gap-3">
          <SectionHeading>Daftar kamar</SectionHeading>
          <ul className="overflow-hidden rounded-xl border" aria-label="Daftar kamar">
            {kos.rooms.map((room) => (
              <li
                key={room.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-xs text-muted-foreground">Ukuran {room.size}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-primary">
                    {formatIDR(room.monthlyPrice)}
                    <span className="text-xs font-normal text-muted-foreground">/bln</span>
                  </p>
                  <RoomStatusBadge status={room.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 flex flex-col gap-3">
          <SectionHeading>Lokasi</SectionHeading>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {kos.address}, {kos.district}, {kos.city} · {kos.distanceToCampusKm} km ke kampus
            Gunadarma
          </p>
          <KosLocationMap kos={kos} />
        </section>

        <ReviewSection kos={kos} />
      </div>

      <aside aria-label="Ringkasan dan kontak" className="min-w-0">
        <div className="sticky top-20">
          <Card className="py-4">
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Harga kamar per bulan</p>
                <p className="font-heading text-2xl font-bold text-primary">
                  {formatIDR(kos.monthlyPriceMin)}
                </p>
                {hasPriceRange ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Rentang {formatIDR(kos.monthlyPriceMin)} – {formatIDR(kos.monthlyPriceMax)}
                  </p>
                ) : null}
              </div>

              <p
                className={cn(
                  "text-sm",
                  availableRooms > 0 ? "font-medium text-success" : "text-muted-foreground",
                )}
              >
                {availableRooms > 0
                  ? `Ada ${availableRooms} dari ${kos.rooms.length} kamar tersedia`
                  : "Semua kamar terisi saat ini"}
              </p>

              <Button
                size="lg"
                className="w-full"
                render={<a href={waUrl} target="_blank" rel="noopener noreferrer" />}
              >
                <MessageCircle aria-hidden="true" />
                Hubungi via WhatsApp
              </Button>

              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    aria-pressed={isSaved}
                    disabled={favoritesQuery.isPending || toggleFavorite.isPending}
                    aria-label={
                      isSaved ? `Hapus ${kos.name} dari favorit` : `Simpan ${kos.name} ke favorit`
                    }
                    onClick={() => toggleFavorite.mutate({ kos, saved: isSaved })}
                  >
                    <Heart
                      aria-hidden="true"
                      className={cn("transition-colors", isSaved && "fill-primary text-primary")}
                    />
                    {isSaved ? "Tersimpan di favorit" : "Simpan ke favorit"}
                  </Button>
                  {toggleFavorite.isError ? (
                    <p role="alert" className="text-xs text-destructive">
                      Gagal memperbarui favorit. Coba lagi ya.
                    </p>
                  ) : null}
                </>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  render={
                    <Link href={`/login?redirect=${encodeURIComponent(`/kos/${kos.slug}`)}`} />
                  }
                >
                  <Heart aria-hidden="true" />
                  Masuk buat simpan kos
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                Pastikan lu cek kamar langsung sebelum bayar biaya sewa pertama, ya.
              </p>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
