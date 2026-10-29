"use client";

import Link from "next/link";
import { money } from "@/lib/order";
import type { AdminOrder } from "@/lib/admin";
import { StatusBadge } from "@/components/admin/shell";
import { useDragScroll } from "@/lib/use-drag-scroll";

export function packLine(order: Pick<AdminOrder, "packs" | "cans">) {
  return `${order.packs === 1 ? "1 pack" : `${order.packs} packs`} · ${order.cans} cans`;
}

export function OrderTable({ orders }: { orders: AdminOrder[] }) {
  const scroller = useDragScroll<HTMLDivElement>();
  return (
    <div ref={scroller} className="drag-scroll touch-pan-y overflow-x-auto border border-line">
      <div className="min-w-[900px]">
        <div className="flex h-[46px] items-start gap-4 bg-[#1a1e19] px-[18px] pt-4 text-[11px] text-ash">
          <p className="w-[140px]">Order</p>
          <p className="w-[130px]">Date</p>
          <p className="w-[170px]">Customer</p>
          <p className="w-[130px]">Payment</p>
          <p className="w-[140px]">Fulfillment</p>
          <p className="w-[100px]">Total</p>
          <p className="w-[62px]"> </p>
        </div>
        {orders.length === 0 ? (
          <p className="bg-panel px-[18px] py-6 text-sm text-mist">No orders match this view.</p>
        ) : (
          orders.map((order) => {
            return (
              <div
                key={order.id}
                className="flex min-h-[86px] items-center gap-4 border-b border-line bg-panel p-[18px]"
              >
                <p className="w-[140px] font-mono text-xs">#{order.id}</p>
                <p className="w-[130px] text-xs text-mist">{order.placedLabel}</p>
                <div className="w-[170px]">
                  <p className="text-[13px]">{order.customer}</p>
                  <p className="mt-1 text-[11px] text-ash">{packLine(order)}</p>
                </div>
                <div className="w-[130px]">
                  <StatusBadge tone={order.payment === "Pending" ? "live" : "quiet"}>{order.payment}</StatusBadge>
                </div>
                <div className="w-[140px]">
                  <StatusBadge tone={order.fulfillment === "Delivered" ? "quiet" : "live"}>
                    {order.fulfillment}
                  </StatusBadge>
                </div>
                <p className="w-[100px] text-[13px]">{money(order.total)}</p>
                <Link href={`/admin/orders/${order.id}`} className="text-[13px] font-medium text-lime">
                  View →
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
