"use client";

import { ShopHeader } from "@/components/products/shop-chrome";
import {
  demoAccount,
  saveAccount,
  signOutAccount,
  updatePassword,
  useAccount,
  type Account,
} from "@/lib/account";
import { money } from "@/lib/order";
import { listOrders, type StoredOrder } from "@/lib/orders";
import { useDragScroll } from "@/lib/use-drag-scroll";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "address", label: "Saved Address" },
  { id: "orders", label: "Orders" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AccountPage() {
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: TabId = requested === "address" || requested === "orders" ? requested : "profile";
  const router = useRouter();
  const { account, ready } = useAccount();
  const tabsScroller = useDragScroll<HTMLDivElement>();
  const signedIn = Boolean(account);
  const [draft, setDraft] = useState<Account>(demoAccount);
  const [synced, setSynced] = useState<Account | null | undefined>(undefined);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (ready && account !== synced) {
    setSynced(account);
    setDraft(account ?? demoAccount);
  }

  function selectTab(next: TabId) {
    setNotice("");
    setError("");
    router.replace(next === "profile" ? "/account" : `/account?tab=${next}`, { scroll: false });
  }

  function persist(message: string) {
    void saveAccount(draft).then((result) => {
      if (result) {
        setError(result);
        setNotice("");
        return;
      }
      setError("");
      setNotice(message);
    });
  }

  return (
    <div className="bg-ink text-paper">
      <ShopHeader accountIcon={false} />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-8 pb-12 sm:px-8 lg:px-10 lg:pt-10 lg:pb-16 xl:px-16">
        <p className="font-mono text-[12px] leading-[1.5] text-ash">
          <Link href="/">HOME</Link>
          {" / MY ACCOUNT"}
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-[880px] flex-col gap-4">
            <h1 className="font-display text-[clamp(48px,8vw,80px)] leading-[1.1] font-extrabold">MY ACCOUNT</h1>
            <p className="text-[14px] leading-[1.6] text-mist">
              Manage your profile, preferences, and account details in one place.
            </p>
          </div>
          {signedIn ? (
            <button
              type="button"
              onClick={() => {
                void signOutAccount().then(() => {
                  router.push("/sign-in");
                  router.refresh();
                });
              }}
              className="inline-flex min-h-12 items-center justify-center border border-line bg-ink px-5 text-[13px]"
            >
              Log out
            </button>
          ) : (
            <Link href="/sign-in" className="inline-flex min-h-12 items-center justify-center border border-line bg-ink px-5 text-[13px]">
              Sign in
            </Link>
          )}
        </div>
        <div ref={tabsScroller} className="drag-scroll flex touch-pan-y gap-9 overflow-x-auto border-b border-line">
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                className={`h-14 shrink-0 border-b-2 px-1 text-[15px] font-semibold ${
                  selected ? "border-lime text-lime" : "border-transparent text-mist"
                }`}
                aria-current={selected ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {tab === "profile" ? (
          <ProfileTab
            draft={draft}
            setDraft={setDraft}
            editingPassword={editingPassword}
            setEditingPassword={setEditingPassword}
            onSave={() => persist("Profile saved.")}
            onNotice={setNotice}
            onError={setError}
          />
        ) : null}
        {tab === "address" ? (
          <AddressTab
            draft={draft}
            setDraft={setDraft}
            editing={editingAddress}
            setEditing={setEditingAddress}
            onSave={() => persist("Address saved.")}
          />
        ) : null}
        {tab === "orders" ? <OrdersTab /> : null}
        {error ? <p className="text-[12px] leading-[1.6] text-lime">{error}</p> : null}
        {notice ? (
          <p className="flex items-start gap-2.5 border border-line bg-panel p-3.5 text-[12px] leading-[1.5] text-mist">
            <span className="text-[14px] text-lime">✓</span>
            {notice}
          </p>
        ) : null}
      </main>
      <AccountFooter />
    </div>
  );
}

function ProfileTab({
  draft,
  setDraft,
  editingPassword,
  setEditingPassword,
  onSave,
  onNotice,
  onError,
}: {
  draft: Account;
  setDraft: (next: Account) => void;
  editingPassword: boolean;
  setEditingPassword: (next: boolean) => void;
  onSave: () => void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="flex flex-col gap-7 xl:flex-row xl:items-start">
      <section className="flex min-w-0 flex-1 flex-col gap-5 border border-line bg-panel p-6">
        <h2 className="text-[18px] leading-[1.1] font-semibold">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="FIRST NAME" value={draft.firstName} onChange={(firstName) => setDraft({ ...draft, firstName })} />
          <Field label="LAST NAME" value={draft.lastName} onChange={(lastName) => setDraft({ ...draft, lastName })} />
        </div>
        <Field label="EMAIL ADDRESS" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} type="email" />
        <Field label="PHONE" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} type="tel" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button type="button" onClick={onSave} className="inline-flex min-h-12 items-center justify-center border border-lime bg-lime px-5 text-[13px] text-ink">
            Save profile
          </button>
          <p className="text-[12px] leading-[1.6] text-mist">Changes apply to your profile only.</p>
        </div>
      </section>
      <aside className={`flex w-full flex-col gap-6 ${editingPassword ? "xl:w-[640px]" : "xl:w-[360px]"}`}>
        <PasswordPanel
          draft={draft}
          setDraft={setDraft}
          editing={editingPassword}
          setEditing={setEditingPassword}
          onNotice={onNotice}
          onError={onError}
        />
        {editingPassword ? null : (
          <section className="flex flex-col gap-4 border border-line bg-panel p-6">
            <h2 className="text-[18px] leading-[1.1] font-semibold">Preferences</h2>
            <Preference label="NEWSLETTER" value={draft.newsletter ? "Subscribed" : "Not subscribed"} />
            <Preference label="ORDER UPDATES" value="Email" />
          </section>
        )}
      </aside>
    </div>
  );
}

function PasswordPanel({
  draft,
  setDraft,
  editing,
  setEditing,
  onNotice,
  onError,
}: {
  draft: Account;
  setDraft: (next: Account) => void;
  editing: boolean;
  setEditing: (next: boolean) => void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  function submit() {
    void updatePassword(draft.email, current, next).then((message) => {
      if (message) {
        onError(message);
        onNotice("");
        return;
      }
      setCurrent("");
      setNext("");
      setEditing(false);
      onError("");
      onNotice("Password updated.");
    });
  }

  return (
    <section className="flex flex-col gap-4 border border-line bg-panel p-6">
      <h2 className="text-[18px] leading-[1.1] font-semibold">Password & preferences</h2>
      {editing ? (
        <>
          <div className="flex items-start justify-between gap-4 text-[13px]">
            <p className="leading-[1.6] text-mist">Password · ••••••••••••</p>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                onError("");
              }}
              className="font-medium text-lime"
            >
              Change password ↓
            </button>
          </div>
          <div className="h-px bg-line" />
          <div className="grid gap-3 sm:grid-cols-2">
            <SecretField label="CURRENT PASSWORD" value={current} shown={showCurrent} onChange={setCurrent} onToggle={() => setShowCurrent((value) => !value)} />
            <SecretField label="NEW PASSWORD" value={next} shown={showNext} onChange={setNext} onToggle={() => setShowNext((value) => !value)} />
          </div>
          <p className="text-[11px] leading-[1.6] text-ash">Use at least 12 characters, including a number and a symbol.</p>
          <button type="button" onClick={submit} className="inline-flex min-h-12 w-fit items-center justify-center border border-line bg-ink px-5 text-[13px]">
            Update password
          </button>
          <div className="h-px bg-line" />
          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={draft.newsletter}
              onChange={(event) => {
                const next = { ...draft, newsletter: event.target.checked };
                setDraft(next);
                void saveAccount(next).then((message) => {
                  if (message) onError(message);
                });
              }}
              className="size-[17px] accent-lime"
            />
            <span className="text-[12px] leading-[1.5] text-mist">Email me new drops and news from PRIME.</span>
          </label>
          <p className="text-[11px] leading-[1.6] text-ash">Order updates are separate from marketing preferences.</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[12px] text-mist">PASSWORD</p>
            <p className="text-[14px]">••••••••••••</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex min-h-12 w-fit items-center justify-center border border-line bg-ink px-5 text-[13px]"
          >
            Change password
          </button>
        </>
      )}
    </section>
  );
}

function AddressTab({
  draft,
  setDraft,
  editing,
  setEditing,
  onSave,
}: {
  draft: Account;
  setDraft: (next: Account) => void;
  editing: boolean;
  setEditing: (next: boolean) => void;
  onSave: () => void;
}) {
  return (
    <section className="flex w-full max-w-[760px] flex-col gap-5 border border-line bg-panel p-6">
      <h2 className="text-[18px] leading-[1.1] font-semibold">Default shipping address</h2>
      <p className="w-fit bg-[#202915] px-[9px] py-1.5 text-[11px] font-medium text-lime">Default address</p>
      <p className="text-[14px] leading-[1.6] text-mist">
        {`${draft.firstName} ${draft.lastName}`}
        <br />
        {`${draft.street}${draft.apartment ? `, ${draft.apartment}` : ""}`}
        <br />
        {`${draft.city}, ${draft.region}`}
        <br />
        {draft.country}
        <br />
        {draft.phone}
      </p>
      <button type="button" onClick={() => setEditing(!editing)} className="w-fit text-[13px] font-medium text-lime">
        Edit saved address ↓
      </button>
      {editing ? (
        <>
          <div className="h-px bg-line" />
          <p className="font-mono text-[11px] leading-[1.5] text-ash">EDIT ADDRESS</p>
          <Field label="STREET ADDRESS" value={draft.street} onChange={(street) => setDraft({ ...draft, street })} compact />
          <Field label="APARTMENT / SUITE" value={draft.apartment} onChange={(apartment) => setDraft({ ...draft, apartment })} compact />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CITY" value={draft.city} onChange={(city) => setDraft({ ...draft, city })} compact />
            <Field label="STATE / ZIP" value={draft.region} onChange={(region) => setDraft({ ...draft, region })} compact />
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] text-mist">COUNTRY</span>
            <span className="relative">
              <select
                value={draft.country}
                onChange={(event) => setDraft({ ...draft, country: event.target.value })}
                className="h-[50px] w-full appearance-none border border-line bg-panel px-[15px] text-[14px] outline-none"
              >
                <option>United States</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-lime">⌄</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onSave} className="inline-flex min-h-12 items-center justify-center border border-lime bg-lime px-5 text-[13px] text-ink">
              Save address
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex min-h-12 items-center justify-center border border-line bg-ink px-5 text-[13px]"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] leading-[1.6] text-ash">Editing this address won’t change existing orders.</p>
        </>
      ) : null}
    </section>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    void listOrders().then(setOrders);
  }, []);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-[40px] leading-[1.1] font-extrabold">YOUR ORDERS</h2>
        <p className="font-mono text-[11px] leading-[1.5] text-ash">
          {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
        </p>
      </div>
      <p className="text-[12px] leading-[1.6] text-mist">
        The Orders tab jumps to this section. Profile and Saved Address stay on this same account page.
      </p>
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onChanged={() => {
            void listOrders().then(setOrders);
          }}
        />
      ))}
      <p className="text-[11px] leading-[1.6] text-ash">
        Orders stay on your account after you refresh. Unpaid orders can be cancelled before they are dispatched.
      </p>
    </section>
  );
}

function OrderRow({ order, onChanged }: { order: StoredOrder; onChanged: () => void }) {
  const preparing = order.fulfillment ? order.fulfillment !== "Delivered" && order.status !== "cancelled" : order.status === "received";
  const title = order.lines
    .map((line) => `${line.qty} ${line.id === "discovery" ? "Discovery Drop" : titleCase(line.id.replace(/-pack$/, ""))}`)
    .join(" + ");
  const packs = `${order.packs} ${order.packs === 1 ? "pack" : "packs"}`;
  const paymentNote =
    order.paymentState === "paid"
      ? "Payment received"
      : order.paymentState === "cancelled"
        ? "Cancelled"
        : order.paymentState === "historical"
          ? "Opening record"
          : order.paymentState === "refunded"
            ? "Refunded"
            : "Payment pending";
  const detail = `${packs} · ${order.cans} cans · ${paymentNote}`;

  return (
    <article id={order.id} className="flex flex-col gap-4 border border-line bg-panel p-[22px] lg:flex-row lg:items-center lg:gap-8">
      <div className="flex w-full flex-col gap-2 lg:w-[170px] lg:shrink-0">
        <p className="font-mono text-[13px]">#{order.id}</p>
        <p className="text-[12px] leading-[1.6] text-ash">{shortMonth(order.placedLabel)}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-[15px] leading-[1.1] font-semibold">{title}</p>
        <p className="text-[12px] leading-[1.6] text-mist">{detail}</p>
      </div>
      <div className="flex w-full flex-col gap-2 lg:w-[180px] lg:shrink-0">
        <p className={`w-fit px-[9px] py-1.5 text-[11px] font-medium ${preparing ? "bg-[#202915] text-lime" : "bg-[#1a1e19] text-mist"}`}>
          {order.status === "cancelled" ? "Cancelled" : preparing ? order.fulfillment || "Preparing" : "Delivered"}
        </p>
        <p className="text-[11px] leading-[1.6] text-ash">{preparing ? `Est. ${shortDate(order.deliveryLabel)}` : shortMonth(order.deliveryLabel)}</p>
      </div>
      <p className="w-[100px] shrink-0 text-[16px]">{money(order.total)}</p>
      <div className="flex shrink-0 flex-col items-start gap-2">
        <Link href={`/orders/${order.id}`} className="text-[13px] font-medium text-lime">
          Confirmation ↗
        </Link>
        {order.cancellable ? (
          <button
            type="button"
            className="text-[13px] font-medium text-lime"
            onClick={() => {
              void fetch(`/api/orders/${order.id}/cancel`, { method: "POST" }).then(() => onChanged());
            }}
          >
            Cancel order
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  compact?: boolean;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className={`font-mono text-mist ${compact ? "text-[11px]" : "text-[12px]"}`}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[50px] border border-line bg-panel px-[15px] text-[14px] leading-[1.5] outline-none"
      />
    </label>
  );
}

function SecretField({
  label,
  value,
  shown,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  shown: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-[11px] text-mist">{label}</span>
      <span className="flex min-h-[50px] items-center gap-3 border border-line bg-panel px-[15px]">
        <input
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[14px] leading-[1.5] outline-none"
        />
        <button type="button" onClick={onToggle} className="text-[12px] text-lime">
          {shown ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}

function Preference({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-mono text-[12px] text-mist">{label}</p>
      <p className="text-[14px]">{value}</p>
    </div>
  );
}

function AccountFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 sm:px-8 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-3 text-mist sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px]">Leave ordinary behind</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px]">
            <Link href="/products">Shop</Link>
            <Link href="/account">Account</Link>
            <a href="mailto:hello@prime.energy">hello@prime.energy</a>
          </div>
        </div>
        <div className="h-px bg-line" />
        <div className="flex flex-col gap-3 font-mono text-[12px] leading-[1.5] text-ash sm:flex-row sm:items-start sm:justify-between">
          <p>© 2026 PRIME ENERGY. ALL RIGHTS RESERVED.</p>
          <p>PRIVACY POLICY / TERMS OF USE</p>
          <p>United States · USD</p>
        </div>
      </div>
    </footer>
  );
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function prettyDate(value: string) {
  return value.replace(/^[A-Za-z]+/, (month) => month.charAt(0) + month.slice(1).toLowerCase());
}

function shortMonth(value: string) {
  return prettyDate(value)
    .replace(/^([A-Za-z]{3})[a-z]+/, "$1")
    .replace(/ 0(\d)/, " $1");
}

function shortDate(value: string) {
  return prettyDate(value)
    .replace(/,?\s*\d{4}$/, "")
    .replace(/^([A-Za-z]{3})[a-z]+/, "$1");
}
