import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { KosForm } from "@/components/owner/kos-form";

export const metadata: Metadata = {
  title: "Tambah Kos",
};

export default function NewKosPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Balik ke dashboard
        </Link>

        <header className="mt-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Tambah kos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Isi data kos dan kamarnya. Listing langsung muncul di pencarian.
          </p>
        </header>

        <KosForm mode="create" />
      </main>
    </>
  );
}
