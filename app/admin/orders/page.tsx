import type { Metadata } from "next";
import { OrdersPage } from "@/components/admin/orders-page";

export const metadata: Metadata = {
  title: "Orders — PRIME Admin",
  description: "Sample orders for the PRIME portfolio. No payments are processed.",
};

export default function AdminOrdersPage() {
  return <OrdersPage />;
}
