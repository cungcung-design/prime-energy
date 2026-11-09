"use client";

import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { SectionLabel } from "@/components/section-label";
import { products } from "@/lib/content";
import { useEffect, useRef } from "react";

const interactive = "button, input, select, textarea, label, a";

function useHorizontalCarousel<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let tracking = false;
    let dragging = false;
    let pointerId = -1;
    let startX = 0;
    let startY = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let suppressClick = false;
    let frame = 0;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as Element | null)?.closest(interactive)) return;
      tracking = true;
      dragging = false;
      pointerId = event.pointerId;
      startX = lastX = event.clientX;
      startY = event.clientY;
      startScroll = el.scrollLeft;
      lastTime = performance.now();
      velocity = 0;
    };

    const onMove = (event: PointerEvent) => {
      if (!tracking || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        // Let the browser keep vertical page scrolling.
        if (Math.abs(dy) >= Math.abs(dx)) {
          tracking = false;
          return;
        }
        dragging = true;
        el.classList.add("is-dragging");
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          /* The pointer can already be gone. */
        }
      }
      event.preventDefault();
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastTime = now;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollLeft = Math.min(max, Math.max(0, startScroll - dx));
    };

    const onUp = (event: PointerEvent) => {
      if (!tracking && !dragging) return;
      if (event.pointerId !== pointerId) return;
      const didDrag = dragging;
      tracking = false;
      dragging = false;
      el.classList.remove("is-dragging");
      if (!didDrag) return;
      suppressClick = true;
      const card = el.querySelector("article");
      const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + gap;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      if (step <= 0 || max <= 0) return;
      const delta = el.scrollLeft - startScroll;
      let index = Math.round(startScroll / step);
      if (delta > step * 0.18 || velocity < -0.45) index += 1;
      else if (delta < -step * 0.18 || velocity > 0.45) index -= 1;
      const maxIndex = Math.round(max / step);
      index = Math.min(maxIndex, Math.max(0, index));
      const target = Math.min(max, index * step);
      const current = el.scrollLeft;
      const remaining = target - current;
      const speed = -velocity * 120;
      cancelAnimationFrame(frame);
      const glide = () => {
        const next = current + remaining * 0.18 + speed * 0.18;
        const clamped = Math.min(max, Math.max(0, next));
        el.scrollLeft = clamped;
        if (Math.abs(clamped - target) < 0.6 && Math.abs(speed) < 0.2) {
          el.scrollLeft = target;
          return;
        }
        frame = requestAnimationFrame(glide);
      };
      frame = requestAnimationFrame(glide);
    };

    const onClick = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove, { passive: false });
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("lostpointercapture", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.classList.remove("is-dragging");
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("lostpointercapture", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return ref;
}

export function Flavors() {
  const scroller = useHorizontalCarousel<HTMLDivElement>();

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const media = window.matchMedia("(max-width: 1023px)");

    const fit = () => {
      const slides = el.querySelectorAll("article");
      slides.forEach((slide) => {
        const card = slide as HTMLElement;
        if (!media.matches) {
          card.style.flex = "";
          card.style.width = "";
          card.style.minWidth = "";
          card.style.maxWidth = "";
          return;
        }
        const width = el.clientWidth;
        card.style.flex = `0 0 ${width}px`;
        card.style.width = `${width}px`;
        card.style.minWidth = `${width}px`;
        card.style.maxWidth = `${width}px`;
      });
      el.style.paddingLeft = "";
      el.style.paddingRight = "";
      if (!media.matches) return;
      const width = el.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = width + gap;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const index = step > 0 ? Math.round(el.scrollLeft / step) : 0;
      el.scrollLeft = Math.min(max, Math.max(0, index * step));
    };

    fit();
    media.addEventListener("change", fit);
    window.addEventListener("resize", fit);
    return () => {
      media.removeEventListener("change", fit);
      window.removeEventListener("resize", fit);
    };
  }, [scroller]);

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
          <h2 className="w-full font-display text-[40px] leading-[0.9] font-extrabold text-paper sm:text-[56px] lg:w-[680px] lg:text-[72px]">
            DIFFERENT TASTE
            <br />
            <span className="text-lime italic">SAME INTENSITY</span>
          </h2>
          <div className="flex w-full flex-col items-start gap-6 lg:w-[340px] lg:items-end">
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
          className="drag-scroll flavor-scroller flex gap-5 overflow-x-auto overflow-y-hidden"
        >
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}