"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { useCart } from "@/lib/cart";
import { catalogFlavors, discoveryPack, type CatalogFlavor } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tab = "all" | "single" | "pack";
type Availability = "all" | "available" | "unavailable";
type Sort = "featured" | "name";

const credentials = [
  "160 MG CAFFEINE",
  "0 G SUGAR",
  "B3 / B6 / B12",
  "10 KCAL PER CAN",
];

export function CatalogPage() {
  const [query, setQuery] = useState("");
  const [flavor, setFlavor] = useState("all");
  const [availability, setAvailability] = useState<Availability>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [tab, setTab] = useState<Tab>("all");
  const [packAdded, setPackAdded] = useState(false);
  const { add } = useCart();
  const [live, setLive] = useState<Record<string, { available: boolean; price: string }>>({});

  useEffect(() => {
    void fetch("/api/products")
      .then((response) => response.json())
      .then((data: { products?: { slug: string; available: boolean; price: number }[] }) => {
        const next: Record<string, { available: boolean; price: string }> = {};
        for (const product of data.products ?? []) {
          next[product.slug] = { available: product.available, price: `$${product.price.toFixed(2)}` };
        }
        setLive(next);
      })
      .catch(() => undefined);
  }, []);

  const catalog = useMemo(
    () =>
      catalogFlavors.map((item) => ({
        ...item,
        available: live[item.slug]?.available ?? item.available,
        price: live[item.slug]?.price ?? item.price,
      })),
    [live],
  );

  const flavors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = catalog.filter((item) => {
      if (tab === "pack") return false;
      if (flavor !== "all" && item.slug !== flavor) return false;
      if (availability === "available" && !item.available) return false;
      if (availability === "unavailable" && item.available) return false;
      if (!needle) return true;
      return [item.name, item.traits, item.description, item.code, item.pack]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    if (sort === "name") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [availability, catalog, flavor, query, sort, tab]);

  const packMatches = useMemo(() => {
    if (tab === "single") return false;
    if (flavor !== "all") return false;
    if (availability === "unavailable" && (live.discovery?.available ?? true)) return false;
    if (availability === "available" && live.discovery && !live.discovery.available) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [discoveryPack.name, discoveryPack.kicker, discoveryPack.description, "discovery pack"]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  }, [availability, flavor, live.discovery, query, tab]);

  const resultCount = flavors.length + (packMatches ? 1 : 0);

  function addPack() {
    if (packAdded || (live.discovery && !live.discovery.available)) return;
    void add("discovery", "Discovery Drop", 1);
    setPackAdded(true);
  }

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:gap-9 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <div className="flex flex-col gap-[22px]">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/">HOME</Link>
            {" / "}
            PRODUCTS
          </p>
          <h1 className="font-display text-[clamp(40px,8vw,88px)] leading-none font-extrabold xl:text-[88px]">
            CHOOSE YOUR FREQUENCY
          </h1>
          <p className="max-w-[720px] text-[14px] leading-[1.65] text-mist">
            Four distinct personalities. One uncompromising formula. Find the one that hits different.
          </p>
        </div>

        <div className="flex flex-col gap-5 border-y border-line py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="flex h-10 w-full items-center gap-2.5 border border-line bg-panel px-4 sm:w-[360px]">
                <Icon src="/icons/search.svg" width={18} height={18} />
                <span className="sr-only">Search flavors, packs, or ingredients</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search flavors, packs, or ingredients"
                  className="w-full bg-transparent font-mono text-[11px] text-paper outline-none placeholder:text-ash"
                />
              </label>
              <FilterSelect
                label="Flavor"
                value={flavor}
                onChange={setFlavor}
                options={[
                  ["all", "Flavor"],
                  ...catalogFlavors.map((item) => [item.slug, item.name] as const),
                ]}
              />
              <FilterSelect
                label="Availability"
                value={availability}
                onChange={(value) => setAvailability(value as Availability)}
                options={[
                  ["all", "Availability"],
                  ["available", "In stock"],
                  ["unavailable", "Unavailable"],
                ]}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] text-ash">Sort</span>
              <FilterSelect
                label="Sort"
                value={sort}
                onChange={(value) => setSort(value as Sort)}
                options={[
                  ["featured", "Featured ↓"],
                  ["name", "Name"],
                ]}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Product categories">
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>
              All products (5)
            </TabButton>
            <TabButton active={tab === "single"} onClick={() => setTab("single")}>
              Single flavors (4)
            </TabButton>
            <TabButton active={tab === "pack"} onClick={() => setTab("pack")}>
              Discovery pack (1)
            </TabButton>
          </div>
        </div>

        {flavors.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {flavors.map((item) => (
              <FlavorCard key={item.slug} flavor={item} />
            ))}
          </div>
        ) : tab !== "pack" ? (
          <p className="font-mono text-[11px] text-ash">NO MATCHES</p>
        ) : null}

        <div className="flex items-center justify-between font-mono text-[11px] text-ash">
          <p>
            {resultCount} {resultCount === 1 ? "RESULT" : "RESULTS"}
          </p>
          <p>END OF RESULTS</p>
        </div>

        {packMatches ? (
          <section id="discovery-pack" className="flex scroll-mt-24 flex-col bg-panel lg:flex-row lg:gap-[44px]">
            <div className="relative h-[240px] w-full sm:h-[300px] lg:h-[330px] lg:w-[560px] lg:shrink-0">
              <Image
                src={discoveryPack.image}
                alt={discoveryPack.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 560px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[18px] px-5 py-8 lg:px-0 lg:py-8 lg:pr-10">
              <p className="font-mono text-[11px] leading-[1.5] text-lime">{discoveryPack.kicker}</p>
              <h2 className="font-display text-[clamp(40px,6vw,54px)] leading-none font-extrabold">
                {discoveryPack.name}
              </h2>
              <p className="max-w-[520px] text-[14px] leading-[1.65] text-mist">{discoveryPack.description}</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="w-[120px]">
                  <p className="font-display text-[34px] leading-none font-extrabold">{live.discovery?.price ?? discoveryPack.price}</p>
                  <p className="font-mono text-[11px] leading-[1.5] text-ash">{discoveryPack.pack}</p>
                </div>
                <button
                  type="button"
                  onClick={addPack}
                  disabled={live.discovery ? !live.discovery.available : false}
                  className="inline-flex h-[54px] flex-1 items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink disabled:opacity-50"
                >
                  {packAdded ? "Added to bag" : "Add discovery pack"}
                  <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <ul className="grid grid-cols-1 gap-4 py-[18px] sm:grid-cols-2 xl:flex xl:items-start xl:justify-between">
          {credentials.map((label) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon src="/icons/zap.svg" width={18} height={18} />
              <span className="font-mono text-[11px] leading-[1.5] text-mist">{label}</span>
            </li>
          ))}
        </ul>
      </main>

      <ShopFooter />
    </div>
  );
}

function FlavorCard({ flavor }: { flavor: CatalogFlavor }) {
  return (
    <article id={flavor.slug} className="flex min-w-0 flex-col scroll-mt-24">
      <div className="relative h-[280px] overflow-hidden sm:h-[320px] xl:h-[350px]">
        <Image
          src={flavor.image}
          alt={flavor.alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 313px"
          className="object-cover"
        />
        <p className="absolute top-4 left-4 font-mono text-[10px]" style={{ color: flavor.accent }}>
          {flavor.code}
        </p>
        {flavor.available ? null : (
          <p className="absolute top-4 right-3 border border-ash bg-ink px-2.5 py-1.5 font-mono text-[10px] text-ash">
            TEMPORARILY UNAVAILABLE
          </p>
        )}
      </div>
      <div className="h-[3px] w-full" style={{ backgroundColor: flavor.accent }} />
      <div className="flex flex-col gap-[13px] pt-5">
        <p className="font-mono text-[9px]" style={{ color: flavor.accent }}>
          {flavor.traits}
        </p>
        <h2 className="font-display text-[35px] leading-none font-extrabold">{flavor.name}</h2>
        <p className="min-h-[60px] text-[13px] leading-[1.65] text-mist">{flavor.description}</p>
        <div className="flex items-start justify-between">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">{flavor.pack}</p>
          <p className="text-[14px] font-semibold">{flavor.price}</p>
        </div>
        <Link
          href={`/products/${flavor.slug}`}
          className="flex h-[54px] items-center justify-between border border-line bg-ink px-5 text-[13px] font-bold"
        >
          View flavor
          <Icon src="/icons/arrow-up-right-18.svg" width={18} height={18} />
        </Link>
      </div>
    </article>
  );
}

function TabButton({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-10 items-center border px-[18px] text-[12px] font-medium ${
        active ? "border-lime bg-lime text-ink" : "border-line bg-panel text-mist"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label className="relative inline-flex h-10 items-center border border-line bg-panel">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none bg-transparent pr-9 pl-4 font-mono text-[11px] text-mist outline-none"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue} className="bg-ink text-paper">
            {optionLabel}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
        <Icon src="/icons/chevron-down.svg" width={16} height={16} />
      </span>
    </label>
  );
}
