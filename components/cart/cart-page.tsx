"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { ShopProgress } from "@/components/shop/progress";
import { useCart, type CartLine } from "@/lib/cart";
import { cartItem, money, summarize } from "@/lib/order";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

function moveTo(list: string[], from: string, to: string) {
  if (from === to) return list;
  const fromIndex = list.indexOf(from);
  const toIndex = list.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return list;
  const next = [...list];
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next.join("|") === list.join("|") ? list : next;
}

function CartRow({
  line,
  active,
  onRemove,
  onChangeQty,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  line: CartLine;
  active: boolean;
  onRemove: () => void;
  onChangeQty: (qty: number) => void;
  onDragStart: (id: string) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
}) {
  const item = cartItem(line.id);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [sliding, setSliding] = useState(false);
  const swipe = useRef({ x: 0, y: 0, pointer: -1, dragging: false });
  const pressing = useRef(false);

  return (
    <div className={`relative border-b border-line ${sliding ? "z-20 overflow-visible" : "overflow-hidden"}`} data-line-id={line.id}>
      <div className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-lime text-[12px] font-bold text-ink">
        Remove
      </div>
      <article
        className={`relative flex touch-none items-center gap-4 bg-ink py-5 sm:gap-5 ${active ? "opacity-70" : ""} ${sliding ? "z-10" : ""}`}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: sliding ? "none" : "transform 220ms ease",
        }}
        onPointerDown={(event) => {
          if ((event.target as Element).closest("button, a, input")) return;
          swipe.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId, dragging: false };
          setSliding(true);
        }}
        onPointerMove={(event) => {
          if (event.pointerId !== swipe.current.pointer) return;
          const dx = event.clientX - swipe.current.x;
          const dy = event.clientY - swipe.current.y;
          if (!swipe.current.dragging && Math.hypot(dx, dy) <= 6) return;
          swipe.current.dragging = true;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            /* The pointer can already be gone. */
          }
          setOffset({ x: dx, y: dy });
        }}
        onPointerUp={(event) => {
          if (event.pointerId !== swipe.current.pointer) return;
          const dx = event.clientX - swipe.current.x;
          const dy = event.clientY - swipe.current.y;
          const dragged = swipe.current.dragging;
          swipe.current.pointer = -1;
          swipe.current.dragging = false;
          setSliding(false);
          if (dragged && dx < -88 && Math.abs(dx) > Math.abs(dy)) onRemove();
          setOffset({ x: 0, y: 0 });
        }}
        onPointerCancel={() => {
          swipe.current.pointer = -1;
          swipe.current.dragging = false;
          setSliding(false);
          setOffset({ x: 0, y: 0 });
        }}
      >
        <button
          type="button"
          aria-label={`Drag to reorder ${item.name}`}
          className="flex size-11 shrink-0 touch-none cursor-grab flex-col items-center justify-center gap-[5px] active:cursor-grabbing"
          onPointerDown={(event) => {
            event.stopPropagation();
            pressing.current = true;
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              /* Pointer capture is unavailable for some synthetic events. */
            }
            onDragStart(line.id);
          }}
          onPointerMove={(event) => {
            if (!pressing.current) return;
            onDragMove(event.clientX, event.clientY);
          }}
          onPointerUp={() => {
            if (!pressing.current) return;
            pressing.current = false;
            onDragEnd();
          }}
          onPointerCancel={() => {
            pressing.current = false;
            onDragEnd();
          }}
        >
          <span className="h-px w-4 bg-ash" />
          <span className="h-px w-4 bg-ash" />
          <span className="h-px w-4 bg-ash" />
        </button>
        <div className="relative h-[112px] w-[96px] shrink-0 sm:h-[144px] sm:w-[120px]">
          <Image src={item.image} alt={item.alt} fill sizes="120px" className="pointer-events-none object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
          <h2 className="font-display text-[30px] leading-none font-extrabold">{item.name}</h2>
          <p className="font-mono text-[9px] leading-[1.5] text-ash">{item.detail}</p>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-11 items-center gap-2 border border-line px-1">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center text-[17px] text-mist"
                aria-label={`Decrease ${item.name}`}
                onClick={() => onChangeQty(line.qty - 1)}
              >
                −
              </button>
              <span className="min-w-4 text-center font-mono text-[12px]">{line.qty}</span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center text-[17px] text-mist"
                aria-label={`Increase ${item.name}`}
                onClick={() => onChangeQty(Math.min(12, line.qty + 1))}
              >
                +
              </button>
            </div>
            <button type="button" className="inline-flex min-h-11 items-center text-[11px] text-mist underline" onClick={onRemove}>
              Remove
            </button>
          </div>
        </div>
        <p className="text-[14px]">{money(line.qty * (line.price ?? 32))}</p>
      </article>
    </div>
  );
}

export function CartPage() {
  const { lines, notice, promo, promoNote, discount, setQty, remove, applyPromo } = useCart();
  const [code, setCode] = useState(promo);
  const [seenPromo, setSeenPromo] = useState(promo);
  if (promo !== seenPromo) {
    setSeenPromo(promo);
    if (promo) setCode(promo);
  }
  const lineIds = lines.map((line) => line.id);
  const lineKey = lineIds.join("|");
  const [seenLines, setSeenLines] = useState(lineKey);
  const [order, setOrder] = useState(lineIds);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);
  if (lineKey !== seenLines) {
    setSeenLines(lineKey);
    setOrder((current) => {
      const kept = current.filter((id) => lineIds.includes(id));
      return [...kept, ...lineIds.filter((id) => !kept.includes(id))];
    });
  }
  const orderedLines = order.map((id) => lines.find((line) => line.id === id)).filter((line): line is CartLine => Boolean(line));
  const totals = summarize(lines, "standard", discount);
  const threshold = totals.freeDelivery ? 100 : Math.min(100, (totals.subtotal / 64) * 100);

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:gap-9 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <ShopProgress current={1} />
        <div className="flex flex-col gap-[22px]">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/">HOME</Link>
            {" / "}
            CART
          </p>
          <h1 className="font-display text-[clamp(48px,8vw,88px)] leading-none font-extrabold xl:text-[88px]">
            YOUR NEXT CHARGE
          </h1>
          <p className="text-[14px] leading-[1.65] text-mist">
            {totals.packs} {totals.packs === 1 ? "pack" : "packs"}. {totals.cans} cans. Good energy, incoming.
          </p>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-col gap-4 border border-line bg-panel p-6">
            <p className="text-[14px] text-mist">Your bag is empty.</p>
            <Link href="/products" className="text-[13px] font-medium text-lime">
              ← Continue shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-16">
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="flex items-center gap-3 border border-line bg-panel p-3.5">
                <Icon src="/icons/check-circle.svg" width={18} height={18} />
                <p className="text-[12px] leading-[1.5] text-mist">{notice}</p>
              </div>
              <div className="flex flex-col">
                {orderedLines.map((line) => (
                  <CartRow
                    key={line.id}
                    line={line}
                    active={dragId === line.id}
                    onRemove={() => remove(line.id)}
                    onChangeQty={(qty) => setQty(line.id, qty)}
                    onDragStart={(id) => {
                      dragRef.current = id;
                      setDragId(id);
                    }}
                    onDragMove={(x, y) => {
                      const currentId = dragRef.current;
                      if (!currentId) return;
                      const hit = document
                        .elementsFromPoint(x, y)
                        .map((node) => (node instanceof Element ? node.closest("[data-line-id]") : null))
                        .find((node) => node && node.getAttribute("data-line-id") !== currentId);
                      const over = hit?.getAttribute("data-line-id");
                      if (!over) return;
                      setOrder((current) => moveTo(current, currentId, over));
                    }}
                    onDragEnd={() => {
                      dragRef.current = null;
                      setDragId(null);
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Link href="/products" className="text-[13px] font-medium text-lime">
                  ← Continue shopping
                </Link>
                <p className="font-mono text-[11px] leading-[1.5] text-ash">ONE-TIME PURCHASE</p>
              </div>
              <p className="text-[12px] leading-[1.65] text-mist">
                Drag a pack in any direction, use the grip to reorder, or swipe it left to remove it. Quantities are per 12-pack, not per can.
              </p>
            </div>

            <aside className="flex w-full flex-col gap-6 bg-panel p-6 xl:w-[432px] xl:shrink-0 xl:p-7">
              <h2 className="font-display text-[36px] leading-none font-extrabold">ORDER SUMMARY</h2>
              <p className="text-[12px] leading-[1.65] text-mist">
                {totals.freeDelivery
                  ? "Free delivery unlocked. Keep the momentum."
                  : `Add ${money(totals.remaining)} to unlock free delivery.`}
              </p>
              <div className="h-[3px] w-full bg-line">
                <div className="h-[3px] bg-lime" style={{ width: `${threshold}%` }} />
              </div>
              <div className="flex flex-col gap-[18px] text-[13px]">
                <SummaryLine label={`Subtotal · ${totals.packs} packs / ${totals.cans} cans`} value={money(totals.subtotal)} />
                {totals.discount > 0 ? <SummaryLine label="Discount" value={`-${money(totals.discount)}`} /> : null}
                <SummaryLine label="Standard delivery" value={totals.freeDelivery ? "FREE" : "AT $64"} />
                <SummaryLine label="Estimated tax" value={money(totals.tax)} />
                <div className="h-px bg-line" />
                <div className="flex items-center justify-between">
                  <p className="text-[18px] font-semibold">Estimated total</p>
                  <p className="font-display text-[36px] leading-none font-bold text-lime">{money(totals.total)}</p>
                </div>
              </div>
              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  applyPromo(code);
                }}
              >
                <label className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="font-mono text-[11px] leading-[1.5] text-mist">GOT A CODE?</span>
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Promo code"
                    className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none placeholder:text-paper"
                  />
                </label>
                <button type="submit" className="h-[52px] border border-line px-4 text-[12px]">
                  Apply
                </button>
              </form>
              {promoNote ? <p className="text-[11px] leading-[1.5] text-ash">{promo ? `${promo}. ` : ""}{promoNote}</p> : null}
              <Link
                href="/checkout"
                className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink"
              >
                Continue to Checkout
                <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
              </Link>
              <p className="text-[11px] leading-[1.65] text-mist">
                Checkout as a guest or sign in. Tax is estimated for San Francisco, CA 94103.
              </p>
              <Link href="/sign-in" className="text-[13px] font-medium text-lime">
                Sign In for a faster checkout →
              </Link>
            </aside>
          </div>
        )}
      </main>
      <ShopFooter />
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-mist">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
