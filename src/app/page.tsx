import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

// NOTE: landing page kept intentionally simple; the search screen at /kos is
// the real entry point once the catalogue is ready.
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center p-4 py-16 text-center sm:py-24">
        <p className="font-heading text-sm font-semibold text-primary">Carikos</p>
        <h1 className="mt-2 max-w-lg font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Cari kos di sekitar kampus jadi gampang.
        </h1>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">
          Cari kos putra, putri, dan campur di sekitar Universitas Gunadarma, Depok. Nantinya ada
          filter harga dan fasilitas, jarak ke kampus, serta peta lokasi.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button size="lg" render={<Link href="/kos" />}>
            Mulai Cari Kos
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            Masuk
          </Button>
        </div>
      </main>
    </>
  );
}
