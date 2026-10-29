"use client";

import { useEffect, useRef } from "react";

const interactive = "button, a, input, select, textarea, label";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const previousTouchAction = el.style.touchAction;
    el.style.touchAction = "none";

    let tracking = false;
    let dragging = false;
    let pointerId = -1;
    let startX = 0;
    let startY = 0;
    let startScrollX = 0;
    let startScrollY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocityX = 0;
    let velocityY = 0;
    let suppressClick = false;
    let frame = 0;
    let target: HTMLElement = el;

    const childFrom = (node: EventTarget | null) => {
      if (!(node instanceof Node) || !el.contains(node)) return el;
      let current: Node | null = node;
      while (current && current !== el) {
        if (current.parentElement === el && current instanceof HTMLElement) return current;
        current = current.parentElement;
      }
      return el;
    };

    const finishSpring = (remainX: number, remainY: number) => {
      target.style.transition = "none";
      target.style.transform = `translate3d(${remainX}px, ${remainY}px, 0)`;
      requestAnimationFrame(() => {
        target.classList.remove("is-drag-target");
        target.style.transition = "transform 340ms cubic-bezier(0.22, 1, 0.36, 1)";
        target.style.transform = "translate3d(0,0,0)";
      });
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as Element | null)?.closest(interactive)) return;
      tracking = true;
      dragging = false;
      pointerId = event.pointerId;
      startX = lastX = event.clientX;
      startY = lastY = event.clientY;
      startScrollX = el.scrollLeft;
      startScrollY = el.scrollTop;
      lastTime = performance.now();
      velocityX = 0;
      velocityY = 0;
      cancelAnimationFrame(frame);
      target = childFrom(event.target);
    };

    const onMove = (event: PointerEvent) => {
      if (!tracking || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        dragging = true;
        el.classList.add("is-dragging");
        target.classList.add("is-drag-target");
        target.style.transition = "none";
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          /* The pointer can already be gone. */
        }
      }
      event.preventDefault();
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityX = (event.clientX - lastX) / dt;
        velocityY = (event.clientY - lastY) / dt;
      }
      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
      target.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };

    const onUp = (event: PointerEvent) => {
      if (!tracking || event.pointerId !== pointerId) return;
      const didDrag = dragging;
      const dx = lastX - startX;
      const dy = lastY - startY;
      tracking = false;
      dragging = false;
      el.classList.remove("is-dragging");
      if (!didDrag) return;
      suppressClick = true;

      const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
      const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
      const nextX = Math.min(maxX, Math.max(0, startScrollX - dx));
      const nextY = Math.min(maxY, Math.max(0, startScrollY - dy));
      el.scrollLeft = nextX;
      el.scrollTop = nextY;
      const remainX = dx - (startScrollX - nextX);
      const remainY = dy - (startScrollY - nextY);
      finishSpring(remainX, remainY);

      let speedX = -velocityX * 16;
      let speedY = -velocityY * 16;
      const glide = () => {
        let moving = false;
        if (Math.abs(speedX) >= 0.4 && Math.abs(remainX) < 0.5) {
          const limit = Math.max(0, el.scrollWidth - el.clientWidth);
          const next = el.scrollLeft + speedX;
          if (next > 0 && next < limit) {
            el.scrollLeft = next;
            speedX *= 0.92;
            moving = true;
          }
        }
        if (Math.abs(speedY) >= 0.4 && Math.abs(remainY) < 0.5) {
          const limit = Math.max(0, el.scrollHeight - el.clientHeight);
          const next = el.scrollTop + speedY;
          if (next > 0 && next < limit) {
            el.scrollTop = next;
            speedY *= 0.92;
            moving = true;
          }
        }
        if (moving) frame = requestAnimationFrame(glide);
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
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(frame);
      el.classList.remove("is-dragging");
      el.style.touchAction = previousTouchAction;
      target.classList.remove("is-drag-target");
      target.style.transform = "";
      target.style.transition = "";
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return ref;
}
