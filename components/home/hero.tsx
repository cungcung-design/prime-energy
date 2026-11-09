import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Navigation } from "@/components/navigation";
import { SectionLabel } from "@/components/section-label";
import Image from "next/image";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink lg:h-[750px]">
      <div className="relative flex w-full flex-col lg:h-[900px]">
        <div className="pointer-events-none absolute top-20 left-0 hidden h-[760px] w-[900px] bg-gradient-to-r from-ink via-[rgba(9,11,10,0.92)] via-60% to-transparent lg:block" />
        <Navigation />
        <div className="prime-hero-copy relative z-10 flex w-full flex-col gap-6 px-4 pt-8 pb-8 sm:px-8 lg:w-[750px] lg:gap-[26px] lg:px-0 lg:pt-[70px] lg:pr-0 lg:pb-0 lg:pl-16">
          <SectionLabel>NEXT-GENERATION ENERGY / ZERO COMPROMISE</SectionLabel>
          <h1 className="flex flex-col gap-2 font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:gap-2 lg:text-[80px] lg:leading-[0.9]">
            <span className="text-paper lg:whitespace-nowrap">UNLEASH PRIME</span>
            <span className="text-lime italic lg:whitespace-nowrap">PURE ENERGY</span>
          </h1>
          <div className="flex max-w-[400px] flex-col gap-[14px] pt-1">
            <p className="text-[23px] font-semibold text-paper">FUEL YOUR AMBITION</p>
            <p className="text-[15px] leading-[1.65] text-mist">
              Experience the power of PRIME Energy. Bold flavor. Zero sugar. Made to fuel your ambition and elevate every moment.
            </p>
          </div>
          <div className="flex w-full flex-nowrap items-center gap-2 pt-2 lg:w-auto lg:gap-3">
            <Button compact href="/products" icon="/icons/arrow-up-right-dark.svg">
              Explore the Flavors
            </Button>
            <Button
              compact
              href="#dna"
              icon="/icons/arrow-up-right-light.svg"
              variant="outline"
            >
              Discover the Brand
            </Button>
          </div>
        </div>
        <div className="prime-hero-image pointer-events-none relative z-0 mx-auto h-[340px] w-full max-w-[420px] sm:h-[460px] lg:absolute lg:top-10 lg:left-[490px] lg:z-0 lg:mx-0 lg:h-[820px] lg:w-[950px] lg:max-w-none">
          <Image
            src="/images/hero-can.png"
            alt="Static Lime can bursting through dark water"
            fill
            priority
            sizes="(min-width: 1024px) 950px, 420px"
            className="object-contain object-center lg:object-cover"
          />
        </div>
      </div>
    </section>
  );
}
