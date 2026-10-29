"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { money } from "@/lib/order";
import { useAdminData } from "@/lib/admin";
import { AdminShell, PageIntro, StatusBadge, ghostButton } from "@/components/admin/shell";
import { OrderTable } from "@/components/admin/order-table";

const fulfillmentFilters = ["All", "Unfulfilled", "Preparing", "Dispatched", "Delivered"] as const;
const paymentFilters = ["All", "Pending", "Historical"] as const;

export function OrdersPage() {
  const { orders } = useAdminData();
  const [query, setQuery] = useState("");
  const [fulfillment, setFulfillment] = useState<(typeof fulfillmentFilters)[number]>("All");
  const [payment, setPayment] = useState<(typeof paymentFilters)[number]>("All");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matches =
        needle.length === 0 ||
        order.id.toLowerCase().includes(needle) ||
        order.customer.toLowerCase().includes(needle) ||
        order.email.toLowerCase().includes(needle);
      const fulfillmentOk = fulfillment === "All" || order.fulfillment === fulfillment;
      const paymentOk = payment === "All" || order.payment === payment;
      return matches && fulfillmentOk && paymentOk;
    });
  }, [orders, query, fulfillment, payment]);

  const preparing = orders.filter((order) => order.fulfillment !== "Delivered").length;
  const delivered = orders.filter((order) => order.fulfillment === "Delivered").length;
  const current = orders.find((order) => order.payment === "Pending") ?? orders[0];

  return (
    <AdminShell crumb="ORDERS">
      <PageIntro title="Orders" text="Review orders and their fulfillment status." />
      <div className="grid gap-4 md:grid-cols-3">
        <Count label="All orders" value={orders.length} />
        <Count label="Preparing / unfulfilled" value={preparing} />
        <Count label="Delivered" value={delivered} />
      </div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="flex h-[46px] w-full items-center gap-2 border border-line bg-panel px-3.5 xl:w-[420px]">
          <span className="text-[13px] text-ash" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, customer or email"
            className="w-full bg-transparent text-[13px] text-paper outline-none placeholder:text-ash"
          />
        </label>
        <Filter
          label="Fulfillment"
          value={fulfillment}
          options={fulfillmentFilters}
          onChange={(value) => setFulfillment(value as (typeof fulfillmentFilters)[number])}
        />
        <Filter
          label="Payment"
          value={payment}
          options={paymentFilters}
          onChange={(value) => setPayment(value as (typeof paymentFilters)[number])}
        />
      </div>
      <OrderTable orders={filtered} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] leading-[1.5] text-ash">
          SHOWING {filtered.length} OF {orders.length} ORDERS
        </p>
        <p className="text-[13px] font-medium text-lime">View → Order Details</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-5 border border-line bg-panel p-6">
          <h2 className="text-lg leading-[1.1] font-semibold">Current order</h2>
          {current ? (
            <>
              <div className="flex flex-wrap gap-3">
                <StatusBadge tone={current.payment === "Pending" ? "live" : "quiet"}>
                  {current.payment === "Pending" ? "Payment pending" : "Historical"}
                </StatusBadge>
                <StatusBadge>{current.fulfillment}</StatusBadge>
              </div>
              <p className="text-xl leading-[1.1] font-semibold">
                #{current.id} · {money(current.total)}
              </p>
              <p className="text-[13px] leading-[1.6] text-mist">
                {current.customer} · {current.placedLabel}
              </p>
              <p className="text-xs leading-[1.6] text-mist">{current.summary}</p>
              <Link href={`/admin/orders/${current.id}`} className="text-[13px] font-medium text-lime">
                View order details →
              </Link>
            </>
          ) : (
            <p className="text-sm text-mist">No orders are stored yet.</p>
          )}
        </section>
        <section className="flex flex-col gap-5 border border-line bg-panel p-6">
          <h2 className="text-lg leading-[1.1] font-semibold">About these records</h2>
          <p className="text-[13px] leading-[1.6] text-mist">
            These records are stored orders. Payment and fulfillment come from the database.
          </p>
          <div className="h-px bg-line" />
          <p className="text-xs leading-[1.6] text-mist">
            Historical marks an order recorded before card checkout. Pending means payment has not been confirmed.
          </p>
          <p className="text-[11px] leading-[1.6] text-ash">
            Sample period · Aug 7–Oct 28, 2026 · All amounts in USD
          </p>
        </section>
      </div>
    </AdminShell>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <article className="flex items-center justify-between gap-4 border border-line bg-panel p-5">
      <p className="text-[13px] leading-[1.6] text-mist">{label}</p>
      <p className="text-2xl leading-[1.1] font-semibold">{value}</p>
    </article>
  );
}

function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={`${ghostButton("relative")}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none bg-transparent pr-6 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {label}: {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-lime">⌄</span>
    </label>
  );
}
