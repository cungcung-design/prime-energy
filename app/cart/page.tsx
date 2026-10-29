import { CartPage } from "@/components/cart/cart-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart — PRIME",
  description: "3 packs. 36 cans. Good energy, incoming.",
};

export default function CartRoute() {
  return <CartPage />;
}
