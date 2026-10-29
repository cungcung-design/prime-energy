import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — PRIME",
  description: "What the PRIME store stores about accounts, carts, and orders.",
};

export default function PrivacyPage() {
  return (
    <InfoPage crumb="PRIVACY" title="PRIVACY POLICY" lede="The store keeps the information it needs to run an account, a cart, and an order.">
      <div className="flex max-w-[760px] flex-col gap-4 text-[14px] leading-[1.75] text-mist">
        <p>An account stores your name, email, phone, password hash, newsletter choice, and saved address. The password is never stored in plain text.</p>
        <p>A cart is tied to a cookie on this browser until you check out or clear it. Signing in merges that cart with your account cart.</p>
        <p>An order stores the items, prices, shipping address, delivery method, totals, payment state, and tracking number. Card numbers and security codes are not stored. Payment is handled by the payment provider.</p>
        <p>A contact message stores the name, email, topic, and message you submit.</p>
      </div>
    </InfoPage>
  );
}
