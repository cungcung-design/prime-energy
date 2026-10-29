import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db";
import { dollars, quote } from "@/lib/pricing";
import { hashPassword, randomToken, verifyPassword } from "@/lib/passwords";
import { StoreError, tokenHash } from "@/lib/session";

type ProductRow = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  detail: string;
  price_cents: number;
  stock: number;
  published: number;
  image: string;
  admin_image: string;
  accent: string;
  traits: string;
  code: string;
  alt: string;
};

export type AddressInput = {
  street: string;
  apartment: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

const states: Record<string, string> = {
  CA: "California",
  NY: "New York",
  TX: "Texas",
  FL: "Florida",
  WA: "Washington",
};

export function lineIdFor(slug: string) {
  return slug === "discovery" ? "discovery" : `${slug}-pack`;
}

export function slugFromLine(id: string) {
  return id === "discovery" ? "discovery" : id.replace(/-pack$/, "");
}

export function toAccountRegion(region: string, postal: string) {
  const short = Object.entries(states).find(([, name]) => name === region)?.[0] ?? region;
  return [short, postal].filter(Boolean).join(" ");
}

export function fromAccountRegion(value: string) {
  const match = value.trim().match(/^(.*?)(?:\s+(\d{5}(?:-\d{4})?))?$/);
  const head = (match?.[1] ?? "").trim();
  const postal = match?.[2] ?? "";
  return { region: states[head.toUpperCase()] ?? (head || "California"), postal };
}

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function settings(db: DatabaseSync) {
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    standardCents: Number(map.standard_cents ?? 0),
    expressCents: Number(map.express_cents ?? 900),
    freeMinimumCents: Number(map.free_minimum_cents ?? 6400),
    taxRate: Number(map.tax_rate ?? 0.085),
  };
}

function productQuery() {
  return `SELECT products.*, categories.name AS category FROM products JOIN categories ON categories.id = products.category_id`;
}

export function publicProduct(row: ProductRow) {
  return {
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    detail: row.detail,
    price: dollars(row.price_cents),
    stock: row.stock,
    published: row.published === 1,
    available: row.published === 1 && row.stock > 0,
    image: row.image,
    accent: row.accent,
    traits: row.traits,
    code: row.code,
    alt: row.alt,
  };
}

export function listProducts() {
  const rows = getDb().prepare(`${productQuery()} ORDER BY products.id`).all() as ProductRow[];
  return rows.map(publicProduct);
}

export function findProduct(slug: string) {
  const row = getDb().prepare(`${productQuery()} WHERE products.slug = ?`).get(slug) as ProductRow | undefined;
  return row ? publicProduct(row) : null;
}

function cartRow(db: DatabaseSync, token: string, userId: number | null) {
  const hash = tokenHash(token);
  let cart = db.prepare("SELECT id, user_id, promo_code FROM carts WHERE token_hash = ?").get(hash) as
    | { id: number; user_id: number | null; promo_code: string | null }
    | undefined;
  if (!cart) {
    db.prepare("INSERT INTO carts (token_hash, user_id) VALUES (?, ?)").run(hash, userId);
    cart = db.prepare("SELECT id, user_id, promo_code FROM carts WHERE token_hash = ?").get(hash) as {
      id: number;
      user_id: number | null;
      promo_code: string | null;
    };
  } else if (userId && cart.user_id !== userId) {
    const owned = db.prepare("SELECT id FROM carts WHERE user_id = ? AND id != ?").get(userId, cart.id) as { id: number } | undefined;
    if (owned) {
      const guestItems = db.prepare("SELECT product_id, qty FROM cart_items WHERE cart_id = ?").all(cart.id) as {
        product_id: number;
        qty: number;
      }[];
      for (const item of guestItems) {
        db.prepare(
          `INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)
           ON CONFLICT(cart_id, product_id) DO UPDATE SET qty = qty + excluded.qty`,
        ).run(owned.id, item.product_id, item.qty);
      }
      db.prepare("DELETE FROM carts WHERE id = ?").run(cart.id);
      cart = db.prepare("SELECT id, user_id, promo_code FROM carts WHERE id = ?").get(owned.id) as {
        id: number;
        user_id: number | null;
        promo_code: string | null;
      };
    }
    db.prepare("UPDATE carts SET user_id = ? WHERE id = ?").run(userId, cart.id);
  }
  return cart;
}

export function readCart(token: string, userId: number | null) {
  const db = getDb();
  const cart = cartRow(db, token, userId);
  const lines = db
    .prepare(
      `SELECT products.slug, products.name, products.price_cents, products.stock, products.published, products.image, products.detail, cart_items.qty
       FROM cart_items JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.cart_id = ?`,
    )
    .all(cart.id) as {
    slug: string;
    name: string;
    price_cents: number;
    stock: number;
    published: number;
    image: string;
    detail: string;
    qty: number;
  }[];
  const visible = lines
    .map((line) => ({ ...line, qty: Math.min(line.qty, Math.max(line.stock, 0)) }))
    .filter((line) => line.qty > 0 && line.published === 1);
  const promo = evaluatePromo(db, cart.promo_code, visible.reduce((sum, line) => sum + line.price_cents * line.qty, 0));
  const store = settings(db);
  const priced = visible.map((line) => ({ qty: line.qty, priceCents: line.price_cents }));
  const standard = quote({
    lines: priced,
    delivery: "standard",
    discountCents: promo.discountCents,
    standardCents: store.standardCents,
    expressCents: store.expressCents,
    freeMinimumCents: store.freeMinimumCents,
  });
  const express = quote({
    lines: priced,
    delivery: "express",
    discountCents: promo.discountCents,
    standardCents: store.standardCents,
    expressCents: store.expressCents,
    freeMinimumCents: store.freeMinimumCents,
  });
  return {
    lines: visible.map((line) => ({
      id: lineIdFor(line.slug),
      label: line.slug === "discovery" ? "Discovery Drop" : `${line.name} packs`,
      qty: line.qty,
      price: dollars(line.price_cents),
      image: line.image,
      detail: line.detail,
      name: line.name,
    })),
    promo: promo.code,
    promoNote: promo.note,
    discount: dollars(promo.discountCents),
    standard: moneyQuote(standard),
    express: moneyQuote(express),
  };
}

function moneyQuote(value: ReturnType<typeof quote>) {
  return {
    packs: value.packs,
    cans: value.cans,
    subtotal: dollars(value.subtotal),
    discount: dollars(value.discount),
    shipping: dollars(value.shipping),
    tax: dollars(value.tax),
    total: dollars(value.total),
    freeDelivery: value.freeDelivery,
    remaining: dollars(Math.max(0, 6400 - value.taxable)),
  };
}

function evaluatePromo(db: DatabaseSync, code: string | null, subtotalCents: number) {
  if (!code) return { code: "", note: "", discountCents: 0, valid: false };
  const promo = db.prepare("SELECT * FROM promotions WHERE code = ?").get(code.toUpperCase()) as
    | { code: string; percent_off: number; min_subtotal_cents: number; expires_at: string | null; max_uses: number; uses: number; active: number }
    | undefined;
  if (!promo || promo.active !== 1) return { code, note: "That code is not active.", discountCents: 0, valid: false };
  if (promo.expires_at && promo.expires_at < new Date().toISOString()) {
    return { code: promo.code, note: "That code has expired.", discountCents: 0, valid: false };
  }
  if (promo.uses >= promo.max_uses) return { code: promo.code, note: "That code has reached its use limit.", discountCents: 0, valid: false };
  if (subtotalCents < promo.min_subtotal_cents) {
    return {
      code: promo.code,
      note: `Add $${dollars(promo.min_subtotal_cents - subtotalCents).toFixed(2)} more before this code applies.`,
      discountCents: 0,
      valid: false,
    };
  }
  const discountCents = Math.round((subtotalCents * promo.percent_off) / 100);
  return { code: promo.code, note: `${promo.percent_off}% off applied.`, discountCents, valid: true };
}

export function mutateCart(token: string, userId: number | null, slug: string, qty: number, mode: "set" | "add" = "set") {
  const db = getDb();
  const product = db.prepare("SELECT id, stock, published, name FROM products WHERE slug = ?").get(slug) as
    | { id: number; stock: number; published: number; name: string }
    | undefined;
  if (!product || product.published !== 1) throw new StoreError(404, "That product is not available.");
  const cart = cartRow(db, token, userId);
  const existing = db.prepare("SELECT qty FROM cart_items WHERE cart_id = ? AND product_id = ?").get(cart.id, product.id) as
    | { qty: number }
    | undefined;
  const requested = mode === "add" ? (existing?.qty ?? 0) + qty : qty;
  if (requested < 1) {
    db.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?").run(cart.id, product.id);
  } else {
    if (product.stock < 1) throw new StoreError(409, `${product.name} is out of stock.`);
    const next = Math.min(Math.floor(requested), product.stock);
    db.prepare(
      `INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)
       ON CONFLICT(cart_id, product_id) DO UPDATE SET qty = excluded.qty`,
    ).run(cart.id, product.id, next);
  }
  return readCart(token, userId);
}

export function clearCart(token: string, userId: number | null) {
  const db = getDb();
  const cart = cartRow(db, token, userId);
  db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
  db.prepare("UPDATE carts SET promo_code = NULL WHERE id = ?").run(cart.id);
  return readCart(token, userId);
}

export function applyCartPromo(token: string, userId: number | null, code: string) {
  const db = getDb();
  const cart = cartRow(db, token, userId);
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    db.prepare("UPDATE carts SET promo_code = NULL WHERE id = ?").run(cart.id);
    return readCart(token, userId);
  }
  const promo = db.prepare("SELECT code FROM promotions WHERE code = ?").get(trimmed);
  if (!promo) throw new StoreError(400, "That code is not recognized.");
  db.prepare("UPDATE carts SET promo_code = ? WHERE id = ?").run(trimmed, cart.id);
  return readCart(token, userId);
}

export function registerAccount(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  newsletter: boolean;
}) {
  const email = clean(input.email, 200).toLowerCase();
  const firstName = clean(input.firstName, 80);
  const lastName = clean(input.lastName, 80);
  if (!firstName || !lastName) throw new StoreError(400, "Add your first and last name.");
  if (!email.includes("@")) throw new StoreError(400, "Enter an email address.");
  if (input.password.length < 12 || !/[a-z]/.test(input.password) || !/[A-Z]/.test(input.password) || !/\d/.test(input.password)) {
    throw new StoreError(400, "Use 12 or more characters, with upper and lowercase letters and a number.");
  }
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) throw new StoreError(409, "An account with that email already exists. Sign in instead.");
  const result = db
    .prepare(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, newsletter, created_at)
       VALUES (?, ?, 'customer', ?, ?, '', ?, ?)`,
    )
    .run(email, hashPassword(input.password), firstName, lastName, input.newsletter ? 1 : 0, new Date().toISOString());
  const userId = Number(result.lastInsertRowid);
  db.prepare(
    `INSERT INTO addresses (user_id, street, apartment, city, region, postal, country) VALUES (?, '', '', '', '', '', 'United States')`,
  ).run(userId);
  return userId;
}

export function loginAccount(email: string, password: string) {
  const normalized = clean(email, 200).toLowerCase();
  if (!normalized.includes("@")) throw new StoreError(400, "Enter an email address.");
  if (!password) throw new StoreError(400, "Enter your password.");
  const db = getDb();
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const attempts = db.prepare("SELECT COUNT(*) AS count FROM login_attempts WHERE email = ? AND created_at > ?").get(normalized, since) as {
    count: number;
  };
  if (Number(attempts.count) >= 8) throw new StoreError(429, "Too many sign-in attempts. Wait a few minutes and try again.");
  const user = db.prepare("SELECT id, password_hash, role FROM users WHERE email = ?").get(normalized) as
    | { id: number; password_hash: string; role: "customer" | "admin" }
    | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    db.prepare("INSERT INTO login_attempts (email, created_at) VALUES (?, ?)").run(normalized, new Date().toISOString());
    throw new StoreError(401, "That email and password do not match an account.");
  }
  return { id: user.id, role: user.role };
}

export function profileFor(userId: number) {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
    | { email: string; role: string; first_name: string; last_name: string; phone: string; newsletter: number }
    | undefined;
  if (!user) throw new StoreError(401, "Sign in to continue.");
  const address = db.prepare("SELECT * FROM addresses WHERE user_id = ?").get(userId) as
    | AddressInput & { region: string; postal: string }
    | undefined;
  const region = address?.region ?? "";
  const postal = address?.postal ?? "";
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    street: address?.street ?? "",
    apartment: address?.apartment ?? "",
    city: address?.city ?? "",
    region: toAccountRegion(region, postal),
    state: region,
    postal,
    country: address?.country || "United States",
    newsletter: user.newsletter === 1,
    role: user.role,
  };
}

export function saveProfile(userId: number, input: Record<string, unknown>) {
  const firstName = clean(input.firstName, 80);
  const lastName = clean(input.lastName, 80);
  const email = clean(input.email, 200).toLowerCase();
  if (!firstName || !lastName) throw new StoreError(400, "Add your first and last name.");
  if (!email.includes("@")) throw new StoreError(400, "Enter an email address.");
  const parsed = input.region ? fromAccountRegion(String(input.region)) : { region: clean(input.state, 80), postal: clean(input.postal, 20) };
  const db = getDb();
  const taken = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, userId);
  if (taken) throw new StoreError(409, "That email is already used by another account.");
  db.prepare("UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, newsletter = ? WHERE id = ?").run(
    email,
    firstName,
    lastName,
    clean(input.phone, 40),
    input.newsletter ? 1 : 0,
    userId,
  );
  db.prepare(
    `INSERT INTO addresses (user_id, street, apartment, city, region, postal, country)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET street = excluded.street, apartment = excluded.apartment, city = excluded.city,
       region = excluded.region, postal = excluded.postal, country = excluded.country`,
  ).run(
    userId,
    clean(input.street, 200),
    clean(input.apartment, 80),
    clean(input.city, 80),
    parsed.region,
    parsed.postal || clean(input.postal, 20),
    clean(input.country, 80) || "United States",
  );
  return profileFor(userId);
}

export function changePassword(userId: number, current: string, next: string) {
  if (!current) throw new StoreError(400, "Enter your current password.");
  if (next.length < 12 || !/\d/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
    throw new StoreError(400, "Use at least 12 characters, including a number and a symbol.");
  }
  const db = getDb();
  const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId) as { password_hash: string };
  if (!verifyPassword(current, user.password_hash)) throw new StoreError(400, "That current password does not match.");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), userId);
}

export function requestReset(email: string, origin: string) {
  const normalized = clean(email, 200).toLowerCase();
  const db = getDb();
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(normalized) as { id: number } | undefined;
  if (!user) return;
  const token = randomToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash(token), user.id, expires);
  const link = `${origin}/reset-password?token=${token}`;
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
    void fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: normalized,
        subject: "Reset your PRIME password",
        text: `Use this link within one hour to choose a new password: ${link}`,
      }),
    }).catch((error: unknown) => console.error(error instanceof Error ? error.message : "reset email failed"));
  } else if (process.env.NODE_ENV !== "production") {
    console.info(`Password reset link for ${normalized}: ${link}`);
  }
}

export function resetPassword(token: string, password: string) {
  if (password.length < 12 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new StoreError(400, "Use at least 12 characters, including a number and a symbol.");
  }
  const db = getDb();
  const row = db.prepare("SELECT user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?").get(tokenHash(token)) as
    | { user_id: number; expires_at: string; used_at: string | null }
    | undefined;
  if (!row || row.used_at || row.expires_at < new Date().toISOString()) {
    throw new StoreError(400, "That reset link is invalid or expired.");
  }
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), row.user_id);
  db.prepare("UPDATE password_resets SET used_at = ? WHERE token_hash = ?").run(new Date().toISOString(), tokenHash(token));
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(row.user_id);
}

export function saveMessage(input: { name?: string; email?: string; topic?: string; body?: string }) {
  const name = clean(input.name, 80);
  const email = clean(input.email, 200).toLowerCase();
  const topic = clean(input.topic, 40) || "general";
  const body = clean(input.body, 2000);
  if (name.length < 2) throw new StoreError(400, "Add your name.");
  if (!email.includes("@")) throw new StoreError(400, "Enter a valid email address.");
  if (body.length < 8) throw new StoreError(400, "Add a message.");
  getDb()
    .prepare("INSERT INTO messages (name, email, topic, body, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(name, email, topic, body, new Date().toISOString());
}

export function subscribe(email: string) {
  const normalized = clean(email, 200).toLowerCase();
  if (!normalized.includes("@")) throw new StoreError(400, "Enter a valid email address.");
  getDb()
    .prepare("INSERT INTO subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING")
    .run(normalized, new Date().toISOString());
}

export function reviewsFor(slug: string) {
  const rows = getDb()
    .prepare(
      `SELECT reviews.id, reviews.name, reviews.title, reviews.body, reviews.rating, reviews.helpful, reviews.created_at
       FROM reviews JOIN products ON products.id = reviews.product_id WHERE products.slug = ? ORDER BY reviews.created_at DESC`,
    )
    .all(slug) as { id: number; name: string; title: string; body: string; rating: number; helpful: number; created_at: string }[];
  return rows.map(reviewJson);
}

function reviewJson(row: { id: number; name: string; title: string; body: string; rating: number; helpful: number; created_at: string }) {
  const date = new Date(row.created_at);
  const initials = row.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return {
    id: String(row.id),
    initials,
    name: row.name,
    title: row.title,
    body: row.body,
    rating: row.rating,
    date: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase(),
    dateValue: date.getFullYear() * 100 + date.getMonth() + 1,
    helpful: row.helpful,
  };
}

export function addReview(userId: number, slug: string, input: { name: string; title: string; body: string; rating: number }) {
  const name = clean(input.name, 80);
  const title = clean(input.title, 140);
  const body = clean(input.body, 2000);
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 0)));
  if (!name || !title || !body) throw new StoreError(400, "Add your name, a title, and the review.");
  const db = getDb();
  const product = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug) as { id: number } | undefined;
  if (!product) throw new StoreError(404, "That product was not found.");
  db.prepare(
    "INSERT INTO reviews (product_id, user_id, name, title, body, rating, helpful, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
  ).run(product.id, userId, name, title, body, rating, new Date().toISOString());
  return reviewsFor(slug);
}

export function markReviewHelpful(id: number) {
  const db = getDb();
  const result = db.prepare("UPDATE reviews SET helpful = helpful + 1 WHERE id = ?").run(id);
  if (Number(result.changes) !== 1) throw new StoreError(404, "That review was not found.");
}

type OrderRow = {
  id: number;
  public_id: string;
  user_id: number | null;
  receipt_token: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  delivery: string;
  payment_method: string;
  payment_state: string;
  fulfillment: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  promo_code: string | null;
  tracking: string;
  stock_reserved: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
};

const seedEstimates: Record<string, { deliveryLabel: string; deliveryTitle: string; placedLabel: string }> = {
  "VY-10482": { placedLabel: "OCT 28, 2026", deliveryLabel: "NOVEMBER 2–4, 2026", deliveryTitle: "ESTIMATED STANDARD DELIVERY" },
  "VY-09861": { placedLabel: "SEP 16, 2026", deliveryLabel: "SEPTEMBER 21, 2026", deliveryTitle: "DELIVERED" },
  "VY-09024": { placedLabel: "AUG 7, 2026", deliveryLabel: "AUGUST 12, 2026", deliveryTitle: "DELIVERED" },
};

function customerOrder(db: DatabaseSync, order: OrderRow) {
  const items = db.prepare("SELECT line_id, name, detail, qty, unit_price_cents FROM order_items WHERE order_id = ?").all(order.id) as {
    line_id: string;
    name: string;
    detail: string;
    qty: number;
    unit_price_cents: number;
  }[];
  const packs = items.reduce((sum, item) => sum + item.qty, 0);
  const known = seedEstimates[order.public_id];
  const placed = new Date(order.created_at);
  const delivered = order.fulfillment === "Delivered";
  const cancelled = order.payment_state === "cancelled";
  return {
    id: order.public_id,
    placedLabel: known?.placedLabel ?? placed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase(),
    deliveryLabel: known?.deliveryLabel ?? (delivered ? placed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase() : "2–7 BUSINESS DAYS"),
    deliveryTitle: known?.deliveryTitle ?? (order.delivery === "express" ? "ESTIMATED EXPRESS DELIVERY" : "ESTIMATED STANDARD DELIVERY"),
    status: delivered ? "delivered" : cancelled ? "cancelled" : "received",
    statusLabel: cancelled ? "CANCELLED" : delivered ? "DELIVERED" : order.payment_state === "paid" ? "PAYMENT RECEIVED" : "ORDER RECEIVED",
    deliveredNote: delivered ? known?.deliveryLabel.replaceAll("–", "-") : undefined,
    summary: items.map((item) => `${item.name} × ${item.qty}`).join(" · "),
    lines: items.map((item) => ({
      id: item.line_id,
      label: item.line_id === "discovery" ? "Discovery Drop" : `${item.name} packs`,
      qty: item.qty,
      price: dollars(item.unit_price_cents),
    })),
    email: order.email,
    firstName: order.first_name,
    lastName: order.last_name,
    street: order.street,
    apartment: order.apartment,
    city: order.city,
    state: order.region,
    zip: order.postal,
    country: order.country,
    phone: order.phone,
    payment: order.payment_method,
    sameBilling: true,
    delivery: order.delivery,
    subtotal: dollars(order.subtotal_cents),
    discount: dollars(order.discount_cents),
    shipping: dollars(order.shipping_cents),
    tax: dollars(order.tax_cents),
    total: dollars(order.total_cents),
    packs,
    cans: packs * 12,
    paymentState: order.payment_state === "pending_payment" ? "pending" : order.payment_state,
    fulfillment: order.fulfillment,
    tracking: order.tracking,
    cancellable:
      (order.payment_state === "pending_payment" || order.payment_state === "pending") &&
      order.fulfillment !== "Delivered" &&
      order.fulfillment !== "Dispatched",
  };
}

export function listCustomerOrders(userId: number) {
  const db = getDb();
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(userId) as OrderRow[];
  return orders.map((order) => customerOrder(db, order));
}

export function orderVisible(order: OrderRow, user: { id: number; role: string } | null, receipts: Record<string, string>) {
  if (user?.role === "admin") return true;
  if (user && order.user_id === user.id) return true;
  return receipts[order.public_id] === order.receipt_token;
}

export function getCustomerOrder(publicId: string, user: { id: number; role: string } | null, receipts: Record<string, string>) {
  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE public_id = ?").get(publicId) as OrderRow | undefined;
  if (!order || !orderVisible(order, user, receipts)) return null;
  return customerOrder(db, order);
}

export function checkout(input: {
  token: string;
  userId: number | null;
  idempotencyKey: string;
  delivery: "standard" | "express";
  payment: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: AddressInput;
}) {
  const key = clean(input.idempotencyKey, 80);
  if (key.length < 8) throw new StoreError(400, "The checkout request is missing an idempotency key.");
  const email = clean(input.email, 200).toLowerCase();
  const firstName = clean(input.firstName, 80);
  const lastName = clean(input.lastName, 80);
  if (!email.includes("@") || !firstName || !lastName || !input.address.street || !input.address.city || !input.address.postal) {
    throw new StoreError(400, "Add an email and a complete shipping address before placing the order.");
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
    throw new StoreError(
      503,
      "Card checkout needs STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and NEXT_PUBLIC_APP_URL. No order was created and no card was charged.",
    );
  }
  const db = getDb();
  const existing = db.prepare("SELECT public_id, payment_state, stripe_session_id FROM orders WHERE idempotency_key = ?").get(key) as
    | { public_id: string; payment_state: string; stripe_session_id: string | null }
    | undefined;
  if (existing) {
    return { orderId: existing.public_id, paymentState: existing.payment_state, stripeSessionId: existing.stripe_session_id, reused: true };
  }
  const cart = cartRow(db, input.token, input.userId);
  const lines = db
    .prepare(
      `SELECT products.id, products.slug, products.name, products.detail, products.price_cents, products.stock, cart_items.qty
       FROM cart_items JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.cart_id = ? AND products.published = 1`,
    )
    .all(cart.id) as { id: number; slug: string; name: string; detail: string; price_cents: number; stock: number; qty: number }[];
  if (lines.length === 0) throw new StoreError(400, "Your bag is empty.");
  const promo = evaluatePromo(db, cart.promo_code, lines.reduce((sum, line) => sum + line.price_cents * line.qty, 0));
  const store = settings(db);
  const priced = quote({
    lines: lines.map((line) => ({ qty: line.qty, priceCents: line.price_cents })),
    delivery: input.delivery,
    discountCents: promo.valid ? promo.discountCents : 0,
    standardCents: store.standardCents,
    expressCents: store.expressCents,
    freeMinimumCents: store.freeMinimumCents,
  });
  const publicId = nextOrderId(db);
  const receipt = randomToken();
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const line of lines) {
      const result = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?").run(line.qty, line.id, line.qty);
      if (Number(result.changes) !== 1) throw new StoreError(409, `${line.name} does not have enough packs in stock.`);
      db.prepare("INSERT INTO inventory_moves (product_id, delta, reason, order_public_id, created_at) VALUES (?, ?, 'reserve', ?, ?)").run(
        line.id,
        -line.qty,
        publicId,
        new Date().toISOString(),
      );
    }
    if (promo.valid && cart.promo_code) {
      const updated = db
        .prepare("UPDATE promotions SET uses = uses + 1 WHERE code = ? AND uses < max_uses AND active = 1")
        .run(cart.promo_code);
      if (Number(updated.changes) !== 1) throw new StoreError(409, "That code has reached its use limit.");
    }
    const inserted = db
      .prepare(
        `INSERT INTO orders (
          public_id, user_id, receipt_token, idempotency_key, email, first_name, last_name, phone, street, apartment, city, region, postal, country,
          delivery, payment_method, payment_state, fulfillment, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents, promo_code,
          tracking, stock_reserved, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'Preparing', ?, ?, ?, ?, ?, ?, '', 1, ?)`,
      )
      .run(
        publicId,
        input.userId,
        receipt,
        key,
        email,
        firstName,
        lastName,
        clean(input.phone, 40),
        clean(input.address.street, 200),
        clean(input.address.apartment, 80),
        clean(input.address.city, 80),
        clean(input.address.region, 80),
        clean(input.address.postal, 20),
        clean(input.address.country, 80) || "United States",
        input.delivery,
        input.payment === "apple" || input.payment === "google" ? input.payment : "card",
        priced.subtotal,
        priced.discount,
        priced.shipping,
        priced.tax,
        priced.total,
        promo.valid ? promo.code : null,
        new Date().toISOString(),
      );
    const orderId = Number(inserted.lastInsertRowid);
    const item = db.prepare(
      "INSERT INTO order_items (order_id, product_id, line_id, name, detail, qty, unit_price_cents) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    for (const line of lines) item.run(orderId, line.id, lineIdFor(line.slug), line.name, line.detail, line.qty, line.price_cents);
    db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
    db.prepare("UPDATE carts SET promo_code = NULL WHERE id = ?").run(cart.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { orderId: publicId, paymentState: "pending_payment", stripeSessionId: null, reused: false, receipt };
}

export function attachStripeSession(publicId: string, sessionId: string) {
  getDb().prepare("UPDATE orders SET stripe_session_id = ? WHERE public_id = ? AND stripe_session_id IS NULL").run(sessionId, publicId);
}

export function failReservedOrder(publicId: string) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    releaseReservation(db, publicId, "failed");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function releaseReservation(db: DatabaseSync, publicId: string, nextState: "failed" | "cancelled") {
  const order = db.prepare("SELECT id, payment_state, stock_reserved, promo_code FROM orders WHERE public_id = ?").get(publicId) as
    | { id: number; payment_state: string; stock_reserved: number; promo_code: string | null }
    | undefined;
  if (!order || order.payment_state === "paid" || order.payment_state === "refunded") return;
  if (order.stock_reserved) {
    const items = db.prepare("SELECT product_id, qty FROM order_items WHERE order_id = ?").all(order.id) as {
      product_id: number | null;
      qty: number;
    }[];
    for (const item of items) {
      if (!item.product_id) continue;
      db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").run(item.qty, item.product_id);
      db.prepare("INSERT INTO inventory_moves (product_id, delta, reason, order_public_id, created_at) VALUES (?, ?, 'release', ?, ?)").run(
        item.product_id,
        item.qty,
        publicId,
        new Date().toISOString(),
      );
    }
    if (order.promo_code) db.prepare("UPDATE promotions SET uses = MAX(uses - 1, 0) WHERE code = ?").run(order.promo_code);
    db.prepare("UPDATE orders SET stock_reserved = 0 WHERE id = ?").run(order.id);
  }
  if (order.payment_state === "pending_payment" || order.payment_state === "pending" || order.payment_state === "failed") {
    db.prepare("UPDATE orders SET payment_state = ?, fulfillment = 'Unfulfilled' WHERE id = ? AND payment_state != 'paid'").run(nextState, order.id);
  }
}

export function markOrderPaid(publicId: string, paymentIntent: string | null, amountTotal: number | null) {
  const db = getDb();
  const order = db.prepare("SELECT id, total_cents, payment_state FROM orders WHERE public_id = ?").get(publicId) as
    | { id: number; total_cents: number; payment_state: string }
    | undefined;
  if (!order) return false;
  if (order.payment_state === "paid") return true;
  if (amountTotal !== null && amountTotal !== order.total_cents) {
    console.error(`Payment amount mismatch for ${publicId}`);
    return false;
  }
  db.prepare("UPDATE orders SET payment_state = 'paid', stripe_payment_intent = COALESCE(?, stripe_payment_intent) WHERE id = ? AND payment_state = 'pending_payment'").run(
    paymentIntent,
    order.id,
  );
  return true;
}

export function cancelOrder(publicId: string, user: { id: number; role: string } | null, receipts: Record<string, string>) {
  const db = getDb();
  const order = db.prepare("SELECT * FROM orders WHERE public_id = ?").get(publicId) as OrderRow | undefined;
  if (!order || !orderVisible(order, user, receipts)) throw new StoreError(404, "That order was not found.");
  if (order.payment_state === "paid" || order.payment_state === "refunded") {
    throw new StoreError(409, "Paid orders are cancelled by the store team so the refund can be verified.");
  }
  if (order.fulfillment === "Dispatched" || order.fulfillment === "Delivered") {
    throw new StoreError(409, "This order is already on the way.");
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    releaseReservation(db, publicId, "cancelled");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return getCustomerOrder(publicId, user, receipts);
}

export function orderForStripe(publicId: string) {
  return getDb().prepare("SELECT * FROM orders WHERE public_id = ?").get(publicId) as OrderRow | undefined;
}

export function expireCheckout(publicId: string) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    releaseReservation(db, publicId, "cancelled");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function nextOrderId(db: DatabaseSync) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = `VY-${Math.floor(10000 + Math.random() * 90000)}`;
    const taken = db.prepare("SELECT id FROM orders WHERE public_id = ?").get(id);
    if (!taken) return id;
  }
  return `VY-${Date.now().toString().slice(-8)}`;
}

const paymentLabel: Record<string, "Pending" | "Paid" | "Failed" | "Cancelled" | "Historical" | "Refunded"> = {
  pending_payment: "Pending",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  historical: "Historical",
  refunded: "Refunded",
};

const adminDates: Record<string, { dateLabel: string; placedLabel: string; estimate: string }> = {
  "VY-10482": { dateLabel: "Oct 28", placedLabel: "Oct 28, 2026", estimate: "Nov 2–4, 2026" },
  "VY-09861": { dateLabel: "Sep 16", placedLabel: "Sep 16, 2026", estimate: "Delivered Sep 21, 2026" },
  "VY-09861-note": { dateLabel: "Sep 16", placedLabel: "Sep 16, 2026", estimate: "Delivered Sep 21, 2026" },
  "VY-09024": { dateLabel: "Aug 7", placedLabel: "Aug 7, 2026", estimate: "Delivered Aug 12, 2026" },
};

export function adminSnapshot() {
  const db = getDb();
  const products = (db.prepare(`${productQuery()} ORDER BY products.id`).all() as ProductRow[]).map((product) => ({
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    detail: product.detail,
    price: dollars(product.price_cents),
    stock: product.stock,
    published: product.published === 1,
    image: product.admin_image || product.image,
  }));
  const orders = (db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as OrderRow[]).map((order) => adminOrder(db, order));
  return { products, orders };
}

function adminOrder(db: DatabaseSync, order: OrderRow) {
  const items = db
    .prepare(
      `SELECT order_items.name, order_items.detail, order_items.qty, order_items.unit_price_cents, products.admin_image, products.image
       FROM order_items LEFT JOIN products ON products.id = order_items.product_id WHERE order_items.order_id = ?`,
    )
    .all(order.id) as { name: string; detail: string; qty: number; unit_price_cents: number; admin_image: string | null; image: string | null }[];
  const packs = items.reduce((sum, item) => sum + item.qty, 0);
  const known = adminDates[order.public_id];
  const placed = new Date(order.created_at);
  const payment = paymentLabel[order.payment_state] ?? "Pending";
  const summary = items.map((item) => `${item.qty} ${item.name}`).join(" + ");
  return {
    id: order.public_id,
    dateLabel: known?.dateLabel ?? placed.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    placedLabel: known?.placedLabel ?? placed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    customer: `${order.first_name} ${order.last_name}`.trim(),
    email: order.email,
    phone: order.phone,
    packs,
    cans: packs * 12,
    subtotal: dollars(order.subtotal_cents),
    discount: dollars(order.discount_cents),
    shipping: dollars(order.shipping_cents),
    tax: dollars(order.tax_cents),
    total: dollars(order.total_cents),
    delivery: order.delivery === "express" ? "Express delivery" : "Standard delivery",
    estimate: known?.estimate ?? (order.fulfillment === "Delivered" ? "Delivered" : "2–7 business days"),
    payment,
    fulfillment: order.fulfillment,
    tracking: order.tracking,
    summary: `${summary}. ${packs} ${packs === 1 ? "pack" : "packs"} / ${packs * 12} cans.`,
    address: [`${order.street}${order.apartment ? `, ${order.apartment}` : ""}`, `${order.city}, ${order.region} ${order.postal}`, order.country].filter(Boolean),
    lines: items.map((item) => ({
      name: item.name,
      detail: item.detail,
      quantity: item.qty,
      price: dollars(item.unit_price_cents * item.qty),
      image: item.admin_image || item.image || "/images/admin/static-lime.png",
    })),
    activity: [
      {
        title: `Fulfillment set to ${order.fulfillment}`,
        detail: order.tracking ? `Tracking ${order.tracking}` : "PRIME team",
      },
      {
        title: payment === "Paid" ? "Payment received" : payment === "Historical" ? "Opening record" : `Payment ${payment.toLowerCase()}`,
        detail: payment === "Paid" ? "Verified with the payment provider." : "No card number is stored.",
      },
    ],
    refundable: order.payment_state === "paid" && Boolean(order.stripe_payment_intent),
  };
}

export function saveAdminProduct(input: Record<string, unknown>, originalSku: string) {
  const sku = clean(input.sku, 40);
  const name = clean(input.name, 120);
  if (!sku || !name || sku.toLowerCase() === "new") throw new StoreError(400, "Add a product name and SKU before saving.");
  const price = Number(input.price);
  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  if (!Number.isFinite(price) || price < 0) throw new StoreError(400, "Enter a price in USD.");
  const image = String(input.image ?? "");
  if (image.startsWith("data:") && image.length > 1_500_000) throw new StoreError(400, "That image is too large. Use a smaller file.");
  const db = getDb();
  const categoryName = clean(input.category, 80) || "Single flavors";
  db.prepare("INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING").run(categoryName);
  const category = db.prepare("SELECT id FROM categories WHERE name = ?").get(categoryName) as { id: number };
  const current = originalSku ? (db.prepare("SELECT * FROM products WHERE sku = ?").get(originalSku) as ProductRow | undefined) : undefined;
  const duplicate = db.prepare("SELECT sku FROM products WHERE sku = ? AND sku != ?").get(sku, originalSku || "");
  if (duplicate) throw new StoreError(409, "That SKU is already in the catalog.");
  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = current?.slug ?? uniqueSlug(db, slugBase || sku.toLowerCase());
  const priceCents = Math.round(price * 100);
  if (current) {
    const delta = stock - current.stock;
    db.prepare(
      `UPDATE products SET sku = ?, name = ?, description = ?, category_id = ?, detail = ?, price_cents = ?, stock = ?, published = ?, admin_image = ?
       WHERE sku = ?`,
    ).run(
      sku,
      name,
      clean(input.description, 500),
      category.id,
      clean(input.detail, 120) || "12 × 330 ml",
      priceCents,
      stock,
      input.published ? 1 : 0,
      image || current.admin_image,
      originalSku,
    );
    if (delta !== 0) {
      db.prepare("INSERT INTO inventory_moves (product_id, delta, reason, created_at) VALUES (?, ?, 'adjustment', ?)").run(
        current.id,
        delta,
        new Date().toISOString(),
      );
    }
  } else {
    db.prepare(
      `INSERT INTO products (sku, slug, name, description, category_id, detail, price_cents, stock, published, image, admin_image, accent, traits, code, alt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '#cdff3f', '', '', ?)`,
    ).run(
      sku,
      slug,
      name,
      clean(input.description, 500),
      category.id,
      clean(input.detail, 120) || "12 × 330 ml",
      priceCents,
      stock,
      input.published ? 1 : 0,
      image.startsWith("/") ? image : "/images/products/static-lime.png",
      image || "/images/admin/static-lime.png",
      name,
    );
  }
  return adminSnapshot();
}

function uniqueSlug(db: DatabaseSync, base: string) {
  let slug = base || "product";
  let index = 2;
  while (db.prepare("SELECT id FROM products WHERE slug = ?").get(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

export function deleteAdminProduct(sku: string) {
  const db = getDb();
  const product = db.prepare("SELECT id FROM products WHERE sku = ?").get(sku) as { id: number } | undefined;
  if (!product) throw new StoreError(404, "That product was not found.");
  db.prepare("DELETE FROM cart_items WHERE product_id = ?").run(product.id);
  db.prepare("DELETE FROM products WHERE id = ?").run(product.id);
  return adminSnapshot();
}

export function updateFulfillment(publicId: string, fulfillment: string, tracking: string) {
  const allowed = ["Unfulfilled", "Preparing", "Dispatched", "Delivered"];
  if (!allowed.includes(fulfillment)) throw new StoreError(400, "Choose a fulfillment status from the list.");
  const db = getDb();
  const result = db.prepare("UPDATE orders SET fulfillment = ?, tracking = ? WHERE public_id = ?").run(fulfillment, clean(tracking, 80), publicId);
  if (Number(result.changes) !== 1) throw new StoreError(404, "That order was not found.");
  return adminSnapshot();
}

export function markRefunded(publicId: string) {
  const db = getDb();
  const order = db.prepare("SELECT id, payment_state, stock_reserved FROM orders WHERE public_id = ?").get(publicId) as
    | { id: number; payment_state: string; stock_reserved: number }
    | undefined;
  if (!order || order.payment_state !== "paid") throw new StoreError(409, "Only a paid order can be refunded.");
  db.exec("BEGIN IMMEDIATE");
  try {
    if (order.stock_reserved) {
      const items = db.prepare("SELECT product_id, qty FROM order_items WHERE order_id = ?").all(order.id) as { product_id: number | null; qty: number }[];
      for (const item of items) {
        if (!item.product_id) continue;
        db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").run(item.qty, item.product_id);
      }
    }
    db.prepare("UPDATE orders SET payment_state = 'refunded', fulfillment = 'Unfulfilled', stock_reserved = 0 WHERE id = ?").run(order.id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
