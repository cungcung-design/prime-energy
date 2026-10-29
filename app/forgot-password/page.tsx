import { ForgotPasswordPage } from "@/components/auth/reset-pages";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset password — PRIME",
  description: "Request a password reset for your PRIME account.",
};

export default function ForgotPasswordRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}
