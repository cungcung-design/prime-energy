import { SignInPage } from "@/components/auth/sign-in-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In — PRIME",
  description: "Sign in to your PRIME account.",
};

export default function SignInRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <SignInPage />
    </Suspense>
  );
}
