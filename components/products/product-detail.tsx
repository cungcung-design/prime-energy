"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { useCart } from "@/lib/cart";
import { catalogFlavors } from "@/lib/catalog";
import { useDragScroll } from "@/lib/use-drag-scroll";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";


const flavorChoices = [
  { slug: "static-lime", label: "Lime" },
  { slug: "solar-peach", label: "Peach" },
  { slug: "night-berry", label: "Berry" },
  { slug: "glacial-rush", label: "Glacial" },
] as const;

const staticLimeGallery = [
  { src: "/images/products/static-lime-hero.png", alt: "Static Lime can on a dark pedestal" },
  { src: "/images/products/static-lime-side.png", alt: "Static Lime can from the side" },
  { src: "/images/products/static-lime-group.png", alt: "Static Lime with the PRIME variety pack" },
];

type Review = {
  id: string;
  initials: string;
  name: string;
  title: string;
  body: string;
  rating: number;
  date: string;
  dateValue: number;
  helpful: number;
};

const starterReviews: Review[] = [
  {
    id: "maya",
    initials: "MC",
    name: "Maya Chen",
    title: "Sharp, clean and perfect for late-night runs",
    body: "Bright lime and a crisp yuzu finish. The 12-pack fits neatly in the fridge, and the cans arrived well protected.",
    rating: 5,
    date: "MARCH 2026",
    dateValue: 202603,
    helpful: 24,
  },
  {
    id: "jordan",
    initials: "JK",
    name: "Jordan Kim",
    title: "Zero sugar, zero compromise on flavor",
    body: "I’ve tried every zero-sugar energy on the market, and Static Lime is the only one that doesn’t feel like a compromise. The yuzu note is subtle, but it makes the whole can feel premium.",
    rating: 4,
    date: "FEBRUARY 2026",
    dateValue: 202602,
    helpful: 18,
  },
  {
    id: "alex",
    initials: "AR",
    name: "Alex Rivera",
    title: "My go-to for long studio nights",
    body: "The citrus is crisp and refreshing when served cold. I like the silver-and-black can design and the easy-to-store 12-pack.",
    rating: 5,
    date: "JANUARY 2026",
    dateValue: 202601,
    helpful: 31,
  },
];

const formula = [
  ["160 MG", "CAFFEINE"],
  ["0 G", "SUGAR"],
  ["B3/6/12", "B VITAMINS"],
  ["10 KCAL", "PER CAN"],
] as const;

type SortMode = "newest" | "highest" | "helpful";
type PackChoice = "single" | "discovery";

function properName(name: string) {
  return name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function ProductDetail({ slug }: { slug: string }) {
  const flavor = catalogFlavors.find((item) => item.slug === slug) ?? catalogFlavors[0];
  const { add, preview } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [imageDragging, setImageDragging] = useState(false);
  const imageSwipe = useRef({ x: 0, y: 0, pointer: -1 });
  const thumbs = useDragScroll<HTMLDivElement>();
  const [pack, setPack] = useState<PackChoice>("single");
  const [qty, setQty] = useState(2);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState(starterReviews);
  const [sort, setSort] = useState<SortMode>("newest");
  const [rating, setRating] = useState("all");
  const [writing, setWriting] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftRating, setDraftRating] = useState(5);
  const [formNote, setFormNote] = useState("Sign in to post a review.");
  const [unitPrice, setUnitPrice] = useState(32);
  const [inStock, setInStock] = useState(flavor.available);

  useEffect(() => {
    void fetch(`/api/products/${flavor.slug}`)
      .then((response) => response.json())
      .then((data: { product?: { price: number; available: boolean }; reviews?: Review[] }) => {
        if (data.product) {
          setUnitPrice(data.product.price);
          setInStock(data.product.available);
        }
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => undefined);
  }, [flavor.slug]);

  const name = properName(flavor.name);
  const gallery =
    flavor.slug === "static-lime"
      ? staticLimeGallery
      : [{ src: flavor.image, alt: flavor.alt }];
  const activeImage = gallery[Math.min(imageIndex, gallery.length - 1)];
  const overlay = `${flavor.code.slice(0, 3)} / ${flavor.traits.replaceAll(" / ", ". ")}.`;
  const total = unitPrice * qty;
  const canCount = qty * 12;

  const visibleReviews = useMemo(() => {
    const filtered = reviews.filter((review) => rating === "all" || String(review.rating) === rating);
    const sorted = [...filtered];
    if (sort === "highest") sorted.sort((a, b) => b.rating - a.rating || b.dateValue - a.dateValue);
    else if (sort === "helpful") sorted.sort((a, b) => b.helpful - a.helpful);
    else sorted.sort((a, b) => b.dateValue - a.dateValue);
    return sorted;
  }, [rating, reviews, sort]);

  function addToCart() {
    if (!inStock || added) return;
    const id = pack === "discovery" ? "discovery" : `${flavor.slug}-pack`;
    const label = pack === "discovery" ? "Discovery Drop" : `${name} packs`;
    add(id, label, qty);
    setAdded(true);
  }

  function markHelpful(id: string) {
    setReviews((current) =>
      current.map((review) => (review.id === id ? { ...review, helpful: review.helpful + 1 } : review)),
    );
    void fetch(`/api/reviews/${id}/helpful`, { method: "POST" });
  }

  function postReview() {
    if (!draftName.trim() || !draftTitle.trim() || !draftBody.trim()) {
      setFormNote("Add your name, a title, and the review.");
      return;
    }
    void fetch(`/api/products/${flavor.slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: draftName, title: draftTitle, body: draftBody, rating: draftRating }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string; reviews?: Review[] };
        if (!response.ok) {
          setFormNote(data.error ?? "Sign in to post a review.");
          return;
        }
        setReviews(data.reviews ?? []);
        setDraftName("");
        setDraftTitle("");
        setDraftBody("");
        setDraftRating(5);
        setFormNote("Review posted.");
        setWriting(false);
        setSort("newest");
      })
      .catch(() => setFormNote("The review could not be posted."));
  }

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:gap-8 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <p className="font-mono text-[11px] leading-[1.5] text-ash">
          <Link href="/">HOME</Link>
          {" / "}
          <Link href="/products">PRODUCTS</Link>
          {" / "}
          {flavor.name}
        </p>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
          <div className="flex w-full flex-col gap-4 lg:w-[624px] lg:shrink-0">
            <div
              className="relative h-[420px] touch-pan-y overflow-hidden sm:h-[520px] lg:h-[640px]"
              onPointerDown={(event) => {
                if (gallery.length < 2) return;
                if ((event.target as Element).closest("button, a")) return;
                imageSwipe.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
                setImageDragging(true);
              }}
              onPointerMove={(event) => {
                if (event.pointerId !== imageSwipe.current.pointer) return;
                const dx = event.clientX - imageSwipe.current.x;
                const dy = event.clientY - imageSwipe.current.y;
                if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDragX(dx);
                }
              }}
              onPointerUp={(event) => {
                if (event.pointerId !== imageSwipe.current.pointer) return;
                const dx = event.clientX - imageSwipe.current.x;
                imageSwipe.current.pointer = -1;
                setImageDragging(false);
                setDragX(0);
                if (dx <= -48) setImageIndex((index) => Math.min(gallery.length - 1, index + 1));
                else if (dx >= 48) setImageIndex((index) => Math.max(0, index - 1));
              }}
              onPointerCancel={() => {
                imageSwipe.current.pointer = -1;
                setImageDragging(false);
                setDragX(0);
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: imageDragging ? "none" : "transform 180ms ease",
                }}
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 624px"
                  className="pointer-events-none object-cover"
                />
              </div>
              <p className="pointer-events-none absolute top-6 left-6 font-mono text-[11px] text-lime">{overlay}</p>
            </div>
            <div ref={thumbs} className="drag-scroll flex touch-pan-y gap-3 overflow-x-auto">
              {gallery.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === imageIndex}
                  onClick={() => setImageIndex(index)}
                  className={
                    index === imageIndex
                      ? "border border-lime p-[3px]"
                      : "size-[90px] overflow-hidden border border-transparent"
                  }
                >
                  <span className={`relative block ${index === imageIndex ? "size-[84px]" : "size-full"}`}>
                    <Image src={image.src} alt="" fill sizes="90px" className="object-cover" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-[22px]">
            <p className="font-mono text-[11px] leading-[1.5] text-lime">{flavor.code}</p>
            <h1 className="font-display text-[clamp(56px,10vw,104px)] leading-none font-extrabold xl:text-[104px]">
              {flavor.name}
            </h1>
            <p className="text-[18px] leading-[1.65]">{flavor.description}</p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-[46px] leading-none font-extrabold">{flavor.price}</p>
              <p className={`font-mono text-[11px] leading-[1.5] ${inStock ? "text-lime" : "text-ash"}`}>
                {inStock ? "● IN STOCK" : "● TEMPORARILY UNAVAILABLE"}
              </p>
            </div>
            <div className="h-px bg-line" />
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[11px] leading-[1.5] text-mist">FLAVOR / {flavor.name}</p>
              <div className="flex flex-wrap gap-2">
                {flavorChoices.map((choice) => {
                  const selected = choice.slug === flavor.slug;
                  const accent = catalogFlavors.find((item) => item.slug === choice.slug)?.accent ?? "#f2f3ed";
                  return (
                    <Link
                      key={choice.slug}
                      href={`/products/${choice.slug}`}
                      aria-current={selected ? "page" : undefined}
                      className={`inline-flex h-10 items-center border px-4 text-[12px] ${
                        selected ? "border-lime bg-panel text-lime" : "border-line bg-ink"
                      }`}
                      style={selected ? undefined : { color: accent }}
                    >
                      {choice.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[11px] leading-[1.5] text-mist">CHOOSE YOUR PACK</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <PackOption
                  selected={pack === "single"}
                  title={`12-pack / ${name}`}
                  detail={`${flavor.pack} / ${flavor.price}`}
                  onClick={() => {
                    setPack("single");
                    setAdded(false);
                  }}
                />
                <PackOption
                  selected={pack === "discovery"}
                  title="12-pack / Discovery"
                  detail="3 OF EACH FLAVOR / $32.00"
                  onClick={() => {
                    setPack("discovery");
                    setAdded(false);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 items-center gap-1 border border-line px-1">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-[17px] text-mist"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    setQty((value) => Math.max(1, value - 1));
                    setAdded(false);
                  }}
                >
                  −
                </button>
                <span className="font-mono text-[12px]">{qty}</span>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-[17px] text-mist"
                  aria-label="Increase quantity"
                  onClick={() => {
                    setQty((value) => Math.min(12, value + 1));
                    setAdded(false);
                  }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={!inStock}
                onClick={addToCart}
                className="inline-flex h-[54px] flex-1 items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink disabled:border-line disabled:bg-ink disabled:text-ash"
              >
                {inStock ? (added ? "Added to cart" : `Add to Cart — ${money(total)}`) : "Temporarily unavailable"}
                <Icon
                  src={inStock ? "/icons/arrow-up-right-dark-18.svg" : "/icons/arrow-up-right-18.svg"}
                  width={18}
                  height={18}
                />
              </button>
            </div>
            <p className="text-[12px] leading-[1.65] text-mist">
              One-time purchase · {qty} {qty === 1 ? "pack" : "packs"} / {canCount} cans. Free standard delivery on
              orders $64+. Ships within 1–2 business days.
            </p>
            <div id="cart-preview" className="flex items-center gap-3 border border-line bg-panel p-3.5">
              <Icon src="/icons/check-circle.svg" width={18} height={18} />
              <p className="text-[12px] leading-[1.5] text-mist">
                {preview}{" "}
                <Link href="/cart" className="text-lime">
                  View Cart →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <section className="flex flex-col gap-5 bg-paper p-6 text-ink lg:flex-row lg:gap-11 lg:p-8">
          <div className="flex w-full flex-col gap-[18px] lg:w-[410px] lg:shrink-0">
            <p className="font-mono text-[10px]">THE FORMULA / NOTHING HOLDING YOU BACK</p>
            <h2 className="font-display text-[clamp(40px,6vw,56px)] leading-none font-extrabold">
              CLEAN INPUT
              <br />
              MAXIMUM OUTPUT
            </h2>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-[22px]">
              {formula.map(([value, label]) => (
                <div key={label} className="flex flex-col gap-2">
                  <p className="font-display text-[38px] leading-none font-extrabold">{value}</p>
                  <p className="font-mono text-[10px] text-line">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] leading-[1.65] text-line">
              Essential B vitamins to support normal energy metabolism. Full-throttle flavor. No sugar in the equation.
            </p>
            <p className="font-mono text-[9px] leading-[1.6] text-line">
              HIGH CAFFEINE CONTENT (48 MG/100 ML). NOT RECOMMENDED FOR CHILDREN, PREGNANT OR BREASTFEEDING WOMEN.
              ENJOY RESPONSIBLY.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex max-w-[620px] flex-col gap-2.5">
              <p className="font-mono text-[11px] leading-[1.5] text-lime">06 / CUSTOMER REVIEWS</p>
              <h2 className="font-display text-[clamp(40px,7vw,72px)] leading-none font-extrabold">
                WHAT THE COLLECTIVE SAYS
              </h2>
              <p className="text-[14px] leading-[1.65] text-mist">
                Illustrative customer reviews for {name}. Sort by relevance, newest or highest rated.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 border border-line bg-panel p-4 xl:w-[320px]">
              <p className="font-mono text-[10px] leading-[1.5] text-ash">WRITE A REVIEW</p>
              <p className="font-display text-[28px] leading-none font-extrabold">Share your {name} review</p>
              <p className="text-[13px] leading-[1.5] text-mist">
                Tell us how it fuels your sessions, your runs and your late-night work.
              </p>
              <button
                type="button"
                onClick={() => setWriting((open) => !open)}
                className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink"
              >
                Write a review
                <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
              </button>
              {writing ? (
                <form
                  className="flex flex-col gap-2.5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    postReview();
                  }}
                >
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Name"
                    className="h-10 border border-line bg-ink px-3 text-[13px] outline-none"
                  />
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder="Title"
                    className="h-10 border border-line bg-ink px-3 text-[13px] outline-none"
                  />
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    placeholder="Review"
                    rows={4}
                    className="border border-line bg-ink px-3 py-2 text-[13px] outline-none"
                  />
                  <label className="flex items-center justify-between font-mono text-[10px] text-mist">
                    RATING
                    <select
                      value={draftRating}
                      onChange={(event) => setDraftRating(Number(event.target.value))}
                      className="h-8 border border-line bg-ink px-2 text-paper"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="h-10 border border-line text-[13px] font-bold">
                    Post review
                  </button>
                  {formNote ? <p className="text-[12px] text-mist">{formNote}</p> : null}
                </form>
              ) : formNote ? (
                <p className="text-[12px] text-mist">{formNote}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-8 xl:flex-row">
            <aside className="flex w-full flex-col gap-5 border border-line bg-panel p-6 xl:w-[360px] xl:shrink-0">
              <div className="flex flex-col gap-2">
                <p className="font-display text-[72px] leading-none font-extrabold">4.8</p>
                <p className="font-mono text-[10px] text-lime">AVERAGE RATING</p>
              </div>
              <div className="flex flex-col gap-3 font-mono text-[10px]">
                {[
                  ["5 STAR", "82%"],
                  ["4 STAR", "14%"],
                  ["3 STAR", "4%"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-mist">{label}</span>
                    <span className="text-lime">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[10px] text-ash">TOTAL REVIEWS</p>
                <p className="font-display text-[28px] leading-none font-extrabold">
                  {128 + Math.max(0, reviews.length - starterReviews.length)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["CITRUS", "ZERO SUGAR", "NIGHT SESSIONS"].map((tag) => (
                  <span key={tag} className="inline-flex h-8 items-center border border-line bg-ink px-3 font-mono text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <SortButton active={sort === "newest"} onClick={() => setSort("newest")}>
                    NEWEST
                  </SortButton>
                  <SortButton active={sort === "highest"} onClick={() => setSort("highest")}>
                    HIGHEST RATED
                  </SortButton>
                  <SortButton active={sort === "helpful"} onClick={() => setSort("helpful")}>
                    MOST HELPFUL
                  </SortButton>
                </div>
                <label className="font-mono text-[10px] text-ash">
                  <span className="sr-only">Filter by rating</span>
                  <select
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    className="h-10 border border-line bg-ink px-3 font-mono text-[10px] text-ash"
                  >
                    <option value="all">FILTER BY RATING</option>
                    <option value="5">5 STAR</option>
                    <option value="4">4 STAR</option>
                    <option value="3">3 STAR</option>
                  </select>
                </label>
              </div>
              {visibleReviews.length === 0 ? (
                <p className="font-mono text-[11px] text-ash">NO REVIEWS AT THIS RATING</p>
              ) : (
                visibleReviews.map((review) => (
                  <article key={review.id} className="flex flex-col gap-4 border border-line bg-panel p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-10 items-center justify-center rounded-[20px] border border-line bg-ink font-display text-[16px] font-extrabold">
                          {review.initials}
                        </span>
                        <span className="flex flex-col gap-1">
                          <span className="font-display text-[20px] leading-none font-bold">{review.name}</span>
                          <span className="font-mono text-[10px] text-lime">VERIFIED BUYER</span>
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5">
                        <span className="font-display text-[18px] font-extrabold">{review.rating}</span>
                        <span className="font-mono text-[10px] text-mist">/ 5</span>
                      </p>
                    </div>
                    <h3 className="font-display text-[28px] leading-none font-extrabold">{review.title}</h3>
                    <p className="text-[14px] leading-[1.65] text-mist">{review.body}</p>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <p className="text-ash">{review.date}</p>
                      <button type="button" className="text-lime" onClick={() => markHelpful(review.id)}>
                        {review.helpful} HELPFUL
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 text-[13px] font-medium text-lime sm:flex-row sm:items-center sm:justify-between">
          <Link href="/products">← Back to Products</Link>
          <Link href="/#support">Shipping & returns ↗</Link>
        </div>
      </main>
      <ShopFooter />
    </div>
  );
}

function PackOption({
  selected,
  title,
  detail,
  onClick,
}: {
  selected: boolean;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-2 border bg-panel p-4 text-left ${
        selected ? "border-lime" : "border-line"
      }`}
    >
      <span className={`text-[13px] font-semibold ${selected ? "text-lime" : "text-paper"}`}>{title}</span>
      <span className="font-mono text-[11px] leading-[1.5] text-ash">{detail}</span>
    </button>
  );
}

function SortButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-10 items-center border px-3.5 font-mono text-[10px] ${
        active ? "border-lime bg-panel text-lime" : "border-line bg-ink text-mist"
      }`}
    >
      {children}
    </button>
  );
}

