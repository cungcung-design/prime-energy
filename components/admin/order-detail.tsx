"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/order";
import { fulfillmentOptions, saveFulfillment, useAdminData, type Fulfillment } from "@/lib/admin";
import { AdminShell, StatusBadge, primaryButton } from "@/components/admin/shell";

export function OrderDetail({ id }: { id: string }) {
  const { orders, loaded } = useAdminData();
  const order = orders.find((item) => item.id === id);
  const [status, setStatus] = useState<Fulfillment>(order?.fulfillment ?? "Preparing");
  const [tracking, setTracking] = useState("");
  const [saved, setSaved] = useState(false);
  const [actionError, setActionError] = useState("");
  const [seenId, setSeenId] = useState<string | null>(null);
  if (order && order.id !== seenId) {
    setSeenId(order.id);
    setStatus(order.fulfillment);
    setTracking(order.tracking ?? "");
  }

  if (!order && !loaded) {
    return (
      <AdminShell crumb="ORDERS">
        <div className="min-h-[40vh]" />
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell crumb="ORDERS">
        <Link href="/admin/orders" className="text-[13px] font-medium text-lime">
          ← Back to Orders
        </Link>
        <h1 className="text-[32px] leading-[1.1] font-semibold">Order not found</h1>
        <p className="text-sm text-mist">This order is not in the store.</p>
      </AdminShell>
    );
  }

  const fulfillmentLabel =
    order.fulfillment === "Preparing" ? "Preparing / unfulfilled" : order.fulfillment;
  const arrival = order.tracking
    ? `Tracking ${order.tracking}. ${order.estimate}.`
    : order.fulfillment === "Delivered"
      ? `${order.estimate}. No tracking number is stored.`
      : `Estimated arrival ${order.estimate}. Add a tracking number when the shipment leaves.`;

  return (
    <AdminShell crumb="ORDERS">
      <Link href="/admin/orders" className="text-[13px] font-medium text-lime">
        ← Back to Orders
      </Link>
      <div>
        <h1 className="text-[32px] leading-[1.1] font-semibold">Order #{order.id}</h1>
        <p className="mt-2.5 text-sm leading-[1.6] text-mist">
          {order.placedLabel} · {order.customer} · {order.packs} packs / {order.cans} cans
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <StatusBadge tone={order.payment === "Pending" || order.payment === "Paid" ? "live" : "quiet"}>
          {order.payment === "Pending" ? "Payment pending" : order.payment === "Paid" ? "Payment received" : order.payment}
        </StatusBadge>
        <StatusBadge>{fulfillmentLabel}</StatusBadge>
      </div>
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section className="flex flex-col gap-5 border border-line bg-panel p-6">
            <h2 className="text-lg leading-[1.1] font-semibold">Order items</h2>
            {order.lines.map((line) => (
              <div key={line.name} className="flex items-center gap-[18px] border-b border-line pb-[18px]">
                <div className="relative h-20 w-[66px] shrink-0 bg-ink">
                  <Image src={line.image} alt="" fill sizes="66px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base leading-[1.1] font-semibold">{line.name}</p>
                  <p className="mt-2 text-[11px] leading-[1.6] text-ash">{line.detail}</p>
                  <p className="mt-2 text-xs leading-[1.6] text-mist">Quantity {line.quantity} packs</p>
                </div>
                <p className="text-sm">{money(line.price)}</p>
              </div>
            ))}
            <p className="text-xs leading-[1.6] text-mist">
              {order.packs} packs total · {order.cans} cans · One-time purchase
            </p>
          </section>
          <section className="flex flex-col gap-5 border border-line bg-panel p-6">
            <h2 className="text-lg leading-[1.1] font-semibold">Fulfillment</h2>
            <div className="flex items-start justify-between gap-4">
              <StatusBadge>{fulfillmentLabel}</StatusBadge>
              <p className="font-mono text-[11px] leading-[1.5] text-ash">{order.delivery.toUpperCase()}</p>
            </div>
            <p className="text-[13px] leading-[1.6] text-mist">{arrival}</p>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-mist">FULFILLMENT STATUS</span>
              <span className="relative block">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Fulfillment)}
                  className="min-h-[50px] w-full appearance-none border border-line bg-panel p-[15px] pr-10 text-sm text-paper outline-none"
                >
                  {fulfillmentOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-lime">
                  ⌄
                </span>
              </span>
              <span className="text-[11px] leading-[1.5] text-ash">
                Options: Unfulfilled · Preparing · Dispatched · Delivered
              </span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[11px] text-mist">TRACKING NUMBER</span>
              <input
                value={tracking}
                onChange={(event) => setTracking(event.target.value)}
                className="min-h-[50px] w-full border border-line bg-panel p-[15px] text-sm text-paper outline-none"
              />
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                className={primaryButton()}
                onClick={() => {
                  void saveFulfillment(order.id, status, tracking)
                    .then(() => {
                      setSaved(true);
                      setActionError("");
                    })
                    .catch((caught: unknown) => setActionError(caught instanceof Error ? caught.message : "The status could not be saved."));
                }}
              >
                Update status
              </button>
              <p className="text-[11px] leading-[1.6] text-ash">
                Payment status is not changed by fulfillment updates.
              </p>
            </div>
            {saved ? (
              <div className="flex gap-2.5 border border-line bg-panel p-3.5">
                <p className="text-sm text-lime">✓</p>
                <p className="text-xs leading-[1.5] text-mist">
                  Fulfillment updated to {status}. Payment remains {order.payment.toLowerCase()}.
                </p>
              </div>
            ) : null}
          </section>
          <section className="flex flex-col gap-5 border border-line bg-panel p-6">
            <h2 className="text-lg leading-[1.1] font-semibold">Activity</h2>
            <p className="font-mono text-[11px] leading-[1.5] text-ash">{order.placedLabel.toUpperCase()}</p>
            <Activity
              title={`Fulfillment set to ${order.fulfillment}`}
              detail={
                order.id === "VY-10482"
                  ? order.activity[0]?.detail ?? "PRIME team"
                  : order.activity[0]?.detail ?? "PRIME team"
              }
              fresh
            />
            <div className="h-px bg-line" />
            <Activity title={order.activity[1]?.title ?? "Order received"} detail={order.activity[1]?.detail ?? "No card number is stored."} />
          </section>
        </div>
        <div className="flex w-full flex-col gap-6 xl:w-[358px] xl:shrink-0">
          <section className="flex flex-col gap-5 border border-line bg-panel p-6">
            <h2 className="text-lg leading-[1.1] font-semibold">Customer</h2>
            <p className="text-base leading-[1.1] font-semibold">{order.customer}</p>
            <p className="text-xs leading-[1.6] text-mist">{order.email}</p>
            {order.phone ? <p className="text-xs leading-[1.6] text-mist">{order.phone}</p> : null}
            <div className="h-px bg-line" />
            <p className="font-mono text-[11px] leading-[1.5] text-ash">SHIPPING ADDRESS</p>
            <div className="text-[13px] leading-[1.6] text-mist">
              <p>{order.customer}</p>
              {order.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="text-[11px] leading-[1.6] text-ash">Billing address same as shipping.</p>
          </section>
          <section className="flex flex-col gap-5 border border-line bg-panel p-6">
            <h2 className="text-lg leading-[1.1] font-semibold">Order summary</h2>
            <SummaryLine label={`Subtotal · ${order.packs} packs`} value={money(order.subtotal)} />
            <SummaryLine label={order.delivery} value={order.shipping === 0 ? "FREE" : money(order.shipping)} />
            <SummaryLine label="Tax" value={money(order.tax)} />
            <div className="h-px bg-line" />
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-mist">Total · USD</p>
              <p className="text-2xl font-semibold text-lime">{money(order.total)}</p>
            </div>
            <div className="h-px bg-line" />
            <p className="font-mono text-[11px] leading-[1.5] text-lime">
              {order.payment.toUpperCase()}
            </p>
            <p className="text-xs leading-[1.6] text-mist">
              {order.payment === "Paid"
              ? "Payment was verified. Card numbers are not stored."
              : order.payment === "Refunded"
                ? "This payment was refunded."
                : "No card number is stored for this order."}
            </p>
          </section>
        </div>
      </div>
      {actionError ? <p className="text-[12px] text-lime">{actionError}</p> : null}
      {order.refundable ? (
        <button
          type="button"
          className="w-fit text-[13px] font-medium text-lime"
          onClick={() => {
            void fetch(`/api/admin/orders/${order.id}/refund`, { method: "POST" })
              .then(async (response) => {
                const data = (await response.json()) as { error?: string };
                if (!response.ok) setActionError(data.error ?? "The refund could not be sent.");
                else {
                  setActionError("");
                  window.dispatchEvent(new Event("prime-admin-change"));
                }
              });
          }}
        >
          Refund payment
        </button>
      ) : null}
      <p className="text-[11px] leading-[1.6] text-ash">
        Fulfillment and refunds are saved to the store. Card numbers are never stored.
      </p>
    </AdminShell>
  );
}

function Activity({ title, detail, fresh = false }: { title: string; detail: string; fresh?: boolean }) {
  return (
    <div className="flex gap-4">
      <p className={`text-sm ${fresh ? "text-lime" : "text-ash"}`}>●</p>
      <div>
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="mt-1.5 text-[11px] leading-[1.6] text-ash">{detail}</p>
      </div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <p className="text-mist">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
