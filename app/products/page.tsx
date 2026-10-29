import { CatalogPage } from "@/components/products/catalog-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products — PRIME",
  description:
    "Four distinct personalities. One uncompromising formula. Find the one that hits different.",
};

export default function ProductsPage() {
  return <CatalogPage />;
}
