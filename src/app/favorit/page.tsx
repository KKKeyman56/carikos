import type { Metadata } from "next";

import { FavoritesList } from "@/components/kos/favorites-list";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Favorit",
};

export default function FavoritesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Favorit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kos yang lu simpan, siap dibandingin sebelum datang ke lokasi.
          </p>
        </header>
        <FavoritesList />
      </main>
    </>
  );
}
