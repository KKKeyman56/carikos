"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LayoutDashboard, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/form/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { AuthError, changePassword, updateProfile } from "@/lib/api/auth";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordFormData,
  type ProfileFormData,
} from "@/lib/validations/auth";
import type { ChangePasswordRequest, UpdateProfileRequest, User } from "@/types";

type FeedbackTone = "success" | "error";

interface Feedback {
  tone: FeedbackTone;
  message: string;
}

function FeedbackMessage({ tone, message }: Feedback) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          : "rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
      }
    >
      {message}
    </div>
  );
}

function ProfileSignInPrompt() {
  return (
    <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
      <UserRound aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-heading font-semibold">Masuk buat lihat profil</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Data akun dan pengaturan keamanan ada di sini setelah lu masuk.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Button size="lg" render={<Link href="/login?redirect=%2Fprofil" />}>
          Masuk
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/register?redirect=%2Fprofil" />}>
          Daftar
        </Button>
      </div>
    </div>
  );
}

/** Initials avatar fallback until real photo uploads exist. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Account page for both roles: profile details and password change. Data goes
 * through `lib/api/auth.ts` only; the session is refreshed after a save so the
 * navbar greeting updates immediately.
 */
export function ProfileView() {
  const { user } = useAuth();

  if (!user) {
    return <ProfileSignInPrompt />;
  }

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: User }) {
  const { signIn } = useAuth();
  const [profileFeedback, setProfileFeedback] = useState<Feedback | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmitProfile = profileForm.handleSubmit(async (values) => {
    setProfileFeedback(null);
    try {
      const updated = await updateProfile(user.id, {
        name: values.name,
        phone: values.phone,
      } satisfies UpdateProfileRequest);
      signIn(updated);
      profileForm.reset({ name: updated.name, phone: updated.phone });
      setProfileFeedback({ tone: "success", message: "Profil tersimpan." });
    } catch (error) {
      setProfileFeedback({
        tone: "error",
        message: error instanceof AuthError ? error.message : "Gagal nyimpen profil. Coba lagi ya.",
      });
    }
  });

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    setPasswordFeedback(null);
    try {
      await changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      } satisfies ChangePasswordRequest);
      passwordForm.reset();
      setPasswordFeedback({ tone: "success", message: "Password berhasil diganti." });
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.code === "PASSWORD_LAMA_SALAH") {
          passwordForm.setError("currentPassword", { message: error.message });
          return;
        }
        setPasswordFeedback({ tone: "error", message: error.message });
        return;
      }
      setPasswordFeedback({ tone: "error", message: "Gagal ganti password. Coba lagi ya." });
    }
  });

  const profileErrors = profileForm.formState.errors;
  const passwordErrors = passwordForm.formState.errors;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary"
            >
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading font-semibold">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={user.role === "owner" ? "default" : "secondary"}>
              {user.role === "owner" ? "Pemilik kos" : "Pencari kos"}
            </Badge>
            {user.role === "owner" ? (
              <Button variant="outline" render={<Link href="/dashboard" />}>
                <LayoutDashboard aria-hidden="true" />
                Dashboard
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Data akun</CardTitle>
          <CardDescription>
            Nama dan nomor WhatsApp ini yang dipakai pemilik kos buat hubungi lu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitProfile} noValidate className="flex flex-col gap-4">
            {profileFeedback ? <FeedbackMessage {...profileFeedback} /> : null}

            <FormField id="profile-name" label="Nama lengkap" error={profileErrors.name?.message}>
              <Input
                type="text"
                autoComplete="name"
                className="h-11"
                {...profileForm.register("name")}
              />
            </FormField>

            <FormField
              id="profile-phone"
              label="Nomor WhatsApp"
              error={profileErrors.phone?.message}
              hint="Contoh: 081234567890"
            >
              <Input
                type="tel"
                autoComplete="tel"
                className="h-11"
                {...profileForm.register("phone")}
              />
            </FormField>

            <FormField
              id="profile-email"
              label="Email"
              hint="Email belum bisa diubah di versi demo."
            >
              <Input className="h-11" value={user.email} readOnly disabled />
            </FormField>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? (
                  <>Menyimpan…</>
                ) : (
                  <>
                    <Save aria-hidden="true" />
                    Simpan profil
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ganti password</CardTitle>
          <CardDescription>Minimal 8 karakter dan harus ada angkanya.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitPassword} noValidate className="flex flex-col gap-4">
            {passwordFeedback ? <FeedbackMessage {...passwordFeedback} /> : null}

            <FormField
              id="profile-current-password"
              label="Password sekarang"
              error={passwordErrors.currentPassword?.message}
            >
              <Input
                type="password"
                autoComplete="current-password"
                className="h-11"
                {...passwordForm.register("currentPassword")}
              />
            </FormField>

            <FormField
              id="profile-new-password"
              label="Password baru"
              error={passwordErrors.newPassword?.message}
              hint="Minimal 8 karakter + angka."
            >
              <Input
                type="password"
                autoComplete="new-password"
                className="h-11"
                {...passwordForm.register("newPassword")}
              />
            </FormField>

            <FormField
              id="profile-confirm-password"
              label="Ulangi password baru"
              error={passwordErrors.confirmPassword?.message}
            >
              <Input
                type="password"
                autoComplete="new-password"
                className="h-11"
                {...passwordForm.register("confirmPassword")}
              />
            </FormField>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                variant="outline"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? (
                  <>Menyimpan…</>
                ) : (
                  <>
                    <KeyRound aria-hidden="true" />
                    Ganti password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
