import { CheckoutPage } from "@/components/checkout/checkout-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Checkout — PRIME",
  description: "Checkout for PRIME. Payment is confirmed on the secure payment page.",
};

export default function CheckoutRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <CheckoutPage />
    </Suspense>
  );
}
