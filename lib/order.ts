import { catalogFlavors } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart";

export const packPrice = 32;
export const freeDeliveryMinimum = 64;
export const expressFee = 9;
export const taxRate = 0.085;

export type DeliveryMethod = "standard" | "express";

export type CartItem = {
  id: string;
  name: string;
  detail: string;
  image: string;
  alt: string;
};

const items: Record<string, CartItem> = {
  discovery: {
    id: "discovery",
    name: "THE DISCOVERY DROP",
    detail: "12-PACK / 3 OF EACH FLAVOR",
    image: "/images/cart/discovery.png",
    alt: "PRIME discovery pack",
  },
};

for (const flavor of catalogFlavors) {
  items[`${flavor.slug}-pack`] = {
    id: `${flavor.slug}-pack`,
    name: flavor.name,
    detail: "12 × 330 ML / $32.00 PER PACK",
    image: flavor.slug === "static-lime" ? "/images/cart/static-lime.png" : flavor.image,
    alt: flavor.alt,
  };
}

export function cartItem(id: string): CartItem {
  return (
    items[id] ?? {
      id,
      name: id.replaceAll("-", " ").toUpperCase(),
      detail: "12 × 330 ML / $32.00 PER PACK",
      image: "/images/cart/static-lime.png",
      alt: "PRIME pack",
    }
  );
}

export function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function summarize(lines: CartLine[], delivery: DeliveryMethod = "standard", discount = 0) {
  const packs = lines.reduce((sum, line) => sum + line.qty, 0);
  const cans = packs * 12;
  const gross = lines.reduce((sum, line) => sum + (line.price ?? packPrice) * line.qty, 0);
  const subtotal = Math.round(gross * 100) / 100;
  const applied = Math.min(subtotal, Math.max(0, Math.round(discount * 100) / 100));
  const taxable = Math.round((subtotal - applied) * 100) / 100;
  const freeDelivery = taxable >= freeDeliveryMinimum;
  const shipping = delivery === "express" ? expressFee : 0;
  const tax = Math.round(taxable * taxRate * 100) / 100;
  const total = Math.round((taxable + shipping + tax) * 100) / 100;
  const remaining = Math.max(0, Math.round((freeDeliveryMinimum - taxable) * 100) / 100);
  return { packs, cans, subtotal, discount: applied, freeDelivery, shipping, tax, total, remaining };
}
