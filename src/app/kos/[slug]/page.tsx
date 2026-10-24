import { Suspense } from "react";
import type { Metadata } from "next";

import { KosDetail, KosDetailSkeleton } from "@/components/kos/kos-detail";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Detail Kos",
};

// The slug is only known per-request, so awaiting `params` must happen inside
// the Suspense boundary for the prerendered shell to work (Cache Components).
async function DetailContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <KosDetail slug={slug} />;
}

export default function KosDetailPage({ params }: PageProps<"/kos/[slug]">) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <Suspense fallback={<KosDetailSkeleton />}>
          <DetailContent params={params} />
        </Suspense>
      </main>
    </>
  );
}
