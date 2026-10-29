import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & returns — PRIME",
  description: "Standard delivery, express delivery, tracking, cancellation, and returns for PRIME orders.",
};

export default function ShippingPage() {
  return (
    <InfoPage
      crumb="SHIPPING & RETURNS"
      title="DELIVERY AND RETURNS"
      lede="Shipping is chosen at checkout. The price you see there is the price that is stored with the order."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["Standard", "Free on every order. The estimate shown at checkout is the arrival window saved on the order."],
          ["Express", "$9.00. It is offered as a second option on the checkout page and stored as the delivery method."],
          ["Free-delivery mark", "Orders with $64 or more of merchandise after discounts are marked for free delivery. Standard delivery is already $0."],
        ].map(([title, copy]) => (
          <article key={title} className="border border-line bg-panel p-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-[13px] leading-[1.65] text-mist">{copy}</p>
          </article>
        ))}
      </div>
      <div className="flex max-w-[760px] flex-col gap-4 text-[14px] leading-[1.7] text-mist">
        <p>Tracking appears on the order when the store adds a tracking number. Open the order from My Account or from the confirmation page.</p>
        <p>An order that is still waiting for payment can be cancelled from My Account before it is dispatched. Cancelling releases the reserved stock.</p>
        <p>A paid order is returned by contacting the store. Refunds are issued back through the original payment when the store confirms the return.</p>
        <Link href="/contact" className="text-[13px] font-bold text-lime">
          Contact the store →
        </Link>
      </div>
    </InfoPage>
  );
}
