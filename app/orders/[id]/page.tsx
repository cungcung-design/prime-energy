import { ConfirmationPage } from "@/components/orders/confirmation-page";
import { illustrativeOrders } from "@/lib/orders";
import type { Metadata } from "next";
import { Suspense } from "react";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return illustrativeOrders.map((order) => ({ id: order.id }));
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `#${id} — PRIME`,
    description: "Order confirmation. Payment status is confirmed from the stored order.",
  };
}

export default function OrderRoute({ params }: OrderPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <OrderLoader params={params} />
    </Suspense>
  );
}

async function OrderLoader({ params }: OrderPageProps) {
  const { id } = await params;
  return <ConfirmationPage id={id} />;
}
