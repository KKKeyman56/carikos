"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SignedInNotice } from "@/components/auth/signed-in-notice";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { AuthError, login } from "@/lib/api/auth";
import { safeRedirectPath } from "@/lib/utils";
import type { LoginRequest } from "@/types";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

/** Shell shown while the form placeholder page frame hydrates. */
export function LoginFormSkeleton() {
  return (
    <Card className="py-4">
      <CardBodySkeleton />
    </Card>
  );
}

function CardBodySkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 px-4 pt-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-col gap-4 px-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

/**
 * Mock login form: React Hook Form + Zod validation, submit goes through the
 * api layer only. The redirect target comes from `?redirect=/path` so a visit
 * sent from a gated flow lands back where it started.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const { user, signIn, signOut } = useAuth();
  const [showsPassword, setShowsPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      const user = await login({
        email: values.email,
        password: values.password,
      } satisfies LoginRequest);
      signIn(user);
      router.replace(redirectTo ?? "/");
    } catch (error) {
      setErrorMessage(
        error instanceof AuthError ? error.message : "Waduh, koneksi bermasalah. Coba lagi ya.",
      );
    }
  });

  // Do not show the login form to a signed-in visitor: a failed submit would
  // keep the old session alive and look like the new password worked.
  if (user) {
    return <SignedInNotice user={user} redirectTo={redirectTo} onSignOut={signOut} />;
  }

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Selamat datang kembali</CardTitle>
        <CardDescription>Masuk pakai akun Carikos lu buat lanjut cari kos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          ) : null}

          <FormField id="login-email" label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              className="h-11"
              {...register("email")}
            />
          </FormField>

          <FormField
            id="login-password"
            label="Password"
            error={errors.password?.message}
            className="gap-1.5"
          >
            {(wiring) => (
              <div className="relative">
                <Input
                  {...register("password")}
                  {...wiring}
                  type={showsPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="password123"
                  className="h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowsPassword((value) => !value)}
                  aria-pressed={showsPassword}
                  aria-label={showsPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {showsPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
            )}
          </FormField>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Memproses…</>
            ) : (
              <>
                <LogIn aria-hidden="true" />
                Masuk
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          belum punya akun?{" "}
          <Link
            href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Daftar
          </Link>
        </p>

        {/* ASSUMPTION: mock demo credentials so the flow is testable before
            the backend lands. */}
        <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
          Akun demo pencari: <code>ayu@example.com</code> / <code>password123</code>
          <br />
          Akun demo pemilik: <code>pemilik@example.com</code> / <code>password123</code>
        </p>
      </CardContent>
    </Card>
  );
}
