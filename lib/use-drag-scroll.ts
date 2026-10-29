"use client";

import { useEffect, useRef } from "react";

const interactive = "button, a, input, select, textarea, label";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let active = false;
    let pointerId = -1;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let dragged = false;
    let frame = 0;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if ((event.target as Element | null)?.closest(interactive)) return;
      active = true;
      dragged = false;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = el.scrollLeft;
      lastX = event.clientX;
      lastTime = performance.now();
      velocity = 0;
      cancelAnimationFrame(frame);
      el.classList.add("is-dragging");
    };

    const onMove = (event: PointerEvent) => {
      if (!active || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) velocity = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastTime = now;
      el.scrollLeft = startScroll - dx;
    };

    const onUp = (event: PointerEvent) => {
      if (!active || event.pointerId !== pointerId) return;
      active = false;
      el.classList.remove("is-dragging");
      if (!dragged) return;
      let speed = -velocity * 18;
      const glide = () => {
        if (Math.abs(speed) < 0.4) return;
        el.scrollLeft += speed;
        speed *= 0.92;
        frame = requestAnimationFrame(glide);
      };
      frame = requestAnimationFrame(glide);
    };

    const onClick = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      el.classList.remove("is-dragging");
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return ref;
}
