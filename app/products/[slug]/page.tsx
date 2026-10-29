import { ProductDetail } from "@/components/products/product-detail";
import { catalogFlavors } from "@/lib/catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalogFlavors.map((flavor) => ({ slug: flavor.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const flavor = catalogFlavors.find((item) => item.slug === slug);
  if (!flavor) return { title: "Product — PRIME" };
  return {
    title: `${flavor.name} — PRIME`,
    description: flavor.description,
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <ProductDetailLoader params={params} />
    </Suspense>
  );
}

async function ProductDetailLoader({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!catalogFlavors.some((item) => item.slug === slug)) notFound();
  return <ProductDetail key={slug} slug={slug} />;
}
