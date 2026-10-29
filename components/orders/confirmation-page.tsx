"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { ShopProgress } from "@/components/shop/progress";
import { cartItem, money } from "@/lib/order";
import { findOrder, type StoredOrder } from "@/lib/orders";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const stateAbbr: Record<string, string> = {
  California: "CA",
  "New York": "NY",
  Texas: "TX",
  Florida: "FL",
  Washington: "WA",
};

export function ConfirmationPage({ id }: { id: string }) {
  const sessionId = useSearchParams().get("session_id") ?? undefined;
  const [order, setOrder] = useState<StoredOrder | null | undefined>(undefined);

  useEffect(() => {
    void findOrder(id, sessionId).then((found) => setOrder(found));
  }, [id, sessionId]);

  if (order === undefined) {
    return <div className="min-h-screen bg-ink" />;
  }

  if (!order) {
    return (
      <div className="bg-ink text-paper">
        <ShopHeader />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-16 sm:px-8 xl:px-16">
          <h1 className="font-display text-[64px] leading-none font-extrabold">ORDER NOT ON RECORD</h1>
          <Link href="/account?tab=orders" className="text-[13px] font-medium text-lime">
            View Order History →
          </Link>
        </main>
        <ShopFooter />
      </div>
    );
  }

  const received = order.status === "received";
  const payment =
    order.payment === "apple"
      ? "Apple Pay"
      : order.payment === "google"
        ? "Google Pay"
        : "Example Visa ending in 4242";

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:gap-9 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <ShopProgress current={3} />
        <div className="flex flex-col items-start gap-6 py-2 sm:flex-row sm:items-center sm:gap-8 sm:py-6">
          <div className="flex size-24 shrink-0 items-center justify-center bg-lime">
            <Icon src="/icons/check-50.svg" width={50} height={50} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3.5">
            <p className="font-mono text-[11px] leading-[1.5] text-lime">
              {order.statusLabel} / #{order.id} / {order.placedLabel}
            </p>
            <h1 className="font-display text-[clamp(48px,8vw,88px)] leading-none font-extrabold">
              {received ? "GOOD ENERGY INCOMING" : "ON THE RECORD"}
            </h1>
            <p className="text-[14px] leading-[1.65] text-mist">
              {order.paymentState === "paid"
                ? `Thanks, ${order.firstName}. Payment was received and the order is on record.`
                : order.paymentState === "cancelled"
                  ? `Thanks, ${order.firstName}. This order was cancelled and no charge was kept.`
                  : order.paymentState === "historical"
                    ? `${order.deliveredNote ?? "Delivered"}. This opening record has no card charge attached.`
                    : `Thanks, ${order.firstName}. Payment is not confirmed yet.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          <div className="flex min-w-0 flex-1 flex-col gap-7">
            <div className="flex flex-col gap-[18px] bg-lime p-6 text-ink sm:p-7">
              <p className="font-mono text-[11px] leading-[1.5]">{order.deliveryTitle}</p>
              <p className="font-display text-[clamp(40px,6vw,64px)] leading-none font-extrabold">{order.deliveryLabel}</p>
              <p className="text-[13px] leading-[1.6]">
                {received
                  ? `Your ${order.cans} cans will ship together. In a live store, tracking is sent to ${order.email} once the order is on the move.`
                  : order.deliveredNote}
              </p>
            </div>

            <div id="fulfillment" className="grid gap-4 py-2 sm:grid-cols-3">
              <Stage
                done
                title="Order received"
                detail={shortPlaced(order.placedLabel)}
              />
              <Stage
                done={!received}
                title="Preparing"
                detail={
                  received
                    ? "Your order is being prepared. Tracking will appear here once it is dispatched."
                    : "Packed for delivery."
                }
              />
              <Stage
                done={!received}
                title="On the move"
                detail={
                  received
                    ? `Tracking will be sent to ${order.email} once the order is dispatched.`
                    : (order.deliveredNote ?? "Delivered")
                }
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="flex flex-col gap-3.5 bg-panel p-6">
                <h2 className="font-display text-[30px] leading-none font-extrabold">SHIPPING TO</h2>
                <p className="text-[13px] leading-[1.65]">
                  {order.firstName} {order.lastName}
                  <br />
                  {order.street}
                  {order.apartment ? `, ${order.apartment}` : ""}
                  <br />
                  {order.city}, {stateAbbr[order.state] ?? order.state} {order.zip}
                  <br />
                  {order.country}
                  <br />
                  {order.phone}
                </p>
              </section>
              <section className="flex flex-col gap-3.5 bg-panel p-6">
                <h2 className="font-display text-[30px] leading-none font-extrabold">PAYMENT STATUS</h2>
                <p className="text-[13px] leading-[1.65]">
                  {payment}
                  <br />
                  {order.sameBilling ? "Billing address same as shipping" : "Billing address entered separately"}
                  <br />
                  Order total: {money(order.total)} USD
                </p>
                <p className="flex items-center gap-2.5 font-mono text-[11px] leading-[1.5] text-lime">
                  <span className="size-1.5 bg-lime" />
                  PENDING REVIEW / NO CHARGE
                </p>
              </section>
            </div>

            <div className="flex flex-col gap-[18px]">
              <h2 className="font-display text-[36px] leading-none font-extrabold">KEEP THE MOMENTUM</h2>
              <p className="text-[13px] leading-[1.65] text-mist">
                Keep your orders in one place. Create an account with the same email to find this order in your Order History.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href={`/account?tab=orders#${order.id}`} className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink">
                  View order details
                  <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
                </Link>
                <a href="#fulfillment" className="inline-flex h-[54px] items-center justify-between border border-line bg-ink px-5 text-[13px] font-bold">
                  Track order
                  <Icon src="/icons/arrow-up-right-18.svg" width={18} height={18} />
                </a>
              </div>
              <div className="flex flex-col gap-3 text-[13px] font-medium text-lime sm:flex-row sm:items-start sm:justify-between">
                <Link href="/sign-in">Already a member? Sign In →</Link>
                <a href="mailto:hello@prime.energy">Order help · hello@prime.energy ↗</a>
              </div>
              <Link href="/products" className="text-[13px] font-medium text-lime">
                Continue shopping →
              </Link>
              <Link href="/sign-up" className="text-[13px] font-medium text-lime">
                Create Account →
              </Link>
            </div>
          </div>

          <aside id="lineup" className="flex w-full flex-col gap-6 bg-panel p-6 xl:w-[464px] xl:shrink-0 xl:p-7">
            <h2 className="font-display text-[36px] leading-none font-extrabold">THE LINEUP</h2>
            <p className="font-mono text-[11px] leading-[1.5] text-ash">
              #{order.id} / {order.packs} PACKS / {order.cans} CANS
            </p>
            <div className="flex flex-col gap-5">
              {order.lines.map((line) => {
                const item = cartItem(line.id);
                return (
                  <article key={line.id} className="flex items-center gap-5 border-b border-line pb-5">
                    <div className="relative h-[94px] w-[78px] shrink-0">
                      <Image src={item.image} alt={item.alt} fill sizes="78px" className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
                      <h3 className="font-display text-[24px] leading-none font-extrabold">{item.name}</h3>
                      <p className="font-mono text-[9px] leading-[1.5] text-ash">{item.detail}</p>
                      <p className="text-[12px] leading-[1.65] text-mist">Quantity {line.qty}</p>
                    </div>
                    <p className="text-[14px]">{money(line.qty * 32)}</p>
                  </article>
                );
              })}
            </div>
            <div className="flex flex-col gap-[18px] text-[13px]">
              <Row label={`Subtotal · ${order.packs} packs / ${order.cans} cans`} value={money(order.subtotal)} />
              <Row
                label={order.delivery === "express" ? "Express delivery" : "Standard delivery"}
                value={order.shipping === 0 ? "FREE" : money(order.shipping)}
              />
              <Row label="Tax" value={money(order.tax)} />
              <div className="h-px bg-line" />
              <div className="flex items-center justify-between">
                <p className="text-[18px] font-semibold">Total · USD</p>
                <p className="font-display text-[36px] leading-none font-bold text-lime">{money(order.total)}</p>
              </div>
            </div>
            <div className="h-px bg-line" />
            <p className="text-[11px] leading-[1.65] text-mist">
              {order.paymentState === "paid"
                ? "Payment was verified with the payment provider. Card numbers are not stored."
                : order.tracking
                  ? `Tracking: ${order.tracking}`
                  : "Payment status is shown above. Card numbers are not stored on this site."}
            </p>
            <Link href="/account?tab=orders" className="text-[13px] font-medium text-lime">
              View Order History →
            </Link>
          </aside>
        </div>
      </main>
      <ShopFooter />
    </div>
  );
}

function shortPlaced(label: string) {
  const match = label.match(/^([A-Z]{3}) (\d+)/);
  if (!match) return label;
  return `${match[1][0]}${match[1].slice(1).toLowerCase()} ${match[2]}`;
}

function Stage({ done, title, detail }: { done: boolean; title: string; detail: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className={`h-[3px] w-full ${done ? "bg-lime" : "bg-line"}`} />
      <p className={`text-[13px] font-semibold ${done ? "text-lime" : "text-mist"}`}>{title}</p>
      <p className="text-[11px] leading-[1.4] text-ash">{detail}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-mist">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
