import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — PRIME",
  description: "Shipping, orders, and a direct line to PRIME. Nothing you don’t need.",
};

const links = [
  { href: "/shipping", title: "Shipping & returns", copy: "Delivery options, tracking, cancellation, and how a return starts." },
  { href: "/faq", title: "FAQs", copy: "Accounts, guest checkout, promos, stock, and order history." },
  { href: "/contact", title: "Contact us", copy: "Send a message about an order, a stockist request, or press." },
  { href: "/account?tab=orders", title: "Your orders", copy: "Sign in to see payment status, tracking, and orders you can cancel." },
];

export default function SupportPage() {
  return (
    <InfoPage
      crumb="SUPPORT"
      title={
        <>
          HERE WHEN
          <br />
          <span className="text-lime italic">YOU NEED IT</span>
        </>
      }
      lede="Shipping, orders, and a direct line. Nothing you don’t need."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex flex-col gap-3 border border-line bg-panel p-6">
            <span className="font-display text-[28px] leading-none font-bold">{link.title}</span>
            <span className="text-[15px] leading-[1.65] text-mist">{link.copy}</span>
            <span className="text-[15px] font-semibold text-lime">Open</span>
          </Link>
        ))}
      </div>
    </InfoPage>
  );
}
