import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { OwnerDashboard } from "@/components/owner/owner-dashboard";

export const metadata: Metadata = {
  title: "Dashboard Pemilik",
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard pemilik</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau listing dan status kamar kos lu dari satu tempat.
          </p>
        </header>
        <OwnerDashboard />
      </main>
    </>
  );
}
