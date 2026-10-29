import type { CartLine } from "@/lib/cart";
import type { DeliveryMethod } from "@/lib/order";

export type PaymentMethod = "card" | "apple" | "google";
export type OrderStatus = "received" | "delivered" | "cancelled";

export type StoredOrder = {
  id: string;
  placedLabel: string;
  deliveryLabel: string;
  deliveryTitle: string;
  status: OrderStatus;
  statusLabel: string;
  deliveredNote?: string;
  summary: string;
  lines: CartLine[];
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  payment: PaymentMethod;
  sameBilling: boolean;
  delivery: DeliveryMethod;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  packs: number;
  cans: number;
  discount?: number;
  paymentState?: string;
  fulfillment?: string;
  tracking?: string;
  cancellable?: boolean;
};

const idempotencyKey = "prime-idempotency";

const jordan = {
  email: "jordan.ellis@example.com",
  firstName: "Jordan",
  lastName: "Ellis",
  street: "184 Valencia Street",
  apartment: "Apt 4",
  city: "San Francisco",
  state: "California",
  zip: "94103",
  country: "United States",
  phone: "(415) 555-0142",
  payment: "card" as const,
  sameBilling: true,
};

export const illustrativeOrders: StoredOrder[] = [
  {
    id: "VY-10482",
    placedLabel: "OCT 28, 2026",
    deliveryLabel: "NOVEMBER 2–4, 2026",
    deliveryTitle: "ESTIMATED STANDARD DELIVERY",
    status: "received",
    statusLabel: "ORDER RECEIVED",
    summary: "Static Lime × 2 · The Discovery Drop × 1",
    lines: [
      { id: "static-lime-pack", label: "Static Lime packs", qty: 2 },
      { id: "discovery", label: "Discovery Drop", qty: 1 },
    ],
    ...jordan,
    delivery: "standard",
    subtotal: 96,
    shipping: 0,
    tax: 8.16,
    total: 104.16,
    packs: 3,
    cans: 36,
  },
  {
    id: "VY-09861",
    placedLabel: "SEP 16, 2026",
    deliveryLabel: "SEPTEMBER 21, 2026",
    deliveryTitle: "DELIVERED",
    status: "delivered",
    statusLabel: "DELIVERED",
    deliveredNote: "Delivered Sep 21, 2026",
    summary: "Solar Peach × 1 · Night Berry × 1",
    lines: [
      { id: "solar-peach-pack", label: "Solar Peach packs", qty: 1 },
      { id: "night-berry-pack", label: "Night Berry packs", qty: 1 },
    ],
    ...jordan,
    delivery: "standard",
    subtotal: 64,
    shipping: 0,
    tax: 5.44,
    total: 69.44,
    packs: 2,
    cans: 24,
  },
  {
    id: "VY-09024",
    placedLabel: "AUG 07, 2026",
    deliveryLabel: "AUGUST 12, 2026",
    deliveryTitle: "DELIVERED",
    status: "delivered",
    statusLabel: "DELIVERED",
    deliveredNote: "Delivered Aug 12, 2026",
    summary: "The Discovery Drop × 1",
    lines: [{ id: "discovery", label: "Discovery Drop", qty: 1 }],
    ...jordan,
    delivery: "standard",
    subtotal: 32,
    shipping: 0,
    tax: 7.72,
    total: 39.72,
    packs: 1,
    cans: 12,
  },
];

export async function listOrders(): Promise<StoredOrder[]> {
  const response = await fetch("/api/orders");
  if (!response.ok) return [];
  const data = (await response.json()) as { orders?: StoredOrder[] };
  return data.orders ?? [];
}

export async function findOrder(id: string, sessionId?: string) {
  const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
  const response = await fetch(`/api/orders/${id}${query}`);
  if (!response.ok) return null;
  const data = (await response.json()) as { order?: StoredOrder };
  return data.order ?? null;
}

export function checkoutKey() {
  const existing = sessionStorage.getItem(idempotencyKey);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(idempotencyKey, next);
  return next;
}

export function clearCheckoutKey() {
  sessionStorage.removeItem(idempotencyKey);
}

export async function placeCheckout(input: {
  lines: CartLine[];
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  email: string;
  firstName: string;
  lastName: string;
  street: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}) {
  void input.lines;
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, idempotencyKey: checkoutKey() }),
  });
  const data = (await response.json()) as { error?: string; orderId?: string; url?: string | null };
  if (!response.ok) throw new Error(data.error || "The order could not be placed.");
  clearCheckoutKey();
  return data;
}

