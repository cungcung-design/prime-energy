import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/product-editor";

type EditorPageProps = {
  params: Promise<{ sku: string }>;
};

export async function generateMetadata({ params }: EditorPageProps): Promise<Metadata> {
  const { sku } = await params;
  const label = sku === "new" ? "New product" : decodeURIComponent(sku);
  return {
    title: `${label} — PRIME Admin`,
    description: "Edit a stored product. Stock and price changes are saved to the store.",
  };
}

export default function AdminProductEditorPage({ params }: EditorPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <EditorLoader params={params} />
    </Suspense>
  );
}

async function EditorLoader({ params }: EditorPageProps) {
  const { sku } = await params;
  return <ProductEditor key={decodeURIComponent(sku)} sku={decodeURIComponent(sku)} />;
}
