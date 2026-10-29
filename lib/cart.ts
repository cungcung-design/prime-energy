"use client";

import { useCallback, useEffect, useState } from "react";

export type CartLine = {
  id: string;
  label: string;
  qty: number;
  price?: number;
  image?: string;
  detail?: string;
};

const changeEvent = "prime-cart-change";

export const defaultNotice = "Your cart is ready when you are.";

type CartPayload = {
  lines: CartLine[];
  promo?: string;
  promoNote?: string;
  discount?: number;
  error?: string;
};

function slugFor(id: string) {
  return id === "discovery" ? "discovery" : id.replace(/-pack$/, "");
}

async function send(path: string, method: string, body?: unknown) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as CartPayload;
  if (!response.ok) throw new Error(data.error || "The cart could not be updated.");
  window.dispatchEvent(new Event(changeEvent));
  return data;
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function cartPreview(lines: CartLine[]) {
  const parts = lines
    .filter((line) => line.qty > 0)
    .map((line) => `${line.qty} ${line.label}`);
  if (parts.length === 0) return "Cart preview: your bag is empty.";
  return `Cart preview: ${parts.join(" + ")}.`;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [notice, setNotice] = useState(defaultNotice);
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyPayload = useCallback((data: CartPayload) => {
    setLines(data.lines ?? []);
    setPromo(data.promo ?? "");
    setPromoNote(data.promoNote ?? "");
    setDiscount(data.discount ?? 0);
  }, []);

  useEffect(() => {
    let ignore = false;
    const sync = () => {
      void fetch("/api/cart")
        .then((response) => response.json())
        .then((data: CartPayload) => {
          if (!ignore) applyPayload(data);
        })
        .catch(() => {
          if (!ignore) setNotice("The cart could not be loaded.");
        });
    };
    sync();
    window.addEventListener(changeEvent, sync);
    return () => {
      ignore = true;
      window.removeEventListener(changeEvent, sync);
    };
  }, [applyPayload]);

  const add = useCallback(async (id: string, label: string, qty: number) => {
    try {
      const data = await send("/api/cart", "POST", { slug: slugFor(id), qty, mode: "add" });
      applyPayload(data);
      setNotice(`${label.replace(/ packs$/, "")} added. Your cart is ready when you are.`);
      return "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "The cart could not be updated.";
      setNotice(message);
      return message;
    }
  }, [applyPayload]);

  const setQty = useCallback(
    async (id: string, qty: number) => {
      try {
        const data = await send("/api/cart", "POST", { slug: slugFor(id), qty, mode: "set" });
        applyPayload(data);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "The cart could not be updated.");
      }
    },
    [applyPayload],
  );

  const remove = useCallback((id: string) => setQty(id, 0), [setQty]);

  const clear = useCallback(async () => {
    try {
      applyPayload(await send("/api/cart", "DELETE"));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The cart could not be cleared.");
    }
  }, [applyPayload]);

  const applyPromo = useCallback(
    async (code: string) => {
      try {
        applyPayload(await send("/api/cart/promo", "POST", { code }));
      } catch (error) {
        setPromoNote(error instanceof Error ? error.message : "That code could not be applied.");
      }
    },
    [applyPayload],
  );

  return {
    lines,
    count: cartCount(lines),
    notice,
    promo,
    promoNote,
    discount,
    add,
    setQty,
    remove,
    clear,
    applyPromo,
    preview: cartPreview(lines),
  };
}
