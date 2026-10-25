import { Suspense } from "react";
import type { Metadata } from "next";

import { RegisterForm, RegisterFormSkeleton } from "@/components/auth/register-form";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10">
        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm />
        </Suspense>
      </main>
    </>
  );
}
