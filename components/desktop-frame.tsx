"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function DesktopFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fit = () => {
      const width = document.documentElement.clientWidth;
      if (width < 1024) {
        frame.style.zoom = "1";
        frame.style.width = "100%";
        return;
      }
      frame.style.width = "1440px";
      frame.style.zoom = String(Math.min(1, width / 1440));
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="desktop-viewport">
      <div ref={frameRef} className="desktop-frame">
        {children}
      </div>
    </div>
  );
}
