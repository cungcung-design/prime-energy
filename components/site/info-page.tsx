import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import Link from "next/link";
import type { ReactNode } from "react";

export function InfoPage({
  crumb,
  title,
  lede,
  children,
}: {
  crumb: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-16 sm:px-8 lg:px-10 lg:pt-10 xl:px-16">
        <div className="flex flex-col gap-[22px]">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/">HOME</Link>
            {" / "}
            {crumb}
          </p>
          <h1 className="font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:text-[72px]">{title}</h1>
          {lede ? <p className="max-w-[720px] text-[15px] leading-[1.65] text-mist">{lede}</p> : null}
        </div>
        {children}
      </main>
      <ShopFooter />
    </div>
  );
}
