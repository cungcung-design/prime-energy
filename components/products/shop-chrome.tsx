"use client";

import { Icon } from "@/components/icon";
import { useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { navLinks } from "@/lib/content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const supportPaths = ["/support", "/shipping", "/faq", "/contact"];

function current(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/support") return supportPaths.some((path) => pathname === path);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ShopHeader({
  cartHref = "/cart",
  accountIcon = true,
  className = "",
}: {
  cartHref?: string;
  accountIcon?: boolean;
  className?: string;
}) {
  const { count } = useCart();
  const { account, ready, signOut } = useAccount();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuSwipe = useRef<{ x: number; y: number } | null>(null);
  const accountLabel = ready && account ? account.firstName : "Account";

  return (
    <header className={`relative z-30 w-full border-b border-line lg:z-20 lg:mx-auto lg:max-w-[1440px] ${className}`}>
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:h-[104px] lg:px-16">
        <Link href="/" className="inline-flex items-center font-display text-[32px] leading-none font-extrabold italic lg:text-[40px]">
          PRIME
        </Link>
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-[14px] font-medium whitespace-nowrap ${current(link.href, pathname) ? "text-lime" : ""}`} aria-current={current(link.href, pathname) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="relative hidden lg:block">
            <button
              type="button"
              className="inline-flex items-center gap-6 text-[14px] font-bold"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
            >
              {accountLabel}
              {accountIcon ? <Icon src="/icons/user-round.svg" width={18} height={18} /> : null}
            </button>
            {accountOpen ? (
              <div role="menu" className="absolute right-0 top-full z-40 mt-3 flex w-52 flex-col border border-line bg-ink py-2">
                {account ? (
                  <>
                    <Link href="/account" role="menuitem" className="px-4 py-2 text-[13px]" onClick={() => setAccountOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/account?tab=orders" role="menuitem" className="px-4 py-2 text-[13px]" onClick={() => setAccountOpen(false)}>
                      Orders
                    </Link>
                    {account.role === "admin" ? (
                      <Link href="/admin" role="menuitem" className="px-4 py-2 text-[13px]" onClick={() => setAccountOpen(false)}>
                        Store admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      role="menuitem"
                      className="px-4 py-2 text-left text-[13px]"
                      onClick={() => {
                        setAccountOpen(false);
                        signOut();
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" role="menuitem" className="px-4 py-2 text-[13px]" onClick={() => setAccountOpen(false)}>
                      Sign in
                    </Link>
                    <Link href="/sign-up" role="menuitem" className="px-4 py-2 text-[13px]" onClick={() => setAccountOpen(false)}>
                      Create account
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
          <Link href={cartHref} className="inline-flex items-center gap-6 text-[14px] font-bold" aria-label={`Cart, ${count} items`}>
            <span className="hidden lg:inline">Cart</span>
            <span className="relative">
              <Icon src="/icons/shopping-bag.svg" width={20} height={20} />
              <span className="absolute -top-2 left-4 font-mono text-[11px] font-normal leading-none text-lime">{count}</span>
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="product-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="flex w-4 flex-col gap-[5px]" aria-hidden="true">
              <span className="h-px w-full bg-paper" />
              <span className="h-px w-full bg-paper" />
              <span className="h-px w-full bg-paper" />
            </span>
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav
          id="product-menu"
          className="absolute inset-x-0 top-full z-30 flex touch-pan-y flex-col border-b border-line bg-ink px-4 py-3 lg:hidden"
          aria-label="Mobile"
          onPointerDown={(event) => {
            menuSwipe.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = menuSwipe.current;
            if (!start) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            menuSwipe.current = null;
            if (dy > 56 && dy > Math.abs(dx)) setMenuOpen(false);
          }}
          onPointerCancel={() => {
            menuSwipe.current = null;
          }}
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center text-[14px] font-medium" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/shipping" className="flex min-h-11 items-center text-[14px]" onClick={() => setMenuOpen(false)}>
            Shipping & returns
          </Link>
          <Link href="/faq" className="flex min-h-11 items-center text-[14px]" onClick={() => setMenuOpen(false)}>
            FAQs
          </Link>
          <Link href="/contact" className="flex min-h-11 items-center text-[14px]" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link href={account ? "/account" : "/sign-in"} className="flex min-h-11 items-center gap-[7px] text-[14px]" onClick={() => setMenuOpen(false)}>
            {accountIcon ? <Icon src="/icons/user-round.svg" width={18} height={18} /> : null}
            {account ? "Account" : "Sign in"}
          </Link>
          <Link href={cartHref} className="flex min-h-11 items-center text-[14px]" onClick={() => setMenuOpen(false)}>
            Cart ({count})
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

export function ShopFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 pt-10 pb-7 sm:px-8 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-4 text-mist sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px]">Leave ordinary behind</p>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-[12px]">
            <Link href="/products">Shop all flavors</Link>
            <Link href="/about">About</Link>
            <Link href="/formula">Formula</Link>
            <Link href="/shipping">Shipping & returns</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/contact">Contact us</Link>
          </div>
        </div>
        <p className="font-display text-[clamp(32px,6vw,64px)] leading-none font-extrabold">
          GOOD ENERGY BAD INFLUENCE
        </p>
        <div className="h-px bg-line" />
        <div className="flex flex-col gap-3 font-mono text-[11px] leading-[1.5] sm:flex-row sm:items-start sm:justify-between">
          <p className="text-ash">© 2026 PRIME ENERGY. ALL RIGHTS RESERVED.</p>
          <p className="text-ash">
            <Link href="/privacy">PRIVACY POLICY</Link>
            {" / "}
            <Link href="/terms">TERMS OF USE</Link>
          </p>
          <p className="text-mist">UNITED STATES / USD ↓</p>
        </div>
      </div>
    </footer>
  );
}
