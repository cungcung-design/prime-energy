export const packPriceCents = 3200;
export const freeDeliveryMinimumCents = 6400;
export const expressFeeCents = 900;
export const taxRate = 0.085;

export type QuoteLine = { qty: number; priceCents: number };

export function quote(input: {
  lines: QuoteLine[];
  delivery: "standard" | "express";
  discountCents?: number;
  standardCents?: number;
  expressCents?: number;
  freeMinimumCents?: number;
}) {
  const packs = input.lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = input.lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const discount = Math.min(subtotal, Math.max(0, input.discountCents ?? 0));
  const taxable = subtotal - discount;
  const minimum = input.freeMinimumCents ?? freeDeliveryMinimumCents;
  const standard = input.standardCents ?? 0;
  const shipping = input.delivery === "express" ? (input.expressCents ?? expressFeeCents) : taxable >= minimum ? 0 : standard;
  const tax = Math.round(taxable * taxRate);
  const total = taxable + shipping + tax;
  return {
    packs,
    cans: packs * 12,
    subtotal,
    discount,
    taxable,
    shipping,
    tax,
    total,
    freeDelivery: taxable >= minimum,
  };
}

export function dollars(cents: number) {
  return Math.round(cents) / 100;
}
