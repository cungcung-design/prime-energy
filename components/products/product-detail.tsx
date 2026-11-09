"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { useCart } from "@/lib/cart";
import { catalogFlavors } from "@/lib/catalog";
import { useDragScroll } from "@/lib/use-drag-scroll";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
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

const formula = [
  ["160 mg", "Caffeine"],
  ["0 g", "Sugar"],
  ["B3 / B6 / B12", "Vitamins"],
  ["10 kcal", "Per can"],
] as const;

type SortMode = "newest" | "highest" | "helpful";

function properName(name: string) {
  return name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function ProductDetailRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (typeof slug !== "string" || !catalogFlavors.some((item) => item.slug === slug)) notFound();
  return <ProductDetail slug={slug} />;
}

export function ProductDetail({ slug }: { slug: string }) {
  const flavor = catalogFlavors.find((item) => item.slug === slug) ?? catalogFlavors[0];
  const { add } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [imageDragging, setImageDragging] = useState(false);
  const imageSwipe = useRef({ x: 0, y: 0, pointer: -1, axis: "" as "" | "x" | "y" });
  const thumbs = useDragScroll<HTMLDivElement>();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsReady, setReviewsReady] = useState(false);
  const [sort, setSort] = useState<SortMode>("newest");
  const [rating, setRating] = useState("all");
  const [writing, setWriting] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftRating, setDraftRating] = useState(5);
  const [formNote, setFormNote] = useState("");
  const [unitPrice, setUnitPrice] = useState(32);
  const [inStock, setInStock] = useState(flavor.available);
  const [shownSlug, setShownSlug] = useState(slug);

  if (shownSlug !== slug) {
    setShownSlug(slug);
    setImageIndex(0);
    setDragX(0);
    setImageDragging(false);
    imageSwipe.current = { x: 0, y: 0, pointer: -1, axis: "" };
    setQty(1);
    setAdded(false);
    setReviews([]);
    setReviewsReady(false);
    setSort("newest");
    setRating("all");
    setWriting(false);
    setDraftName("");
    setDraftTitle("");
    setDraftBody("");
    setDraftRating(5);
    setFormNote("");
    setUnitPrice(32);
    setInStock(flavor.available);
  }

  useEffect(() => {
    document.title = `${flavor.name} — PRIME`;
  }, [flavor.name]);

  useEffect(() => {
    let ignore = false;
    void fetch(`/api/products/${flavor.slug}`)
      .then((response) => response.json())
      .then((data: { product?: { price: number; available: boolean }; reviews?: Review[] }) => {
        if (ignore) return;
        if (data.product) {
          setUnitPrice(data.product.price);
          setInStock(data.product.available);
        }
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!ignore) setReviewsReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [flavor.slug]);

  const name = properName(flavor.name);
  const gallery = flavor.slug === "static-lime" ? staticLimeGallery : [{ src: flavor.image, alt: flavor.alt }];
  const activeImage = gallery[Math.min(imageIndex, gallery.length - 1)];
  const total = unitPrice * qty;

  const visibleReviews = useMemo(() => {
    const filtered = reviews.filter((review) => rating === "all" || String(review.rating) === rating);
    const sorted = [...filtered];
    if (sort === "highest") sorted.sort((a, b) => b.rating - a.rating || b.dateValue - a.dateValue);
    else if (sort === "helpful") sorted.sort((a, b) => b.helpful - a.helpful);
    else sorted.sort((a, b) => b.dateValue - a.dateValue);
    return sorted;
  }, [rating, reviews, sort]);

  const average =
    reviews.length === 0 ? null : (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);

  function addToCart() {
    if (!inStock || added) return;
    add(`${flavor.slug}-pack`, `${name} packs`, qty);
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
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 py-6 sm:px-6 sm:py-8 lg:gap-16 lg:px-10 lg:py-10">
        <p className="font-mono text-[11px] text-ash">
          <Link href="/">Home</Link>
          {" / "}
          <Link href="/products">Products</Link>
          {" / "}
          <span className="text-mist">{name}</span>
        </p>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="flex flex-col gap-3 md:sticky md:top-6">
            <div
              className="relative h-[340px] overflow-hidden bg-panel sm:h-[420px] md:h-[480px] lg:h-[560px]"
              style={{ touchAction: gallery.length > 1 ? "pan-y" : undefined }}
              onPointerDown={(event) => {
                if (gallery.length < 2) return;
                if (event.pointerType === "mouse" && event.button !== 0) return;
                if ((event.target as Element).closest("button, a")) return;
                imageSwipe.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId, axis: "" };
                setDragX(0);
              }}
              onPointerMove={(event) => {
                if (event.pointerId !== imageSwipe.current.pointer) return;
                const dx = event.clientX - imageSwipe.current.x;
                const dy = event.clientY - imageSwipe.current.y;
                if (!imageSwipe.current.axis) {
                  if (Math.hypot(dx, dy) < 8) return;
                  imageSwipe.current.axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
                  if (imageSwipe.current.axis === "y") {
                    imageSwipe.current.pointer = -1;
                    return;
                  }
                  setImageDragging(true);
                  try {
                    event.currentTarget.setPointerCapture(event.pointerId);
                  } catch {
                    /* The pointer can already be gone. */
                  }
                }
                if (imageSwipe.current.axis !== "x") return;
                setDragX(dx);
              }}
              onPointerUp={(event) => {
                if (event.pointerId !== imageSwipe.current.pointer && imageSwipe.current.axis !== "x") return;
                const dx = event.clientX - imageSwipe.current.x;
                const horizontal = imageSwipe.current.axis === "x";
                imageSwipe.current.pointer = -1;
                imageSwipe.current.axis = "";
                setImageDragging(false);
                setDragX(0);
                if (!horizontal || Math.abs(dx) < 48) return;
                if (dx < 0) setImageIndex((index) => Math.min(gallery.length - 1, index + 1));
                else setImageIndex((index) => Math.max(0, index - 1));
              }}
              onPointerCancel={() => {
                imageSwipe.current.pointer = -1;
                imageSwipe.current.axis = "";
                setImageDragging(false);
                setDragX(0);
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate3d(${dragX}px, 0, 0)`,
                  transition: imageDragging ? "none" : "transform 220ms ease",
                }}
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                  className="pointer-events-none object-contain object-center"
                />
              </div>
            </div>
            {gallery.length > 1 ? (
              <div ref={thumbs} className="drag-scroll flex gap-2 overflow-x-auto">
                {gallery.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={index === imageIndex}
                    onClick={() => setImageIndex(index)}
                    className={`relative size-16 shrink-0 overflow-hidden border sm:size-[72px] ${
                      index === imageIndex ? "border-lime" : "border-line"
                    }`}
                  >
                    <Image src={image.src} alt="" fill sizes="72px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] text-lime">{flavor.pack}</p>
              <h1 className="font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:text-[72px]">
                {flavor.name}
              </h1>
              <p className="max-w-[36rem] text-[15px] leading-[1.65] text-mist">{flavor.description}</p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <p className="font-display text-[32px] leading-none font-extrabold sm:text-[40px]">{money(unitPrice)}</p>
              <p className={`font-mono text-[11px] ${inStock ? "text-lime" : "text-ash"}`}>
                {inStock ? "In stock" : "Out of stock"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] text-ash">Flavor</p>
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {flavorChoices.map((choice) => {
                  const selected = choice.slug === flavor.slug;
                  const accent = catalogFlavors.find((item) => item.slug === choice.slug)?.accent ?? "#f2f3ed";
                  return (
                    <Link
                      key={choice.slug}
                      href={`/products/${choice.slug}`}
                      scroll={false}
                      prefetch={true}
                      aria-current={selected ? "page" : undefined}
                      className={`inline-flex h-11 shrink-0 items-center gap-2 border px-3 text-[13px] transition-colors duration-200 ${
                        selected ? "border-lime text-paper" : "border-line text-mist hover:border-paper hover:text-paper"
                      }`}
                    >
                      <span className="size-2.5 shrink-0" style={{ backgroundColor: accent }} />
                      {choice.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-stretch gap-2">
              <div className="flex h-12 w-[132px] shrink-0 items-center justify-between border border-line px-1">
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-[18px] text-mist"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    setQty((value) => Math.max(1, value - 1));
                    setAdded(false);
                  }}
                >
                  −
                </button>
                <span className="font-mono text-[13px]">{qty}</span>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center text-[18px] text-mist"
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
                className="inline-flex h-12 min-w-0 flex-1 items-center justify-between gap-3 bg-lime px-4 text-[12px] font-bold text-ink disabled:bg-panel disabled:text-ash"
              >
                <span className="truncate">{inStock ? (added ? "Added" : `Add to cart · ${money(total)}`) : "Out of stock"}</span>
                {inStock ? <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} /> : null}
              </button>
            </div>

            {added ? (
              <p className="text-[13px] text-mist">
                Added to your cart.{" "}
                <Link href="/cart" className="text-lime">
                  View cart
                </Link>
              </p>
            ) : (
              <p className="text-[13px] leading-relaxed text-mist">Free delivery on orders $64+. Ships in 1–2 business days.</p>
            )}

            <dl className="grid grid-cols-2 border border-line sm:grid-cols-4">
              {formula.map(([value, label]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-line px-3 py-3 even:border-l nth-[-n+2]:border-b sm:border-l sm:nth-[-n+2]:border-b-0 sm:first:border-l-0"
                >
                  <dt className="font-mono text-[10px] text-ash">{label}</dt>
                  <dd className="font-display text-[20px] leading-none font-bold sm:text-[22px]">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[12px] leading-relaxed text-ash">
              High caffeine (48 mg/100 ml). Not for children or anyone pregnant. Enjoy responsibly.
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-6 border-t border-line pt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-[28px] leading-none font-bold lg:text-[35px]">Reviews</h2>
              <p className="mt-2 font-mono text-[11px] text-ash">
                {reviewsReady
                  ? average
                    ? `${average} average · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
                    : "No reviews yet"
                  : "Loading reviews"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setWriting((open) => !open)}
                className="inline-flex h-11 items-center justify-center border border-line px-4 text-[13px] font-semibold"
              >
                {writing ? "Close" : "Write a review"}
              </button>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <label className="sr-only" htmlFor="review-sort">
                  Sort reviews
                </label>
                <select
                  id="review-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortMode)}
                  className="h-11 min-w-0 border border-line bg-ink px-3 font-mono text-[11px] text-mist sm:w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rated</option>
                  <option value="helpful">Most helpful</option>
                </select>
                <label className="sr-only" htmlFor="review-rating">
                  Filter by rating
                </label>
                <select
                  id="review-rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="h-11 min-w-0 border border-line bg-ink px-3 font-mono text-[11px] text-mist sm:w-auto"
                >
                  <option value="all">All ratings</option>
                  <option value="5">5 star</option>
                  <option value="4">4 star</option>
                  <option value="3">3 star</option>
                </select>
              </div>
            </div>
          </div>

          {writing ? (
            <form
              className="grid gap-3 border border-line p-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                postReview();
              }}
            >
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Name"
                className="h-11 border border-line bg-ink px-3 text-[14px] outline-none sm:col-span-1"
              />
              <label className="flex h-11 items-center justify-between border border-line px-3 font-mono text-[11px] text-ash">
                Rating
                <select
                  value={draftRating}
                  onChange={(event) => setDraftRating(Number(event.target.value))}
                  className="bg-transparent text-paper outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} / 5
                    </option>
                  ))}
                </select>
              </label>
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Title"
                className="h-11 border border-line bg-ink px-3 text-[14px] outline-none sm:col-span-2"
              />
              <textarea
                value={draftBody}
                onChange={(event) => setDraftBody(event.target.value)}
                placeholder="How was it?"
                rows={4}
                className="border border-line bg-ink px-3 py-2 text-[14px] outline-none sm:col-span-2"
              />
              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-mist">{formNote}</p>
                <button type="submit" className="h-11 bg-lime px-5 text-[13px] font-bold text-ink">
                  Post review
                </button>
              </div>
            </form>
          ) : formNote ? (
            <p className="text-[13px] text-mist">{formNote}</p>
          ) : null}

          {!reviewsReady ? null : visibleReviews.length === 0 ? (
            <p className="font-mono text-[12px] text-ash">No reviews at this rating.</p>
          ) : (
            <div className="flex flex-col">
              {visibleReviews.map((review) => (
                <article key={review.id} className="flex flex-col gap-2 border-t border-line py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[15px] font-semibold">{review.name}</p>
                    <p className="shrink-0 font-mono text-[11px] text-lime">{review.rating} / 5</p>
                  </div>
                  <h3 className="text-[16px] leading-snug font-semibold">{review.title}</h3>
                  <p className="text-[14px] leading-relaxed text-mist">{review.body}</p>
                  <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                    <p className="text-ash">{review.date}</p>
                    <button type="button" className="text-mist" onClick={() => markHelpful(review.id)}>
                      Helpful · {review.helpful}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <ShopFooter />
    </div>
  );
}
