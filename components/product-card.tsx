"use client";

import { Icon } from "@/components/icon";
import type { Product } from "@/lib/content";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import { useState } from "react";

function slugFor(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [note, setNote] = useState("");

  return (
    <article className="flex w-[min(320px,82vw)] shrink-0 flex-col lg:w-auto lg:min-w-0 lg:shrink lg:flex-1">
      <div className="relative h-[280px] overflow-hidden bg-panel sm:h-[370px]">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="313px"
          className="object-cover"
        />
        <p
          className="absolute top-[18px] left-[18px] font-mono text-[10px]"
          style={{ color: product.accent }}
        >
          {product.code}
        </p>
        <button
          type="button"
          aria-label={`Add ${product.name}`}
          className="absolute right-3 bottom-3 flex size-11 items-center justify-center"
          style={{ backgroundColor: product.accent }}
          onClick={() => {
            void add(slugFor(product.name), product.name, 1).then((message) => {
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
        <h3 className="font-display text-[35px] leading-none font-bold text-paper">
          {product.name}
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
