import type { Metadata } from "next";
import { ProductsPage } from "@/components/admin/products-page";

export const metadata: Metadata = {
  title: "Products — PRIME Admin",
  description: "Sample catalog for the PRIME portfolio. Inventory stays in this browser.",
};

export default function AdminProductsPage() {
  return <ProductsPage />;
}
