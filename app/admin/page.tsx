import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "Store overview — PRIME Admin",
  description: "A focused view of the PRIME sample store. No live orders or processed payments.",
};

export default function AdminOverviewPage() {
  return <Dashboard />;
}
