import { ResetPasswordPage } from "@/components/auth/reset-pages";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Choose a password — PRIME",
  description: "Choose a new password for your PRIME account.",
};

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
