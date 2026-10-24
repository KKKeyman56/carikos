import { Suspense } from "react";
import type { Metadata } from "next";

import { KosCardSkeleton } from "@/components/kos/kos-card";
import { KosSearch } from "@/components/kos/kos-search";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Cari Kos",
};

function ResultsFallback() {
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

export default function KosPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Cari Kos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nemuin kos nyaman di sekitar kampus. Filter tersimpan di URL, jadi hasil bisa kalian
            share.
          </p>
        </header>
        <Suspense fallback={<ResultsFallback />}>
          <KosSearch />
        </Suspense>
      </main>
    </>
  );
}
