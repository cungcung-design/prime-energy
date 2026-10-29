import { Icon } from "@/components/icon";
import { SectionLabel } from "@/components/section-label";
import { formulaPillars } from "@/lib/content";

export function Formula() {
  return (
    <section id="formula" className="bg-paper text-ink">
      <div className="flex w-full flex-col gap-10 px-4 py-12 sm:px-8 lg:gap-12 lg:px-16 lg:py-[88px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-[72px]">
          <div className="flex w-full flex-col gap-7 lg:w-[660px] lg:shrink-0">
            <SectionLabel tone="light">03 / NOTHING TO HIDE</SectionLabel>
            <h2 className="font-display text-[48px] leading-[0.94] font-extrabold sm:text-[64px] lg:text-[88px]">
              CLEAN INPUT
              <br />
              MAXIMUM OUTPUT
            </h2>
          </div>
          <div className="flex flex-1 flex-col gap-6 lg:pt-[52px]">
            <p className="text-[16px] leading-[1.7] text-panel">
              Everything you need to switch on. Nothing you don’t. Our signature
              blend brings bold taste and considered ingredients to every cold,
              crisp can.
            </p>
            <a href="/formula" className="inline-flex items-center gap-[18px] text-[12px] font-bold">
              See the full ingredient list
              <Icon src="/icons/arrow-up-right-dark.svg" width={20} height={20} />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {formulaPillars.map((pillar) => (
            <div key={pillar.label} className="flex flex-col gap-[18px] border-t border-mist pt-6">
              <div className="flex items-baseline gap-2 whitespace-nowrap">
                <p className="font-display text-[64px] leading-none font-bold">
                  {pillar.value}
                </p>
                {pillar.unit ? (
                  <p className="font-mono text-[11px]">{pillar.unit}</p>
                ) : null}
              </div>
              <p className="font-mono text-[11px] font-semibold">{pillar.label}</p>
              <p className="text-[13px] leading-[1.6] text-line">{pillar.copy}</p>
            </div>
          ))}
        </div>
        <p className="font-mono text-[9px] text-ash">
          HIGH CAFFEINE CONTENT (48 MG/100 ML). NOT RECOMMENDED FOR CHILDREN,
          PREGNANT OR BREASTFEEDING WOMEN. ENJOY RESPONSIBLY.
        </p>
      </div>
    </section>
  );
}
