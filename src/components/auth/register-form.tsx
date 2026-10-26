"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { AuthError, register as registerAccount } from "@/lib/api/auth";
import type { RegisterRequest } from "@/types";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";

/** Shell shown while the register page frame hydrates. */
export function RegisterFormSkeleton() {
  return (
    <Card className="py-4">
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 px-4 pt-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex flex-col gap-4 px-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Mock register form: validated with Zod + React Hook Form, then sent through
 * the api layer. On success the new user is signed in right away (mock), so
 * the navbar greeting appears immediately.
 */
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      const user = await registerAccount({
        name: values.name,
        phone: values.phone,
        email: values.email,
        password: values.password,
      } satisfies RegisterRequest);
      signIn(user);
      // Same gated-flow redirect contract as the login form.
      const redirect = searchParams.get("redirect");
      router.replace(redirect?.startsWith("/") ? redirect : "/");
    } catch (error) {
      setErrorMessage(
        error instanceof AuthError ? error.message : "Waduh, koneksi bermasalah. Coba lagi ya.",
      );
    }
  });

  return (
    <Card className="py-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Buat akun Carikos</CardTitle>
        <CardDescription>Isi data singkat doang, nanti bisa lurus cari kos.</CardDescription>
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

          <FormField id="register-name" label="Nama lengkap" error={errors.name?.message}>
            <Input
              type="text"
              autoComplete="name"
              placeholder="Nama lu"
              className="h-11"
              {...register("name")}
            />
          </FormField>

          <FormField
            id="register-phone"
            label="Nomor WhatsApp"
            error={errors.phone?.message}
            hint="Dipake pemilik kos buat ngabarin lu via WhatsApp."
          >
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="081234567890"
              className="h-11"
              {...register("phone")}
            />
          </FormField>

          <FormField id="register-email" label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.com"
              className="h-11"
              {...register("email")}
            />
          </FormField>

          <FormField id="register-password" label="Password" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter + angka"
              className="h-11"
              {...register("password")}
            />
          </FormField>

          <FormField
            id="register-confirm-password"
            label="Ulangi password"
            error={errors.confirmPassword?.message}
          >
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="Ketik ulang password"
              className="h-11"
              {...register("confirmPassword")}
            />
          </FormField>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <Controller
                control={control}
                name="terms"
                render={({ field: { value, onChange }, fieldState: { error } }) => (
                  <Checkbox
                    id="register-terms"
                    checked={value === true}
                    onCheckedChange={(checked) => onChange(checked === true)}
                    aria-invalid={error ? true : undefined}
                    className="mt-0.5"
                  />
                )}
              />
              <label
                htmlFor="register-terms"
                className="text-sm leading-snug font-normal text-foreground/90"
              >
                Gua setuju sama <span className="font-medium underline">ketentuan layanan</span> dan{" "}
                <span className="font-medium underline">kebijakan privasi</span> Carikos
                {/* ASSUMPTION: real terms/privacy pages are built with legal data later. */}
              </label>
            </div>
            {errors.terms ? (
              <p
                id="register-terms-error"
                role="alert"
                className="text-xs font-medium text-destructive"
              >
                {errors.terms.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Memproses…</>
            ) : (
              <>
                <UserPlus aria-hidden="true" />
                Daftar
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Udah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
