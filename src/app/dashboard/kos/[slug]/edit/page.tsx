import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { KosForm, KosFormSkeleton } from "@/components/owner/kos-form";

export const metadata: Metadata = {
  title: "Edit Kos",
};

// The slug is only known per-request, so awaiting `params` must happen inside
// the Suspense boundary for the prerendered shell to work (Cache Components).
async function EditContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <KosForm mode="edit" slug={slug} />;
}

export default function EditKosPage({ params }: PageProps<"/dashboard/kos/[slug]/edit">) {
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
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit kos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Perubahan langsung kepakai di halaman publik.
          </p>
        </header>

        <Suspense fallback={<KosFormSkeleton />}>
          <EditContent params={params} />
        </Suspense>
      </main>
    </>
  );
}
