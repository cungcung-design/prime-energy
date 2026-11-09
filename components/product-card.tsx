"use client";

import { Icon } from "@/components/icon";
import type { Product } from "@/lib/content";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

function slugFor(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [note, setNote] = useState("");
  const slug = slugFor(product.name);

  return (
    <article
      className="group relative flex w-[min(320px,82vw)] shrink-0 cursor-pointer flex-col lg:w-auto lg:min-w-0 lg:shrink lg:flex-1"
      style={{ "--card-accent": product.accent } as CSSProperties}
    >
      <div className="relative h-[300px] w-full overflow-hidden bg-panel sm:h-[320px] lg:h-[370px]">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(min-width: 1024px) 313px, 100vw"
          className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] lg:object-cover"
        />
        <p
          className="pointer-events-none absolute top-[18px] left-[18px] font-mono text-[10px]"
          style={{ color: product.accent }}
        >
          {product.code}
        </p>
        <button
          type="button"
          aria-label={`Add ${product.name}`}
          className="absolute right-3 bottom-3 z-20 flex size-11 items-center justify-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: product.accent }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void add(slug, product.name, 1).then((message) => {
              setNote(message || "Added to cart");
            });
          }}
        >
          <Icon src="/icons/plus.svg" width={20} height={20} />
        </button>
      </div>
      <div className="h-[3px] w-full" style={{ backgroundColor: product.accent }} />
      <div className="flex flex-col gap-3 pt-[22px]">
        <p className="font-mono text-[9px]" style={{ color: product.accent }}>
          {product.traits}
        </p>
        <h3 className="font-display text-[28px] leading-none font-bold text-paper transition-colors duration-300 group-hover:text-[var(--card-accent)] lg:text-[35px]">
          <Link href={`/products/${slug}`} prefetch={true} className="after:absolute after:inset-0 after:z-10">
            {product.name}
          </Link>
        </h3>
        <p className="text-[13px] leading-[1.6] text-mist">{product.description}</p>
        <div className="flex items-start justify-between pt-3">
          <p className="font-mono text-[10px] text-ash">{product.pack}</p>
          <p className="text-[13px] font-semibold text-paper">{product.price}</p>
        </div>
        {note ? <p className="text-[12px] text-lime">{note}</p> : null}
      </div>
    </article>
  );
}
