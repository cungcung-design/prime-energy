"use client";

import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { SectionLabel } from "@/components/section-label";
import { products } from "@/lib/content";
import { useDragScroll } from "@/lib/use-drag-scroll";

export function Flavors() {
  const scroller = useDragScroll<HTMLDivElement>();

  function scrollFlavors(direction: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article");
    const distance = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  return (
    <section id="flavors" className="bg-ink">
      <div className="flex w-full flex-col gap-8 px-4 py-12 sm:px-8 lg:gap-10 lg:px-16 lg:py-24">
        <SectionLabel>01 / CHOOSE YOUR FREQUENCY</SectionLabel>
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="w-full font-display text-[48px] leading-[0.94] font-extrabold text-paper sm:text-[64px] lg:w-[680px] lg:text-[88px]">
            DIFFERENT TASTE
            <br />
            SAME INTENSITY
          </h2>
          <div className="flex w-full flex-col items-start gap-6 lg:w-[340px] lg:items-end">
            <p className="w-full text-[14px] leading-[1.65] text-mist">
              Four distinct personalities. One uncompromising formula. Find the one
              that hits different.
            </p>
            <div className="hidden gap-[10px] lg:flex">
              <button
                type="button"
                aria-label="Previous flavor"
                onClick={() => scrollFlavors(-1)}
                className="flex size-11 items-center justify-center border border-line"
              >
                <Icon src="/icons/arrow-left.svg" width={20} height={20} />
              </button>
              <button
                type="button"
                aria-label="Next flavor"
                onClick={() => scrollFlavors(1)}
                className="flex size-11 items-center justify-center border border-mist"
              >
                <Icon src="/icons/arrow-right.svg" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={scroller}
          className="drag-scroll flavor-scroller flex gap-5 overflow-x-auto"
        >
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
        <div className="flex gap-2" aria-hidden="true">
          <div className="h-[2px] w-20 bg-lime sm:w-[310px]" />
          <div className="h-[2px] min-w-0 flex-1 bg-line" />
        </div>
      </div>
    </section>
  );
}
