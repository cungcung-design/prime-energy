import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — PRIME",
  description: "Shipping, order questions, and a way to reach the PRIME store.",
};

const links = [
  { href: "/shipping", title: "Shipping & returns", copy: "Delivery options, tracking, cancellation, and how a return starts." },
  { href: "/faq", title: "FAQs", copy: "Accounts, guest checkout, promos, stock, and order history." },
  { href: "/contact", title: "Contact us", copy: "Send a message about an order, a stockist request, or press." },
  { href: "/account?tab=orders", title: "Your orders", copy: "Sign in to see payment status, tracking, and orders you can cancel." },
];

export default function SupportPage() {
  return (
    <InfoPage crumb="SUPPORT" title="HELP WHEN YOU NEED IT" lede="Shipping, account, and order questions live here. Each link opens a real page.">
      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex flex-col gap-3 border border-line bg-panel p-6">
            <span className="text-lg font-semibold">{link.title}</span>
            <span className="text-[13px] leading-[1.6] text-mist">{link.copy}</span>
            <span className="text-[13px] font-medium text-lime">Open →</span>
          </Link>
        ))}
      </div>
    </InfoPage>
  );
}
