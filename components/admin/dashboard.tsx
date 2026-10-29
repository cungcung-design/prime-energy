"use client";

import Link from "next/link";
import { money } from "@/lib/order";
import { stockStatus, useAdminData } from "@/lib/admin";
import { AdminShell, PageIntro, StatusBadge, primaryButton } from "@/components/admin/shell";
import { OrderTable } from "@/components/admin/order-table";

export function Dashboard() {
  const { products, orders } = useAdminData();
  const orderValue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingValue = orders
    .filter((order) => order.payment === "Pending")
    .reduce((sum, order) => sum + order.total, 0);
  const preparing = orders.filter((order) => order.fulfillment !== "Delivered").length;
  const delivered = orders.filter((order) => order.fulfillment === "Delivered").length;
  const stock = products.reduce((sum, product) => sum + product.stock, 0);
  const available = products.filter((product) => product.stock > 0).length;
  const unavailable = products.filter((product) => product.stock <= 0);
  const review = orders.find((order) => order.fulfillment !== "Delivered") ?? orders[0];
  const low = [...products].filter((product) => product.stock > 0).sort((a, b) => a.stock - b.stock)[0];

  return (
    <AdminShell crumb="OVERVIEW">
      <PageIntro
        title="Store overview"
        text="A focused view of the PRIME store."
        action={
          <Link href="/admin/orders" className={primaryButton()}>
            Manage orders →
          </Link>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7">
        <p className="font-mono text-[11px] leading-[1.5] text-ash">SNAPSHOT / OCT 28, 2026</p>
        <p className="text-xs leading-[1.6] text-mist">
          {orders.length} orders · USD
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Order value" value={money(orderValue)} note={`Sum of ${orders.length} order totals`} />
        <Metric label="Orders" value={String(orders.length)} note={`${preparing} preparing · ${delivered} delivered`} />
        <Metric label="Pending payment" value={money(pendingValue)} note="Orders still waiting for payment" />
        <Metric
          label="Available stock"
          value={String(stock)}
          note={`Packs across ${products.length} products`}
        />
      </div>
      <section className="flex flex-col gap-[18px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl leading-[1.1] font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-[13px] font-medium text-lime">
            All orders →
          </Link>
        </div>
        <OrderTable orders={orders} />
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-5 border border-line bg-panel p-6">
          <h2 className="text-lg leading-[1.1] font-semibold">Needs attention</h2>
          {review ? (
            <div className="flex items-center gap-4">
              <StatusBadge tone="live">01</StatusBadge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Review #{review.id}</p>
                <p className="mt-1.5 text-xs leading-[1.6] text-mist">
                  Payment {review.payment.toLowerCase()} · fulfillment {review.fulfillment.toLowerCase()} /{" "}
                  {review.fulfillment === "Delivered" ? "complete" : "unfulfilled"}
                </p>
              </div>
              <Link href={`/admin/orders/${review.id}`} className="text-[13px] font-medium text-lime">
                Open →
              </Link>
            </div>
          ) : null}
          {low ? (
            <>
              <div className="h-px bg-line" />
              <div className="flex items-center gap-4">
                <StatusBadge>02</StatusBadge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Check {low.name} stock</p>
                  <p className="mt-1.5 text-xs leading-[1.6] text-mist">
                    {low.stock} packs available
                    {stockStatus(low.stock) === "Low stock" ? " · low stock" : ""}
                  </p>
                </div>
                <Link href={`/admin/products/${low.sku}`} className="text-[13px] font-medium text-lime">
                  Edit →
                </Link>
              </div>
            </>
          ) : null}
        </section>
        <section className="flex flex-col gap-5 border border-line bg-panel p-6">
          <h2 className="text-lg leading-[1.1] font-semibold">Product availability</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-[28px] leading-[1.1] font-semibold">
                {available} / {products.length}
              </p>
              <p className="mt-2 text-xs leading-[1.6] text-mist">Products available</p>
            </div>
            <div className="flex-1">
              {unavailable.length > 0 ? (
                <>
                  <StatusBadge>
                    {unavailable.map((product) => `${product.name} · ${product.stock} packs`).join(" · ")}
                  </StatusBadge>
                  <p className="mt-2 text-xs leading-[1.6] text-mist">Temporarily out of stock</p>
                </>
              ) : (
                <p className="text-xs leading-[1.6] text-mist">Every product has stock.</p>
              )}
            </div>
          </div>
          <div className="h-px bg-line" />
          <Link href="/admin/products" className="text-[13px] font-medium text-lime">
            Manage products →
          </Link>
        </section>
      </div>
      <p className="text-[11px] leading-[1.6] text-ash">
        Order value includes tax and delivery. It counts recorded orders, including ones that are not paid yet.
      </p>
    </AdminShell>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="flex min-h-[168px] flex-col gap-3.5 border border-line bg-panel p-[22px]">
      <p className="text-[13px] text-mist">{label}</p>
      <p className="text-[34px] leading-none font-semibold">{value}</p>
      <p className="text-[11px] leading-[1.6] text-ash">{note}</p>
    </article>
  );
}
