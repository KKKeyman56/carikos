"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { KosCard, KosCardSkeleton } from "@/components/kos/kos-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";

function FavoritesSkeleton() {
  return (
    <ul aria-hidden="true" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index}>
          <KosCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

function SignedOutState() {
  return (
    <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
      <Heart aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-heading font-semibold">Masuk dulu buat lihat favorit</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Kos yang lu simpan nempel di akun, jadi aman dibuka lagi dari HP atau laptop lain.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Button size="lg" render={<Link href="/login?redirect=/favorit" />}>
          Masuk
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/register?redirect=/favorit" />}>
          Daftar
        </Button>
      </div>
    </div>
  );
}

/**
 * Favorit page body: sign-in gate, then loading / error / empty / list states.
 * Data and mutations go through the api layer only.
 */
export function FavoritesList() {
  const { user } = useAuth();
  const favoritesQuery = useFavorites();
  const toggleFavorite = useToggleFavorite();

  if (!user) {
    return <SignedOutState />;
  }

  if (favoritesQuery.isPending) {
    return <FavoritesSkeleton />;
  }

  if (favoritesQuery.isError) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">Gagal memuat favorit</p>
        <p className="mt-1 text-sm text-muted-foreground">Koneksi lagi ngadat. Coba ulang, ya.</p>
        <Button className="mt-4" variant="outline" onClick={() => void favoritesQuery.refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  const favorites = favoritesQuery.favorites;

  if (favorites.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
        <Heart aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 font-heading font-semibold">Belum ada kos favorit</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Simpan kos yang menarik biar gampang dibandingin nanti. Tekan tombol hati di halaman
          detail kos.
        </p>
        <Button className="mt-5" size="lg" render={<Link href="/kos" />}>
          Cari kos sekarang
        </Button>
      </div>
    );
  }

  return (
    <>
      <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
        {favorites.length} kos tersimpan
        {toggleFavorite.isError ? " · Gagal memperbarui favorit, coba lagi ya." : ""}
      </p>
      <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((kos) => (
          <li key={kos.id} className="relative">
            <KosCard kos={kos} />
            <Button
              variant="secondary"
              size="icon-lg"
              className="absolute top-2 right-2 z-10 rounded-full shadow-sm"
              aria-label={`Hapus ${kos.name} dari favorit`}
              aria-pressed
              disabled={toggleFavorite.isPending}
              onClick={() => toggleFavorite.mutate({ kos, saved: true })}
            >
              <Heart aria-hidden="true" className="fill-primary text-primary" />
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}
