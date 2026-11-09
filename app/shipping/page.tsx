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
      title={
        <>
          DELIVERY
          <br />
          <span className="text-lime italic">AND RETURNS</span>
        </>
      }
      lede="The shipping price you see at checkout is the price saved with the order."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ["Standard", "Free on every order. The estimate shown at checkout is the arrival window saved on the order."],
          ["Express", "$9.00. It is offered as a second option on the checkout page and stored as the delivery method."],
          ["Free delivery", "Orders with $64 or more of merchandise after discounts are marked for free delivery. Standard delivery is already $0."],
        ].map(([title, copy]) => (
          <article key={title} className="border border-line bg-panel p-6">
            <h2 className="font-display text-[28px] leading-none font-bold">{title}</h2>
            <p className="mt-3 text-[15px] leading-[1.65] text-mist">{copy}</p>
          </article>
        ))}
      </div>
      <div className="flex max-w-[760px] flex-col gap-4 text-[15px] leading-[1.65] text-mist">
        <p>Tracking appears on the order when a tracking number is added. Open it from your account or from the confirmation page.</p>
        <p>An order still waiting for payment can be cancelled from your account before it is dispatched. Cancelling releases the reserved stock.</p>
        <p>A paid order is returned by contacting PRIME. Refunds go back through the original payment when the return is confirmed.</p>
        <Link href="/contact" className="text-[15px] font-semibold text-lime">
          Contact us
        </Link>
      </div>
    </InfoPage>
  );
}
