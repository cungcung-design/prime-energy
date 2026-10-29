import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — PRIME",
  description: "Terms for shopping at the PRIME store.",
};

export default function TermsPage() {
  return (
    <InfoPage crumb="TERMS" title="TERMS OF USE" lede="Placing an order means the prices, stock, and shipping shown at checkout are the ones saved on that order.">
      <div className="flex max-w-[760px] flex-col gap-4 text-[14px] leading-[1.75] text-mist">
        <p>Prices and stock are checked on the server when an item is added and again when the order is created. An item with no stock cannot be purchased.</p>
        <p>An order is confirmed only after payment succeeds. A cancelled or failed payment releases the reserved stock and does not keep a charge.</p>
        <p>Promo codes apply only when they are valid, unexpired, and the order meets the minimum and use limit.</p>
        <p>
          Shipping, cancellation, and returns are described on the{" "}
          <Link href="/shipping" className="text-lime">
            shipping page
          </Link>
          .
        </p>
      </div>
    </InfoPage>
  );
}
