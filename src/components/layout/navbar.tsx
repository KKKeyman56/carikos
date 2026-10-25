"use client";

import Link from "next/link";
import { BedDouble, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";

// ASSUMPTION: routes /kos, /login, /register are built in Tahap 2+; until then
// these links lead to 404 pages.
const NAV_LINKS = [{ href: "/kos", label: "Cari Kos" }] as const;

function NavActions() {
  const { user, signOut } = useAuth();

  // Signed in: greeting + logout replace the CTAs.
  if (user) {
    const firstName = user.name.split(" ")[0];
    return (
      <div className="hidden items-center gap-2 md:flex">
        <span className="max-w-44 truncate text-sm font-medium" title={user.name}>
          Halo, {firstName}
        </span>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut aria-hidden="true" />
          Keluar
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1 md:flex">
      <Button variant="ghost" render={<Link href="/login" />}>
        Masuk
      </Button>
      <Button render={<Link href="/register" />}>Daftar</Button>
    </div>
  );
}

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xs supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight"
        >
          <BedDouble aria-hidden="true" className="size-5 text-primary" />
          Carikos
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <NavActions />

        {/* Mobile: the primary CTA stays visible, the rest lives in the drawer */}
        <div className="flex items-center gap-1 md:hidden">
          {user ? (
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut aria-hidden="true" />
              Keluar
            </Button>
          ) : (
            <Button size="lg" render={<Link href="/register" />}>
              Daftar
            </Button>
          )}
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-lg" aria-label="Buka menu navigasi" />}
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent className="w-72">
              <SheetHeader>
                <SheetTitle>Carikos</SheetTitle>
              </SheetHeader>
              <nav aria-label="Menu navigasi" className="flex flex-col gap-1 p-4 pt-0">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <p className="mt-2 truncate rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                      Halo, {user.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-accent"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-accent"
                  >
                    Masuk
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
