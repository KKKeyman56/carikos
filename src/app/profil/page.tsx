import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profil",
};

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <header>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data akun dan keamanan lu di sini.
          </p>
        </header>
        <ProfileView />
      </main>
    </>
  );
}
