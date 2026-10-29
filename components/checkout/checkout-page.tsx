"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { ShopProgress } from "@/components/shop/progress";
import { useAccount } from "@/lib/account";
import { useCart } from "@/lib/cart";
import { cartItem, money, summarize, type DeliveryMethod } from "@/lib/order";
import { placeCheckout, type PaymentMethod } from "@/lib/orders";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const states = ["California", "New York", "Texas", "Florida", "Washington"];
const stateAbbr: Record<string, string> = {
  California: "CA",
  "New York": "NY",
  Texas: "TX",
  Florida: "FL",
  Washington: "WA",
};

export function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { account } = useAccount();
  const { lines, promo, promoNote, discount, clear, applyPromo } = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [code, setCode] = useState(promo);
  const [seenPromo, setSeenPromo] = useState(promo);
  const [pending, setPending] = useState(false);
  if (promo !== seenPromo) {
    setSeenPromo(promo);
    if (promo) setCode(promo);
  }
  const [news, setNews] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("California");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");
  const [cardName, setCardName] = useState("");
  const [syncedAccount, setSyncedAccount] = useState<string | null>(null);
  if (account && account.email !== syncedAccount) {
    setSyncedAccount(account.email);
    setEmail(account.email);
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setStreet(account.street);
    setApartment(account.apartment);
    setCity(account.city);
    if (account.state) setState(account.state);
    if (account.postal) setZip(account.postal);
    setCountry(account.country || "United States");
    setPhone(account.phone);
    setCardName(`${account.firstName} ${account.lastName}`.trim());
    setNews(account.newsletter);
  }

  useEffect(() => {
    const orderId = params.get("order");
    if (params.get("payment") === "cancelled" && orderId) {
      void fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    }
  }, [params]);

  const totals = summarize(lines, delivery, discount);
  const fullName = `${firstName} ${lastName}`.trim();

  async function placeOrder() {
    if (pending) return;
    if (lines.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!email.includes("@") || !firstName.trim() || !lastName.trim() || !street.trim() || !city.trim() || !zip.trim()) {
      setError("Add an email and a complete shipping address before placing the order.");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (news && email.includes("@")) {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      }
      const result = await placeCheckout({
        lines,
        delivery,
        payment,
        email,
        firstName,
        lastName,
        street,
        apartment,
        city,
        state,
        zip,
        country,
        phone,
      });
      await clear();
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      router.push(`/orders/${result.orderId}`);
    } catch (caught) {
      setPending(false);
      setError(caught instanceof Error ? caught.message : "The order could not be placed.");
    }
  }

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <ShopProgress current={2} />
        <div className="flex flex-col gap-[22px]">
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/cart">← BACK TO CART</Link>
            {" / "}
            CHECKOUT
          </p>
          <h1 className="font-display text-[clamp(48px,8vw,88px)] leading-none font-extrabold xl:text-[88px]">
            MAKE IT YOURS
          </h1>
        </div>

        {lines.length === 0 ? (
          <div className="border border-line bg-panel p-6">
            <p className="text-[14px] text-mist">Your bag is empty.</p>
            <Link href="/products" className="mt-4 inline-flex text-[13px] font-medium text-lime">
              ← Continue shopping
            </Link>
          </div>
        ) : (
          <form
            className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-16"
            onSubmit={(event) => {
              event.preventDefault();
              placeOrder();
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[30px]">
              <div className="flex flex-col gap-3 bg-panel p-[18px] text-[13px] sm:flex-row sm:items-center sm:justify-between">
                <p className="leading-[1.65]">Checking out as a guest. Already in the circuit?</p>
                <Link href="/sign-in" className="font-medium text-lime">
                  Sign In →
                </Link>
              </div>

              <section className="flex flex-col gap-[18px]">
                <h2 className="font-display text-[32px] leading-none font-extrabold">01 / CONTACT</h2>
                <Field label="EMAIL ADDRESS" value={email} onChange={setEmail} type="email" autoComplete="email" />
                <p className="text-[11px] leading-[1.5] text-ash">Order updates and delivery tracking will go here.</p>
                <label className="flex items-center gap-2.5 text-[12px] leading-[1.5] text-mist">
                  <input
                    type="checkbox"
                    checked={news}
                    onChange={(event) => setNews(event.target.checked)}
                    className="size-[17px] accent-lime"
                  />
                  Email me new drops and news from PRIME (optional).
                </label>
              </section>
              <div className="h-px bg-line" />

              <section className="flex flex-col gap-[18px]">
                <h2 className="font-display text-[32px] leading-none font-extrabold">02 / SHIPPING ADDRESS</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="FIRST NAME" value={firstName} onChange={setFirstName} autoComplete="given-name" />
                  <Field label="LAST NAME" value={lastName} onChange={setLastName} autoComplete="family-name" />
                </div>
                <Field label="STREET ADDRESS" value={street} onChange={setStreet} autoComplete="address-line1" />
                <Field
                  label="APARTMENT, SUITE, ETC. (OPTIONAL)"
                  value={apartment}
                  onChange={setApartment}
                  autoComplete="address-line2"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="CITY" value={city} onChange={setCity} autoComplete="address-level2" />
                  <SelectField label="STATE" value={state} onChange={setState} options={states} />
                  <Field label="ZIP CODE" value={zip} onChange={setZip} autoComplete="postal-code" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="COUNTRY / REGION"
                    value={country}
                    onChange={setCountry}
                    options={["United States", "Canada", "United Kingdom"]}
                  />
                  <Field label="PHONE (FOR DELIVERY)" value={phone} onChange={setPhone} autoComplete="tel" />
                </div>
                <div className="flex items-center gap-3 border border-line bg-panel p-3.5">
                  <Icon src="/icons/check-circle.svg" width={18} height={18} />
                  <p className="text-[12px] leading-[1.5] text-mist">
                    {zip === "94103"
                      ? "Address looks good. Delivery is available to 94103."
                      : `Saved for this order. Delivery timing is confirmed after you place it.`}
                  </p>
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <h2 className="font-display text-[32px] leading-none font-extrabold">03 / DELIVERY</h2>
                <DeliveryOption
                  selected={delivery === "standard"}
                  title="Standard delivery"
                  detail="Arrives Nov 2–4, 2026 · 3–5 business days"
                  price={totals.freeDelivery ? "FREE" : "AT $64"}
                  onSelect={() => setDelivery("standard")}
                />
                <DeliveryOption
                  selected={delivery === "express"}
                  title="Express delivery"
                  detail="1–2 business days after dispatch"
                  price={money(9)}
                  onSelect={() => setDelivery("express")}
                />
              </section>

              <section className="flex flex-col gap-[18px]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="font-display text-[32px] leading-none font-extrabold">04 / PAYMENT</h2>
                  <p className="font-mono text-[11px] leading-[1.5] text-ash">SECURE CHECKOUT</p>
                </div>
                <p className="text-[12px] leading-[1.65] text-mist">
                  Card details are entered on the payment page. These fields stay on this screen and are not submitted.
                </p>
                {payment === "card" ? (
                  <>
                    <label className="flex flex-col gap-2">
                      <span className="font-mono text-[11px] leading-[1.5] text-mist">CARD NUMBER</span>
                      <span className="flex h-[52px] items-center justify-between border border-line bg-panel px-4">
                        <input
                          defaultValue="••••  ••••  ••••  4242"
                          aria-label="Card number"
                          readOnly
                          className="w-full bg-transparent text-[14px] outline-none"
                        />
                        <Icon src="/icons/credit-card.svg" width={18} height={18} />
                      </span>
                    </label>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <label className="flex flex-col gap-2">
                        <span className="font-mono text-[11px] leading-[1.5] text-mist">EXPIRY</span>
                        <input defaultValue="12 / 28" aria-label="Expiry" readOnly className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none" />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="font-mono text-[11px] leading-[1.5] text-mist">SECURITY CODE</span>
                        <span className="flex h-[52px] items-center justify-between border border-line bg-panel px-4">
                          <input defaultValue="•••" aria-label="Security code" readOnly className="w-full bg-transparent text-[14px] outline-none" />
                          <Icon src="/icons/circle-help.svg" width={18} height={18} />
                        </span>
                      </label>
                      <Field label="NAME ON CARD" value={cardName} onChange={setCardName} autoComplete="cc-name" />
                    </div>
                  </>
                ) : (
                  <p className="border border-line bg-panel p-4 text-[12px] leading-[1.65] text-mist">
                    {payment === "apple" ? "Apple Pay" : "Google Pay"} continues on the secure payment page. No wallet
                    charge happens on this form.
                  </p>
                )}
                <label className="flex items-center gap-2.5 text-[12px] leading-[1.5] text-mist">
                  <input
                    type="checkbox"
                    checked={sameBilling}
                    onChange={(event) => setSameBilling(event.target.checked)}
                    className="size-[17px] accent-lime"
                  />
                  Billing address is the same as shipping address.
                </label>
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[11px] leading-[1.5] text-mist">PAYMENT METHOD</p>
                  <PaymentOption
                    selected={payment === "card"}
                    title="Card"
                    detail="Visa ending in 4242"
                    onSelect={() => setPayment("card")}
                  />
                  <PaymentOption
                    selected={payment === "apple"}
                    title="Apple Pay"
                    detail="Secure wallet checkout"
                    onSelect={() => setPayment("apple")}
                  />
                  <PaymentOption
                    selected={payment === "google"}
                    title="Google Pay"
                    detail="Secure wallet checkout"
                    onSelect={() => setPayment("google")}
                  />
                </div>
              </section>
              {error || params.get("payment") === "cancelled" ? (
                <p className="text-[12px] text-lime">{error || "Payment was cancelled. No charge was made."}</p>
              ) : null}
            </div>

            <aside className="flex w-full flex-col gap-6 bg-panel p-6 xl:w-[440px] xl:shrink-0 xl:p-7">
              <h2 className="font-display text-[36px] leading-none font-extrabold">YOUR ORDER</h2>
              <div className="flex flex-col gap-5">
                {lines.map((line) => {
                  const item = cartItem(line.id);
                  return (
                    <article key={line.id} className="flex items-center gap-5 border-b border-line pb-5">
                      <div className="relative h-[94px] w-[78px] shrink-0">
                        <Image src={item.image} alt={item.alt} fill sizes="78px" className="object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
                        <h3 className="font-display text-[24px] leading-none font-extrabold">{item.name}</h3>
                        <p className="font-mono text-[9px] leading-[1.5] text-ash">{item.detail}</p>
                        <p className="text-[12px] leading-[1.65] text-mist">Quantity {line.qty}</p>
                      </div>
                      <p className="text-[14px]">{money(line.qty * (line.price ?? 32))}</p>
                    </article>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="font-mono text-[11px] leading-[1.5] text-mist">PROMO CODE</p>
                <div className="flex gap-3">
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter code"
                    className="h-[52px] min-w-0 flex-1 border border-line bg-panel px-4 text-[14px] outline-none placeholder:text-ash"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromo(code)}
                    className="h-[52px] w-[112px] border border-line bg-ink text-[13px] font-bold"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[11px] leading-[1.5] text-ash">
                  {promoNote || "Enter a code such as PRIME10."}
                </p>
              </div>
              <div className="flex flex-col gap-[18px] text-[13px]">
                <SummaryLine label={`Subtotal · ${totals.packs} packs / ${totals.cans} cans`} value={money(totals.subtotal)} />
                {totals.discount > 0 ? <SummaryLine label="Discount" value={`-${money(totals.discount)}`} /> : null}
                <SummaryLine
                  label={delivery === "express" ? "Express delivery" : "Standard delivery"}
                  value={delivery === "express" ? money(9) : totals.freeDelivery ? "FREE" : "AT $64"}
                />
                <SummaryLine label="Tax" value={money(totals.tax)} />
                <div className="h-px bg-line" />
                <div className="flex items-center justify-between">
                  <p className="text-[18px] font-semibold">Total · USD</p>
                  <p className="font-display text-[36px] leading-none font-bold text-lime">{money(totals.total)}</p>
                </div>
              </div>
              <div className="h-px bg-line" />
              <p className="font-mono text-[11px] leading-[1.5] text-lime">
                {delivery === "express" ? "ARRIVES IN 1–2 BUSINESS DAYS" : "ARRIVES NOV 2–4, 2026"}
              </p>
              <p className="text-[12px] leading-[1.65] text-mist">
                {delivery === "express" ? "Express delivery" : "Standard delivery"} to {fullName || "your address"}
                <br />
                {city}, {stateAbbr[state] ?? state} {zip}
              </p>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink disabled:opacity-60"
              >
                {pending ? "Placing order…" : `Place order — ${money(totals.total)}`}
                <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
              </button>
              <p className="font-mono text-[10px] leading-[1.6] text-lime">PAYMENT CONFIRMED ON THE NEXT STEP</p>
              <p className="text-[11px] leading-[1.65] text-mist">
                By placing an order, you agree to our Terms of Use and acknowledge our Privacy Policy.
              </p>
              <Link href="/cart" className="text-[13px] font-medium text-lime">
                ← Edit Cart
              </Link>
            </aside>
          </form>
        )}
      </main>
      <ShopFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="font-mono text-[11px] leading-[1.5] text-mist">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="font-mono text-[11px] leading-[1.5] text-mist">{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full appearance-none border border-line bg-panel px-4 text-[14px] outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2">
          <Icon src="/icons/chevron-down-18.svg" width={18} height={18} />
        </span>
      </span>
    </label>
  );
}

function DeliveryOption({
  selected,
  title,
  detail,
  price,
  onSelect,
}: {
  selected: boolean;
  title: string;
  detail: string;
  price: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center justify-between gap-4 border bg-panel p-[18px] text-left ${
        selected ? "border-lime" : "border-line"
      }`}
    >
      <span className="flex flex-col gap-[7px]">
        <span className={`text-[13px] font-medium ${selected ? "text-lime" : "text-paper"}`}>
          {selected ? "◉" : "○"} {title}
        </span>
        <span className="text-[12px] text-ash">{detail}</span>
      </span>
      <span className="font-mono text-[11px] leading-[1.5]">{price}</span>
    </button>
  );
}

function PaymentOption({
  selected,
  title,
  detail,
  onSelect,
}: {
  selected: boolean;
  title: string;
  detail: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center justify-between gap-4 border bg-panel p-4 text-left ${
        selected ? "border-lime" : "border-line"
      }`}
    >
      <span className="flex items-center gap-3">
        {selected ? (
          <Icon src="/icons/radio-selected.svg" width={18} height={18} />
        ) : (
          <span className="size-[18px] border border-ash bg-ink" />
        )}
        <span className="flex flex-col gap-1">
          <span className="text-[13px] font-medium">{title}</span>
          <span className="text-[11px] leading-[1.5] text-ash">{detail}</span>
        </span>
      </span>
      <span className={`font-mono text-[11px] leading-[1.5] ${selected ? "text-paper" : "text-mist"}`}>
        {selected ? "SELECTED" : "AVAILABLE"}
      </span>
    </button>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-mist">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
