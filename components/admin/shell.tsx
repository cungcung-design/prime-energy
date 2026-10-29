"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDragScroll } from "@/lib/use-drag-scroll";

const links = [
  { href: "/admin", label: "Overview", icon: "/icons/admin/layout-dashboard.svg", section: "overview" },
  { href: "/admin/products", label: "Products", icon: "/icons/admin/package.svg", section: "products" },
  { href: "/admin/orders", label: "Orders", icon: "/icons/admin/shopping-bag.svg", section: "orders" },
  { href: "/", label: "Storefront", icon: "/icons/admin/arrow-up-right.svg", section: "store" },
];

function Glyph({ src }: { src: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-[18px] shrink-0 bg-current"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

export function StatusBadge({
  children,
  tone = "quiet",
}: {
  children: ReactNode;
  tone?: "live" | "quiet";
}) {
  return (
    <span
      className={`inline-flex items-center rounded px-[9px] py-1.5 text-[11px] font-medium whitespace-nowrap ${
        tone === "live" ? "bg-[#202915] text-lime" : "bg-[#1a1e19] text-mist"
      }`}
    >
      {children}
    </span>
  );
}

export function AdminShell({ crumb, children }: { crumb: string; children: ReactNode }) {
  const path = usePathname();
  const navScroller = useDragScroll<HTMLElement>();
  const section = path.startsWith("/admin/products")
    ? "products"
    : path.startsWith("/admin/orders")
      ? "orders"
      : path === "/admin"
        ? "overview"
        : "";

  return (
    <div className="min-h-screen bg-ink text-paper lg:flex">
      <aside className="border-b border-line bg-panel lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[228px] lg:shrink-0 lg:flex-col lg:gap-9 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
        <Link href="/admin" className="block px-5 pt-6 lg:px-3 lg:pt-0">
          <p className="font-display text-[38px] leading-none font-extrabold italic">PRIME</p>
          <p className="mt-2.5 font-mono text-[11px] leading-[1.5] text-ash">STORE ADMIN</p>
        </Link>
        <nav ref={navScroller} className="drag-scroll flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:py-0">
          {links.map((link) => {
            const active = link.section === section;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex h-12 shrink-0 items-center gap-3 border p-3 text-sm font-medium ${
                  active ? "border-[#202915] bg-[#202915] text-lime" : "border-transparent text-mist"
                }`}
              >
                <span className={active ? "text-lime" : "text-ash"}>
                  <Glyph src={link.icon} />
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden flex-col gap-3 px-3 lg:flex">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">STORE WORKSPACE</p>
          <p className="text-[11px] leading-[1.6] text-mist">
            Orders and stock are saved in the store database.
          </p>
          <div className="h-px bg-line" />
          <p className="text-xs leading-[1.6] text-mist">PRIME team · Admin</p>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5 xl:px-10">
          <p className="min-w-0 font-mono text-[11px] leading-[1.5] text-ash">PRIME / {crumb}</p>
          <div className="flex items-center gap-3 sm:gap-6">
            <StatusBadge tone="live">Live store</StatusBadge>
            <Link href="/" className="hidden text-[13px] font-medium whitespace-nowrap text-lime sm:inline">
              View storefront ↗
            </Link>
            <span className="grid size-8 place-items-center bg-[#1a1e19] text-[11px]">PT</span>
          </div>
        </header>
        <div className="flex flex-col gap-7 p-5 xl:p-10">{children}</div>
      </div>
    </div>
  );
}

export function PageIntro({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-[32px] leading-[1.1] font-semibold">{title}</h1>
        <p className="mt-2.5 text-sm leading-[1.6] text-mist">{text}</p>
      </div>
      {action}
    </div>
  );
}

export function primaryButton(className = "") {
  return `inline-flex min-h-12 items-center justify-center border border-lime bg-lime px-5 py-[13px] text-[13px] text-ink ${className}`;
}

export function ghostButton(className = "") {
  return `inline-flex min-h-12 items-center justify-center border border-line bg-ink px-5 py-[13px] text-[13px] text-paper ${className}`;
}
