import { CatalogPage } from "@/components/products/catalog-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — PRIME",
  description: "Explore the Flavors. Bold flavor. Zero sugar.",
};

export default function ProductsPage() {
  return <CatalogPage />;
}
