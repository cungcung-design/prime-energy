import { ProductDetailRoute } from "@/components/products/product-detail";
import { catalogFlavors } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product — PRIME",
};

export function generateStaticParams() {
  return catalogFlavors.map((flavor) => ({ slug: flavor.slug }));
}

export default function ProductDetailPage() {
  return <ProductDetailRoute />;
}
