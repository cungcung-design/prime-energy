import { Icon } from "@/components/icon";
import { SectionLabel } from "@/components/section-label";
import { formulaPillars } from "@/lib/content";
import Link from "next/link";

export function Formula() {
  return (
    <section id="formula" className="relative bg-ink text-paper overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-gradient-to-r from-lime/10 via-transparent to-transparent rounded-full blur-[200px] pointer-events-none" />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-16 sm:px-8 lg:gap-14 lg:px-16 lg:py-24">
        {/* Header Section */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[700px] flex-col gap-5">
            <SectionLabel>03 / NOTHING TO HIDE</SectionLabel>
            <h2 className="font-display text-[44px] leading-[0.9] font-extrabold sm:text-[60px] lg:text-[72px]">
              <span className="text-paper">CLEAN INPUT</span>
              <br />
              <span className="text-lime italic">MAXIMUM OUTPUT</span>
            </h2>
            <p className="max-w-[480px] text-[16px] leading-[1.65] text-mist">
              Four pillars. Zero compromise. Every ingredient earns its place — clean energy, bold flavor, and nothing
              superfluous.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:w-[320px]">
            <Link href="/formula" className="group inline-flex items-center gap-2 text-[14px] font-bold text-lime hover:gap-3 transition-gap">
              See the full breakdown
              <Icon src="/icons/arrow-up-right-light.svg" width={18} height={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Pillars Grid */}
        <dl className="relative grid gap-1 lg:grid-cols-4">
          {formulaPillars.map((pillar, index) => (
            <article
              key={pillar.label}
              className="relative group flex flex-col overflow-hidden border border-line bg-panel/50 px-6 py-8 transition-all duration-500 hover:border-lime/50 hover:bg-panel hover:shadow-[0_0_40px_rgba(205,255,63,0.08)]"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-col gap-1">
                <p className="font-display text-[48px] leading-none font-extrabold text-lime sm:text-[56px] lg:text-[64px]">
                  {pillar.value}
                  {pillar.unit && (
                    <span className="ml-2 align-baseline font-mono text-[12px] font-semibold tracking-wide text-paper">
                      {pillar.unit}
                    </span>
                  )}
                </p>
              </div>
              <p className="font-mono text-[11px] tracking-widest text-ash uppercase mt-1">{pillar.label}</p>
              <p className="text-[15px] leading-[1.7] text-mist mt-4 flex-1">{pillar.copy}</p>
            </article>
          ))}
        </dl>
      </div>
    </section>
  );
}