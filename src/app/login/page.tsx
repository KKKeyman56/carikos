import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm, LoginFormSkeleton } from "@/components/auth/login-form";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10">
        {/* useSearchParams inside the form needs a Suspense boundary. */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
