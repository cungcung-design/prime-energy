import { Button } from "@/components/button";
import { SectionLabel } from "@/components/section-label";
import Image from "next/image";

export function Discovery() {
  return (
    <section id="discovery" className="bg-panel">
      <div className="flex w-full flex-col lg:h-[500px] lg:flex-row">
        <div className="relative h-[240px] w-full sm:h-[360px] lg:h-full lg:w-[720px] lg:shrink-0">
          <Image
            src="/images/variety-pack.png"
            alt="PRIME variety pack with four flavor cans"
            fill
            sizes="(max-width: 1023px) 100vw, 720px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-8 lg:p-16">
          <SectionLabel>THE DISCOVERY DROP / 12-PACK</SectionLabel>
          <h2 className="font-display text-[48px] leading-[0.94] font-extrabold text-paper sm:text-[64px] lg:text-[76px]">
            FIND YOUR
            <br />
            FIRST OBSESSION
          </h2>
          <p className="max-w-[440px] text-[14px] leading-[1.65] text-mist">
            All four flavors. Three of each. Your all-access pass to the PRIME
            universe. Start here. Go anywhere.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button href="/products#discovery-pack" icon="/icons/arrow-up-right-dark.svg">
              Get the Variety Pack
            </Button>
            <div className="flex flex-col gap-[5px]">
              <p className="text-[19px] font-semibold text-paper">$32.00</p>
              <p className="font-mono text-[9px] text-ash">FREE SHIPPING $50+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
