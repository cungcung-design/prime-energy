import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — PRIME",
  description: "PRIME started with a simple refusal: ordinary wasn’t enough. Bold flavor. Zero sugar.",
};

export default function AboutPage() {
  return (
    <InfoPage
      crumb="ABOUT"
      title={
        <>
          NOT MADE
          <br />
          <span className="text-lime italic">TO FIT IN</span>
        </>
      }
      lede="For the ones who turn “what if” into “watch me.”"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5 text-[15px] leading-[1.65] text-mist">
          <p>
            PRIME started with a simple refusal: ordinary wasn’t enough. Not in our cans. Not in our lives. We make
            uncompromising energy for a generation that moves on its own terms — from the first session to the last
            train home.
          </p>
          <p>Four flavors. One formula. Bold taste and considered ingredients in every cold, crisp can.</p>
          <Link href="/products" className="text-[15px] font-semibold text-lime">
            Explore the Flavors
          </Link>
        </div>
        <dl className="grid gap-6 border border-line bg-panel p-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] tracking-wide text-ash">ORIGIN</dt>
            <dd className="mt-2 text-[15px] leading-[1.65]">Built from restlessness. No permission needed.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-wide text-ash">RANGE</dt>
            <dd className="mt-2 text-[15px] leading-[1.65]">
              Static Lime, Solar Peach, Night Berry, Glacial Rush, and the Discovery Drop.
            </dd>
          </div>
        </dl>
      </div>
    </InfoPage>
  );
}
