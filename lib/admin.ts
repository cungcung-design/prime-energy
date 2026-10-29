"use client";

import { useEffect, useState } from "react";

export type ProductStatus = "Available" | "Low stock" | "Out of stock";

export type AdminProduct = {
  sku: string;
  name: string;
  description: string;
  category: string;
  detail: string;
  price: number;
  stock: number;
  published: boolean;
  image: string;
};

export type Fulfillment = "Unfulfilled" | "Preparing" | "Dispatched" | "Delivered";

export type AdminLine = {
  name: string;
  detail: string;
  quantity: number;
  price: number;
  image: string;
};

export type AdminOrder = {
  id: string;
  dateLabel: string;
  placedLabel: string;
  customer: string;
  email: string;
  phone: string;
  packs: number;
  cans: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  delivery: string;
  estimate: string;
  payment: "Pending" | "Paid" | "Failed" | "Cancelled" | "Historical" | "Refunded";
  fulfillment: Fulfillment;
  tracking?: string;
  discount?: number;
  refundable?: boolean;
  summary: string;
  address: string[];
  lines: AdminLine[];
  activity: { title: string; detail: string }[];
};

export const adminProducts: AdminProduct[] = [
  {
    sku: "PR-SL-12",
    name: "Static Lime",
    description: "Sharp lime. Crisp yuzu. A high-voltage citrus finish.",
    category: "Single flavors",
    detail: "12 × 330 ml",
    price: 32,
    stock: 432,
    published: true,
    image: "/images/admin/static-lime.png",
  },
  {
    sku: "PR-SP-12",
    name: "Solar Peach",
    description: "Ripe peach with a warm, sunlit finish. A low-stock example in this sample catalog.",
    category: "Single flavors",
    detail: "12 × 330 ml",
    price: 32,
    stock: 18,
    published: true,
    image: "/images/admin/solar-peach.png",
  },
  {
    sku: "PR-NB-12",
    name: "Night Berry",
    description: "Dark berry with a cool finish. Temporarily unavailable at zero packs in this preview.",
    category: "Single flavors",
    detail: "12 × 330 ml",
    price: 32,
    stock: 0,
    published: true,
    image: "/images/admin/night-berry.png",
  },
  {
    sku: "PR-GR-12",
    name: "Glacial Rush",
    description: "Crisp glacial citrus. A steady, in-stock flavor in the sample lineup.",
    category: "Single flavors",
    detail: "12 × 330 ml",
    price: 32,
    stock: 286,
    published: true,
    image: "/images/admin/glacial-rush.png",
  },
  {
    sku: "PR-DD-12",
    name: "Discovery Drop",
    description: "A mixed 12-pack with three cans of each core flavor.",
    category: "Discovery",
    detail: "12 × 330 ml · 3 of each flavor",
    price: 32,
    stock: 96,
    published: true,
    image: "/images/admin/discovery.png",
  },
];

export const fulfillmentOptions: Fulfillment[] = ["Unfulfilled", "Preparing", "Dispatched", "Delivered"];

export function stockStatus(stock: number): ProductStatus {
  if (stock <= 0) return "Out of stock";
  if (stock <= 20) return "Low stock";
  return "Available";
}

async function adminRequest(path: string, method: string, body?: unknown) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as { error?: string; products?: AdminProduct[]; orders?: AdminOrder[] };
  if (!response.ok) throw new Error(data.error || "The store could not be updated.");
  window.dispatchEvent(new Event("prime-admin-change"));
  return data;
}

export async function saveProduct(product: AdminProduct, originalSku: string) {
  await adminRequest("/api/admin/products", "PUT", { product, originalSku });
}

export async function deleteProduct(sku: string) {
  await adminRequest(`/api/admin/products/${encodeURIComponent(sku)}`, "DELETE");
}

export async function saveFulfillment(id: string, status: Fulfillment, tracking = "") {
  await adminRequest(`/api/admin/orders/${id}`, "PATCH", { fulfillment: status, tracking });
}

export function useAdminData() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      void fetch("/api/admin/snapshot")
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((data: { products: AdminProduct[]; orders: AdminOrder[] }) => {
          setProducts(data.products);
          setOrders(data.orders);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    };
    refresh();
    window.addEventListener("prime-admin-change", refresh);
    return () => window.removeEventListener("prime-admin-change", refresh);
  }, []);

  return { products, orders, loaded };
}

export function editorImage(product: AdminProduct) {
  return product.sku === "PR-SL-12" && product.image === "/images/admin/static-lime.png"
    ? "/images/admin/static-lime-editor.png"
    : product.image;
}
