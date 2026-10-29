import { Button } from "@/components/button";
import { SectionLabel } from "@/components/section-label";
import Image from "next/image";

export function Dna() {
  return (
    <section id="dna" className="bg-panel">
      <div className="flex w-full flex-col lg:h-[660px] lg:flex-row">
        <div className="flex w-full flex-col justify-center gap-6 px-4 py-12 sm:px-8 lg:w-[720px] lg:shrink-0 lg:gap-[30px] lg:p-16">
          <SectionLabel>02 / BUILT FROM RESTLESSNESS</SectionLabel>
          <h2 className="font-display text-[56px] leading-[0.94] font-extrabold text-paper sm:text-[72px] lg:text-[100px]">
            NOT MADE
            <br />
            TO FIT IN
          </h2>
          <p className="text-[21px] leading-[1.45] text-paper">
            For the ones who turn “what if” into “watch me.”
          </p>
          <p className="max-w-[470px] text-[14px] leading-[1.75] text-mist">
            PRIME started with a simple refusal: ordinary wasn’t enough. Not in our
            cans. Not in our lives. We make uncompromising energy for a generation
            that moves on its own terms — from the first session to the last train
            home.
          </p>
          <Button href="/about" icon="/icons/arrow-up-right-light.svg" variant="outline">
            This is PRIME
          </Button>
        </div>
        <div className="relative h-[280px] min-h-0 sm:h-[420px] lg:h-auto lg:flex-1">
          <Image
            src="/images/obsidian-campaign.png"
            alt="PRIME can standing in dark water"
            fill
            sizes="(max-width: 1023px) 100vw, 720px"
            className="object-cover"
          />
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-1 font-mono text-[10px] text-paper lg:inset-x-8 lg:bottom-8 lg:flex-nowrap lg:whitespace-nowrap">
            <p>NO PERMISSION NEEDED.</p>
            <p>51.5072° N / AFTER HOURS</p>
          </div>
        </div>
      </div>
    </section>
  );
}
