"use client";

import { ArrowRight, LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types";

interface SignedInNoticeProps {
  user: User;
  redirectTo: string | null;
  onSignOut: () => void;
}

/**
 * Shown on /login and /register while a session is already active. Without this
 * guard a failed submit leaves the old session untouched, so the navbar greeting
 * can make a rejected login look like it succeeded.
 */
export function SignedInNotice({ user, redirectTo, onSignOut }: SignedInNoticeProps) {
  const destination = redirectTo ?? (user.role === "owner" ? "/dashboard" : "/");
  const destinationLabel =
    destination === "/"
      ? "Buka beranda"
      : destination.startsWith("/dashboard")
        ? "Buka dashboard"
        : "Lanjut";

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lu udah masuk</CardTitle>
        <CardDescription>
          Session aktif sebagai {user.name} ({user.email}). Keluar dulu kalau mau pakai akun lain.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button size="lg" render={<Link href={destination} />}>
          {destinationLabel}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button size="lg" variant="outline" onClick={onSignOut}>
          <LogOut aria-hidden="true" />
          Keluar dari akun ini
        </Button>
      </CardContent>
    </Card>
  );
}
