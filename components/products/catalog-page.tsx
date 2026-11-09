"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { useCart } from "@/lib/cart";
import { catalogFlavors, discoveryPack, type CatalogFlavor } from "@/lib/catalog";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

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
          <h1 className="font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:text-[72px]">
            DIFFERENT TASTE
            <br />
            <span className="text-lime italic">SAME INTENSITY</span>
          </h1>
        </div>

        <div className="flex flex-col gap-3 border-y border-line py-5">
          <label className="flex h-12 w-full items-center gap-3 border border-line bg-panel px-4">
            <Icon src="/icons/search.svg" width={18} height={18} />
            <span className="sr-only">Search flavors, packs, or ingredients</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search flavors, packs, or ingredients"
              className="w-full bg-transparent font-mono text-[12px] text-paper outline-none placeholder:text-ash"
            />
          </label>
          <div
            className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Product categories"
          >
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>
              All
              <span className="font-mono text-[10px] opacity-70">5</span>
            </TabButton>
            <TabButton active={tab === "single"} onClick={() => setTab("single")}>
              Flavors
              <span className="font-mono text-[10px] opacity-70">4</span>
            </TabButton>
            <TabButton active={tab === "pack"} onClick={() => setTab("pack")}>
              Pack
              <span className="font-mono text-[10px] opacity-70">1</span>
            </TabButton>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <FilterSelect
              label="Flavor"
              value={flavor}
              onChange={setFlavor}
              options={[
                ["all", "All flavors"],
                ...catalogFlavors.map((item) => [item.slug, item.name] as const),
              ]}
            />
            <FilterSelect
              label="Availability"
              value={availability}
              onChange={(value) => setAvailability(value as Availability)}
              options={[
                ["all", "Any stock"],
                ["available", "In stock"],
                ["unavailable", "Unavailable"],
              ]}
            />
            <div className="col-span-2 lg:col-span-1">
              <FilterSelect
                label="Sort"
                value={sort}
                onChange={(value) => setSort(value as Sort)}
                options={[
                  ["featured", "Sort: Featured"],
                  ["name", "Sort: Name"],
                ]}
              />
            </div>
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
            <div className="relative h-[300px] w-full sm:h-[320px] lg:h-[330px] lg:w-[560px] lg:shrink-0">
              <Image
                src={discoveryPack.image}
                alt={discoveryPack.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 560px"
                className="object-contain object-center lg:object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-[18px] px-5 py-8 lg:px-0 lg:py-8 lg:pr-10">
              <p className="font-mono text-[11px] leading-[1.5] text-lime">{discoveryPack.kicker}</p>
              <h2 className="font-display text-[40px] leading-[0.9] font-extrabold sm:text-[56px] lg:text-[72px]">
                FIND YOUR
                <br />
                <span className="text-lime italic">FIRST OBSESSION</span>
              </h2>
              <p className="max-w-[520px] text-[15px] leading-[1.65] text-mist">{discoveryPack.description}</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="w-[120px]">
                  <p className="font-display text-[34px] leading-none font-extrabold">{live.discovery?.price ?? discoveryPack.price}</p>
                  <p className="font-mono text-[11px] leading-[1.5] text-ash">{discoveryPack.pack}</p>
                </div>
                <button
                  type="button"
                  onClick={addPack}
                  disabled={live.discovery ? !live.discovery.available : false}
                  className="inline-flex h-[54px] flex-1 items-center justify-between border border-lime bg-lime px-5 text-[12px] font-bold text-ink disabled:opacity-50"
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
    <article
      id={flavor.slug}
      className="group relative flex min-w-0 cursor-pointer flex-col scroll-mt-24"
      style={{ "--card-accent": flavor.accent } as CSSProperties}
    >
      <div className="relative h-[300px] overflow-hidden sm:h-[320px] xl:h-[350px]">
        <Image
          src={flavor.image}
          alt={flavor.alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 313px"
          className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] xl:object-cover"
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
        <h2 className="font-display text-[28px] leading-none font-bold text-paper transition-colors duration-300 group-hover:text-[var(--card-accent)] lg:text-[35px]">
          <Link href={`/products/${flavor.slug}`} prefetch={true} className="after:absolute after:inset-0 after:z-10">
            {flavor.name}
          </Link>
        </h2>
        <p className="min-h-[60px] text-[13px] leading-[1.6] text-mist">{flavor.description}</p>
        <div className="flex items-start justify-between">
          <p className="font-mono text-[10px] text-ash">{flavor.pack}</p>
          <p className="text-[13px] font-semibold text-paper">{flavor.price}</p>
        </div>
        <Link
          href={`/products/${flavor.slug}`}
          prefetch={true}
          className="relative z-20 flex h-[54px] items-center justify-between border border-line bg-ink px-5 text-[12px] font-bold transition-colors duration-300 group-hover:border-[var(--card-accent)]"
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
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 border px-4 text-[13px] font-medium ${
        active ? "border-lime bg-lime text-ink" : "border-line bg-panel text-paper"
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
    <label className="relative flex h-11 w-full min-w-0 flex-1 items-center border border-line bg-panel lg:h-10 lg:w-auto lg:flex-none">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none bg-transparent pr-9 pl-4 font-mono text-[11px] text-mist outline-none lg:h-10"
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
