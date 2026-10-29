"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { money } from "@/lib/order";
import { deleteProduct, editorImage, saveProduct, stockStatus, type AdminProduct } from "@/lib/admin";
import { AdminShell, StatusBadge, ghostButton, primaryButton } from "@/components/admin/shell";

const categories = ["Single flavors", "Discovery", "Limited"];

const emptyProduct: AdminProduct = {
  sku: "",
  name: "",
  description: "",
  category: "Single flavors",
  detail: "12 × 330 ml",
  price: 0,
  stock: 0,
  published: false,
  image: "",
};

export function ProductEditor({ sku }: { sku: string }) {
  const router = useRouter();
  const creating = sku === "new";
  const [draft, setDraft] = useState<AdminProduct>(emptyProduct);
  const [priceText, setPriceText] = useState("");
  const [stockText, setStockText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (creating) return;
    void fetch("/api/admin/snapshot")
      .then((response) => response.json())
      .then((data: { products?: AdminProduct[] }) => {
        const current = data.products?.find((product) => product.sku === sku);
        if (!current) {
          setMissing(true);
          return;
        }
        setMissing(false);
        setDraft(current);
        setPriceText(money(current.price));
        setStockText(String(current.stock));
      })
      .catch(() => setMissing(true));
  }, [creating, sku]);

  const stock = Number(stockText);
  const safeStock = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0;
  const status = stockStatus(safeStock);
  const preview = editorImage(draft);

  function update(partial: Partial<AdminProduct>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function readFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ image: String(reader.result) });
    reader.readAsDataURL(file);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    const name = draft.name.trim();
    const nextSku = draft.sku.trim();
    if (!name || !nextSku) {
      setError("Add a product name and SKU before saving.");
      return;
    }
    if (nextSku.toLowerCase() === "new") {
      setError("Choose a different SKU. “new” is reserved for the empty form.");
      return;
    }
    const price = Number(priceText.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(price)) {
      setError("Enter a price in USD.");
      return;
    }
    const next: AdminProduct = {
      ...draft,
      name,
      sku: nextSku,
      price,
      stock: safeStock,
      detail: draft.detail.trim() || "12 × 330 ml",
    };
    try {
      await saveProduct(next, creating ? "" : sku);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The product could not be saved.");
      return;
    }
    setError("");
    setNotice(`${name} saved.`);
    if (creating || next.sku !== sku) router.replace(`/admin/products/${next.sku}`);
  }

  function removeProduct() {
    void deleteProduct(sku).then(() => router.push("/admin/products"));
  }

  if (missing) {
    return (
      <AdminShell crumb="PRODUCTS">
        <Link href="/admin/products" className="text-[13px] font-medium text-lime">
          ← Back to Products
        </Link>
        <h1 className="text-[32px] leading-[1.1] font-semibold">Product editor</h1>
        <p className="text-sm leading-[1.6] text-mist">This SKU is not in the catalog.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell crumb="PRODUCTS">
      <Link href="/admin/products" className="text-[13px] font-medium text-lime">
        ← Back to Products
      </Link>
      <div>
        <h1 className="text-[32px] leading-[1.1] font-semibold">Product editor</h1>
        <p className="mt-2.5 text-sm leading-[1.6] text-mist">
          {creating ? "Create a product · empty fields" : `Edit ${draft.name || "product"} · ${draft.sku || sku}`}
        </p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex gap-2">
          <Link href={creating ? "/admin/products/PR-SL-12" : `/admin/products/${sku}`} className={creating ? ghostButton() : primaryButton()}>
            Edit existing
          </Link>
          <Link href="/admin/products/new" className={creating ? primaryButton() : ghostButton()}>
            Create new
          </Link>
        </div>
        <p className="text-xs leading-[1.6] text-mist">Shared form · new mode starts with empty fields</p>
      </div>
      {notice ? (
        <div className="flex gap-2.5 border border-line bg-panel p-3.5">
          <p className="text-sm text-lime">✓</p>
          <p className="text-xs leading-[1.5] text-mist">{notice}</p>
        </div>
      ) : null}
      <form onSubmit={onSave} className="flex flex-col gap-7">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <section className="flex flex-col gap-5 border border-line bg-panel p-6">
              <h2 className="text-lg leading-[1.1] font-semibold">Product details</h2>
              <Field label="PRODUCT NAME">
                <input
                  value={draft.name}
                  onChange={(event) => update({ name: event.target.value })}
                  className={fieldClass}
                />
              </Field>
              <Field label="DESCRIPTION">
                <textarea
                  value={draft.description}
                  onChange={(event) => update({ description: event.target.value })}
                  className={`${fieldClass} min-h-[108px]`}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SKU">
                  <input
                    value={draft.sku}
                    onChange={(event) => update({ sku: event.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="CATEGORY">
                  <span className="relative block">
                    <select
                      value={draft.category}
                      onChange={(event) => update({ category: event.target.value })}
                      className={`${fieldClass} appearance-none pr-10`}
                    >
                      {categories.map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-lime">
                      ⌄
                    </span>
                  </span>
                </Field>
              </div>
            </section>
            <section className="flex flex-col gap-5 border border-line bg-panel p-6">
              <h2 className="text-lg leading-[1.1] font-semibold">Pack & inventory</h2>
              <p className="text-xs leading-[1.6] text-mist">
                One 12-pack configuration per product. Stock counts are in packs, not individual cans.
              </p>
              <div className="border border-line">
                <div className="flex gap-[18px] bg-[#1a1e19] p-3.5 text-[11px] text-ash">
                  <p className="w-[250px]">Variant / pack</p>
                  <p className="w-[100px]">Price · USD</p>
                  <p>Available stock</p>
                </div>
                <div className="flex gap-[18px] p-3.5">
                  <div className="w-[250px]">
                    <p className="text-sm font-semibold">{draft.name || "New product"} / 12-pack</p>
                    <p className="mt-1 text-[11px] leading-[1.6] text-ash">{draft.detail || "12 × 330 ml"}</p>
                  </div>
                  <p className="w-[100px] text-[13px]">{priceText || "$0.00"}</p>
                  <p className="text-[13px]">{safeStock} packs</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="PRICE · USD">
                  <input value={priceText} onChange={(event) => setPriceText(event.target.value)} className={fieldClass} />
                </Field>
                <Field label="AVAILABLE STOCK · PACKS">
                  <input
                    value={stockText}
                    onChange={(event) => setStockText(event.target.value)}
                    inputMode="numeric"
                    className={fieldClass}
                  />
                </Field>
              </div>
              <p className="text-[11px] leading-[1.6] text-ash">
                Mock inventory · Night Berry is unavailable at 0 packs. Discovery Drop contains 3 cans of each flavor.
              </p>
            </section>
          </div>
          <div className="flex w-full flex-col gap-6 xl:w-[340px] xl:shrink-0">
            <section className="flex flex-col gap-5 border border-line bg-panel p-6">
              <h2 className="text-lg leading-[1.1] font-semibold">Product media</h2>
              <div className="relative h-[280px] bg-ink">
                {preview ? (
                  preview.startsWith("data:") ? (
                    <img src={preview} alt="" className="size-full object-cover" />
                  ) : (
                    <Image src={preview} alt="" fill sizes="340px" className="object-cover" />
                  )
                ) : (
                  <p className="grid size-full place-items-center text-xs text-ash">No image in this preview</p>
                )}
              </div>
              <div className="flex items-start justify-between">
                <label className="cursor-pointer text-[13px] font-medium text-lime">
                  Replace image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => readFile(event.target.files?.[0])}
                  />
                </label>
                <button type="button" onClick={() => update({ image: "" })} className="text-xs text-mist">
                  Remove
                </button>
              </div>
              <p className="text-[11px] leading-[1.6] text-ash">Original PRIME still-life · primary image</p>
              <label className={`${ghostButton("w-full cursor-pointer")}`}>
                + Add media
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => readFile(event.target.files?.[0])}
                />
              </label>
            </section>
            <section className="flex flex-col gap-5 border border-line bg-panel p-6">
              <h2 className="text-lg leading-[1.1] font-semibold">Availability</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Published</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.published}
                  onClick={() => update({ published: !draft.published })}
                  className={`flex h-[22px] w-[38px] rounded-[20px] p-[3px] ${
                    draft.published ? "justify-end bg-lime" : "justify-start bg-[#1a1e19]"
                  }`}
                >
                  <span className="size-4 rounded-[20px] bg-ink" />
                </button>
              </div>
              <StatusBadge tone={draft.published && status !== "Out of stock" ? "live" : "quiet"}>
                {draft.published && status !== "Out of stock" ? "Available on storefront" : status}
              </StatusBadge>
              <p className="text-xs leading-[1.6] text-mist">
                {draft.published
                  ? `${status === "Out of stock" ? "Published and out of stock" : "Published and in stock"}. Availability follows the stock value in this form.`
                  : "Unpublished. Availability follows the stock value in this form."}
              </p>
            </section>
          </div>
        </div>
        {error ? <p className="text-xs text-[#ff9a8c]">{error}</p> : null}
        {confirmDelete ? (
          <div className="flex flex-col gap-4 border border-line bg-panel p-6 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm">
              Delete {draft.name || "this product"} from the catalog? Existing order history stays unchanged.
            </p>
            <button type="button" className={ghostButton()} onClick={() => setConfirmDelete(false)}>
              Keep product
            </button>
            <button
              type="button"
              onClick={removeProduct}
              className="inline-flex min-h-12 items-center justify-center bg-[#ff9a8c] px-5 text-[13px] text-ink"
            >
              Delete product
            </button>
          </div>
        ) : null}
        <div className="h-px bg-line" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {creating ? (
            <span />
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-[13px] text-[#ff9a8c]">
              Delete product…
            </button>
          )}
          <div className="flex gap-3">
            <Link href="/admin/products" className={ghostButton()}>
              Cancel → Products
            </Link>
            <button type="submit" className={primaryButton()}>
              Save product
            </button>
          </div>
        </div>
        <p className="text-[11px] leading-[1.6] text-ash">
          Portfolio form only. No product or inventory changes are sent to a live store.
        </p>
      </form>
    </AdminShell>
  );
}

const fieldClass =
  "min-h-[50px] w-full border border-line bg-panel p-[15px] text-sm leading-[1.5] text-paper outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] text-mist">{label}</span>
      {children}
    </label>
  );
}
