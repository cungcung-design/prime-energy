import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetail } from "@/components/admin/order-detail";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${decodeURIComponent(id)} — PRIME Admin`,
    description: "Illustrative order detail. No charge, email, or shipment is created.",
  };
}

export default function AdminOrderDetailPage({ params }: OrderPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <OrderLoader params={params} />
    </Suspense>
  );
}

async function OrderLoader({ params }: OrderPageProps) {
  const { id } = await params;
  return <OrderDetail id={decodeURIComponent(id)} />;
}
