import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — PRIME",
  description: "PRIME makes uncompromising energy for people who move on their own terms.",
};

export default function AboutPage() {
  return (
    <InfoPage
      crumb="ABOUT"
      title="NOT MADE TO FIT IN"
      lede="PRIME started with a simple refusal: ordinary wasn’t enough. Not in the cans. Not in the routine."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5 text-[14px] leading-[1.75] text-mist">
          <p>
            We make energy for a generation that moves on its own terms — from the first session to the last train home.
            Four flavors, one formula, and a variety pack when you want the whole set.
          </p>
          <p>The shop, the account, and the orders on this site are the store. About is the reason the cans exist.</p>
          <Link href="/products" className="text-[13px] font-bold text-lime">
            Shop the flavors →
          </Link>
        </div>
        <dl className="grid gap-6 border border-line bg-panel p-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] text-ash">ORIGIN</dt>
            <dd className="mt-2 text-sm">Built from restlessness, not a brief to blend in.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-ash">RANGE</dt>
            <dd className="mt-2 text-sm">Static Lime, Solar Peach, Night Berry, Glacial Rush, and the Discovery Drop.</dd>
          </div>
        </dl>
      </div>
    </InfoPage>
  );
}
