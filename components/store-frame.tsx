"use client";

import { DesktopFrame } from "@/components/desktop-frame";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function StoreFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;
  return <DesktopFrame>{children}</DesktopFrame>;
}
