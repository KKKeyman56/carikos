import { ShieldAlert, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Gate shown to guests on owner-only pages. The redirect target brings them
 * back to the page they tried to open after signing in.
 */
export function OwnerSignInPrompt({ redirectTo }: { redirectTo: string }) {
  const query = `?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <UserRound aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-heading font-semibold">Masuk buat buka dashboard</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Dashboard ini buat pemilik kos yang mau memantau listing dan ketersediaan kamar.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Button size="lg" render={<Link href={`/login${query}`} />}>
          Masuk
        </Button>
        <Button size="lg" variant="outline" render={<Link href={`/register${query}`} />}>
          Daftar
        </Button>
      </div>
    </div>
  );
}

/** Gate shown to signed-in seekers that open an owner-only page. */
export function OwnerOnlyNotice() {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <ShieldAlert aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-heading font-semibold">Dashboard khusus pemilik kos</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Akun ini terdaftar sebagai pencari kos. Dashboard ini cuma bisa dibuka pakai akun pemilik
        kos. Pendaftaran khusus pemilik menyusul.
      </p>
      <Button className="mt-5" variant="outline" size="lg" render={<Link href="/kos" />}>
        Cari kos dulu
      </Button>
    </div>
  );
}
