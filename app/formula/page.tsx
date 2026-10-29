import { InfoPage } from "@/components/site/info-page";
import { formulaPillars } from "@/lib/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Formula — PRIME",
  description: "160 mg caffeine, 0 g sugar, B vitamins, and 10 kcal in every PRIME can.",
};

export default function FormulaPage() {
  return (
    <InfoPage
      crumb="FORMULA"
      title="CLEAN INPUT MAXIMUM OUTPUT"
      lede="Everything you need to switch on. Nothing you don’t. The same formula is in every 330 ml can."
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {formulaPillars.map((pillar) => (
          <article key={pillar.label} className="flex flex-col gap-4 border border-line bg-panel p-6">
            <p className="font-display text-[56px] leading-none font-bold">
              {pillar.value}
              {pillar.unit ? <span className="ml-2 font-mono text-[11px]">{pillar.unit}</span> : null}
            </p>
            <p className="font-mono text-[11px]">{pillar.label}</p>
            <p className="text-[13px] leading-[1.6] text-mist">{pillar.copy}</p>
          </article>
        ))}
      </div>
      <p className="max-w-[760px] font-mono text-[11px] leading-[1.6] text-ash">
        HIGH CAFFEINE CONTENT (48 MG/100 ML). NOT RECOMMENDED FOR CHILDREN, PREGNANT OR BREASTFEEDING WOMEN. ENJOY RESPONSIBLY.
      </p>
      <Link href="/products" className="text-[13px] font-bold text-lime">
        Choose a flavor →
      </Link>
    </InfoPage>
  );
}
