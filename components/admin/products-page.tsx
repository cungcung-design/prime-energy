"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { money } from "@/lib/order";
import { deleteProduct, stockStatus, useAdminData, type ProductStatus } from "@/lib/admin";
import { AdminShell, PageIntro, StatusBadge, ghostButton, primaryButton } from "@/components/admin/shell";

const statuses: Array<"All" | ProductStatus> = ["All", "Available", "Low stock", "Out of stock"];

export function ProductsPage() {
  const { products } = useAdminData();
  const tableScroller = useDragScroll<HTMLDivElement>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [pendingSku, setPendingSku] = useState("PR-NB-12");
  const [kept, setKept] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matches =
        needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle);
      return matches && (status === "All" || stockStatus(product.stock) === status);
    });
  }, [products, query, status]);

  const stock = products.reduce((sum, product) => sum + product.stock, 0);
  const pending = products.find((product) => product.sku === pendingSku) ?? products[0];

  function removeProduct() {
    if (!pending) return;
    const removed = pending.sku;
    void deleteProduct(removed).then(() => {
      setPendingSku(products.find((product) => product.sku !== removed)?.sku ?? "");
      setKept(false);
    });
  }

  return (
    <AdminShell crumb="PRODUCTS">
      <PageIntro
        title="Products"
        text="Five products. One simple place to manage the lineup."
        action={
          <Link href="/admin/products/new" className={primaryButton()}>
            + Add product
          </Link>
        }
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-[46px] w-full items-center gap-2 border border-line bg-panel px-3.5 lg:w-[400px]">
          <span className="text-[13px] text-ash" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product name or SKU"
            className="w-full bg-transparent text-[13px] text-paper outline-none placeholder:text-ash"
          />
        </label>
        <label className={ghostButton("relative")}>
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
            className="appearance-none bg-transparent pr-6 outline-none"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                Status: {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-lime">⌄</span>
        </label>
        <p className="font-mono text-[11px] leading-[1.5] text-ash">{filtered.length} PRODUCTS</p>
      </div>
      <div ref={tableScroller} className="drag-scroll touch-pan-y overflow-x-auto border border-line">
        <div className="min-w-[980px]">
          <div className="flex h-[46px] items-start gap-5 bg-[#1a1e19] px-5 pt-4 text-[11px] text-ash">
            <p className="w-[370px]">Product</p>
            <p className="w-[160px]">Status</p>
            <p className="w-[100px]">Price</p>
            <p className="w-[140px]">Available stock</p>
            <p className="w-[180px]">Actions</p>
          </div>
          {filtered.length === 0 ? (
            <p className="bg-panel px-5 py-6 text-sm text-mist">No products match this view.</p>
          ) : (
            filtered.map((product) => {
              const itemStatus = stockStatus(product.stock);
              return (
                <div
                  key={product.sku}
                  className="flex min-h-[104px] items-center gap-5 border-b border-line bg-panel p-5"
                >
                  <div className="flex w-[370px] items-center gap-4">
                    <div className="relative h-[66px] w-14 shrink-0 bg-ink">
                      {product.image.startsWith("/") ? (
                        <Image src={product.image} alt="" fill sizes="56px" className="object-cover" />
                      ) : product.image ? (
                        <img src={product.image} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] leading-[1.1] font-semibold">{product.name}</p>
                      <p className="mt-1.5 font-mono text-[11px] leading-[1.5] text-ash">{product.sku}</p>
                      <p className="text-[11px] leading-[1.6] text-ash">{product.detail}</p>
                    </div>
                  </div>
                  <div className="w-[160px]">
                    <StatusBadge tone={itemStatus === "Out of stock" ? "quiet" : "live"}>{itemStatus}</StatusBadge>
                  </div>
                  <p className="w-[100px] text-[13px]">{money(product.price)}</p>
                  <div className="w-[140px]">
                    <p className={`text-sm ${itemStatus === "Low stock" ? "text-lime" : "text-paper"}`}>
                      {product.stock} packs
                    </p>
                    <p className="mt-1 text-[10px] leading-[1.6] text-ash">Mock stock</p>
                  </div>
                  <div className="flex w-[180px] gap-5">
                    <Link href={`/admin/products/${product.sku}`} className="text-[13px] font-medium text-lime">
                      Edit ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingSku(product.sku);
                        setKept(false);
                      }}
                      className="text-xs text-mist"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-xs leading-[1.6] text-mist">
          Showing {filtered.length} of {products.length} · {stock} packs available
        </p>
        <Link href={products[0] ? `/admin/products/${products[0].sku}` : "/admin/products/new"} className="text-[13px] font-medium text-lime">
          Edit / Add product → Product Editor
        </Link>
      </div>
      <section className="flex flex-col gap-5 border border-line bg-panel p-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">DELETE CONFIRMATION / PREVIEW</p>
          <h2 className="mt-2.5 text-lg leading-[1.1] font-semibold">
            {pending ? `Delete ${pending.name}?` : "Nothing left to delete"}
          </h2>
          <p className="mt-2.5 text-xs leading-[1.6] text-mist">
            {kept
              ? `${pending?.name ?? "This product"} stays in the catalog.`
              : "Remove this product from the catalog? Existing order history stays unchanged. Nothing is deleted until you confirm."}
          </p>
        </div>
        <button
          type="button"
          className={ghostButton()}
          onClick={() => setKept(true)}
          disabled={!pending}
        >
          Keep product
        </button>
        <button
          type="button"
          disabled={!pending}
          onClick={removeProduct}
          className="inline-flex min-h-12 items-center justify-center border border-[#ff9a8c] bg-[#ff9a8c] px-5 py-[13px] text-[13px] text-ink disabled:opacity-40"
        >
          Delete product
        </button>
      </section>
      <p className="text-[11px] leading-[1.6] text-ash">
        Prices, stock, and SKUs are stored with each product. Inventory is edited inside Product Editor; there is no separate
        inventory route.
      </p>
    </AdminShell>
  );
}
