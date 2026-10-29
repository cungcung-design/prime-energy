import { AccountPage } from "@/components/account/account-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "My Account — PRIME",
  description: "Manage your profile, preferences, and account details in one place.",
};

export default function AccountRoute() {
  return (
    <Suspense>
      <AccountPage />
    </Suspense>
  );
}
