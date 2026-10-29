import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/passwords";

type GlobalDb = { primeDb?: DatabaseSync };

const globalDb = globalThis as typeof globalThis & GlobalDb;

export function openDatabase(file = databasePath()) {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  migrate(db);
  seed(db);
  return db;
}

export function getDb() {
  if (!globalDb.primeDb) globalDb.primeDb = openDatabase();
  else migrate(globalDb.primeDb);
  return globalDb.primeDb;
}

function databasePath() {
  if (process.env.PRIME_DB_PATH) return process.env.PRIME_DB_PATH;
  return path.join(process.cwd(), "data", "prime.sqlite");
}

function migrate(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      newsletter INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      used_at TEXT
    );
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      street TEXT NOT NULL,
      apartment TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      postal TEXT NOT NULL,
      country TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      detail TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      published INTEGER NOT NULL,
      image TEXT NOT NULL,
      admin_image TEXT NOT NULL,
      accent TEXT NOT NULL,
      traits TEXT NOT NULL,
      code TEXT NOT NULL,
      alt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      promo_code TEXT
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      qty INTEGER NOT NULL,
      PRIMARY KEY (cart_id, product_id)
    );
    CREATE TABLE IF NOT EXISTS promotions (
      code TEXT PRIMARY KEY,
      percent_off INTEGER NOT NULL,
      min_subtotal_cents INTEGER NOT NULL,
      expires_at TEXT,
      max_uses INTEGER NOT NULL,
      uses INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY,
      public_id TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      receipt_token TEXT NOT NULL,
      idempotency_key TEXT UNIQUE,
      email TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      apartment TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL,
      region TEXT NOT NULL,
      postal TEXT NOT NULL,
      country TEXT NOT NULL,
      delivery TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      payment_state TEXT NOT NULL,
      fulfillment TEXT NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      discount_cents INTEGER NOT NULL,
      shipping_cents INTEGER NOT NULL,
      tax_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      promo_code TEXT,
      stripe_session_id TEXT UNIQUE,
      stripe_payment_intent TEXT,
      tracking TEXT NOT NULL DEFAULT '',
      stock_reserved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      line_id TEXT NOT NULL,
      name TEXT NOT NULL,
      detail TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory_moves (
      id INTEGER PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      order_public_id TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      rating INTEGER NOT NULL,
      helpful INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS subscribers (
      email TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      topic TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function seed(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (count.count > 0) return;
  const now = new Date().toISOString();
  const category = db.prepare("INSERT INTO categories (name) VALUES (?)");
  category.run("Single flavors");
  category.run("Discovery");
  category.run("Limited");
  const single = (db.prepare("SELECT id FROM categories WHERE name = ?").get("Single flavors") as { id: number }).id;
  const discovery = (db.prepare("SELECT id FROM categories WHERE name = ?").get("Discovery") as { id: number }).id;

  const insert = db.prepare(`
    INSERT INTO products (sku, slug, name, description, category_id, detail, price_cents, stock, published, image, admin_image, accent, traits, code, alt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const products = [
    ["PR-SL-12", "static-lime", "Static Lime", "Sharp lime. Crisp yuzu. A high-voltage citrus finish.", single, "12 × 330 ml", 3200, 432, 1, "/images/products/static-lime.png", "/images/admin/static-lime.png", "#cdff3f", "BRIGHT / FEARLESS / ORIGINAL", "001 / PRIME ENERGY", "Static Lime can on a dark pedestal"],
    ["PR-SP-12", "solar-peach", "Solar Peach", "Ripe white peach meets a flash of blood orange.", single, "12 × 330 ml", 3200, 18, 1, "/images/products/solar-peach.png", "/images/admin/solar-peach.png", "#ff9b53", "JUICY / WARM / UNFILTERED", "002 / PRIME ENERGY", "Solar Peach can on a dark pedestal"],
    ["PR-NB-12", "night-berry", "Night Berry", "Dark blackberry. Tart blackcurrant. After-hours energy.", single, "12 × 330 ml", 3200, 0, 1, "/images/products/night-berry.png", "/images/admin/night-berry.png", "#c8a5ff", "DARK / DEEP / UNEXPECTED", "003 / PRIME ENERGY", "Night Berry can on a dark pedestal"],
    ["PR-GR-12", "glacial-rush", "Glacial Rush", "Cool blue raspberry with an ice-clean citrus edge.", single, "12 × 330 ml", 3200, 286, 1, "/images/products/glacial-rush.png", "/images/admin/glacial-rush.png", "#94dce1", "COOL / CRISP / RELENTLESS", "004 / PRIME ENERGY", "Glacial Rush can on a dark pedestal"],
    ["PR-DD-12", "discovery", "Discovery Drop", "All four flavors. Three of each. Your all-access pass to the PRIME universe. Start here. Go anywhere.", discovery, "12 × 330 ml · 3 of each flavor", 3200, 96, 1, "/images/products/discovery-pack.png", "/images/admin/discovery.png", "#cdff3f", "ALL FOUR / ALL IN", "005 / PRIME ENERGY", "PRIME variety pack with four flavor cans"],
  ] as const;
  for (const product of products) insert.run(...product);

  db.prepare(`
    INSERT INTO promotions (code, percent_off, min_subtotal_cents, expires_at, max_uses, uses, active)
    VALUES ('PRIME10', 10, 6400, '2027-12-31T00:00:00.000Z', 100, 0, 1)
  `).run();

  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("standard_cents", "0");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("express_cents", "900");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("free_minimum_cents", "6400");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("tax_rate", "0.085");

  if (process.env.NODE_ENV === "production" && !process.env.SEED_CUSTOMER_PASSWORD) return;

  const customerPassword = process.env.SEED_CUSTOMER_PASSWORD ?? "JordanEllis#10482";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "PrimeAdmin#2026";
  const user = db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone, newsletter, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  user.run("jordan.ellis@example.com", hashPassword(customerPassword), "customer", "Jordan", "Ellis", "(415) 555-0142", 1, now);
  user.run("admin@prime.energy", hashPassword(adminPassword), "admin", "PRIME", "Team", "", 0, now);
  const jordan = db.prepare("SELECT id FROM users WHERE email = ?").get("jordan.ellis@example.com") as { id: number };
  db.prepare(`
    INSERT INTO addresses (user_id, street, apartment, city, region, postal, country)
    VALUES (?, '184 Valencia Street', 'Apt 4', 'San Francisco', 'California', '94103', 'United States')
  `).run(jordan.id);

  const lime = db.prepare("SELECT id FROM products WHERE slug = ?").get("static-lime") as { id: number };
  const peach = db.prepare("SELECT id FROM products WHERE slug = ?").get("solar-peach") as { id: number };
  const berry = db.prepare("SELECT id FROM products WHERE slug = ?").get("night-berry") as { id: number };
  const drop = db.prepare("SELECT id FROM products WHERE slug = ?").get("discovery") as { id: number };
  const order = db.prepare(`
    INSERT INTO orders (
      public_id, user_id, receipt_token, email, first_name, last_name, phone, street, apartment, city, region, postal, country,
      delivery, payment_method, payment_state, fulfillment, subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
      tracking, stock_reserved, created_at
    ) VALUES (?, ?, ?, 'jordan.ellis@example.com', 'Jordan', 'Ellis', '(415) 555-0142', '184 Valencia Street', 'Apt 4', 'San Francisco', 'California', '94103', 'United States', ?, 'card', ?, ?, ?, 0, ?, ?, ?, '', 0, ?)
  `);
  order.run("VY-10482", jordan.id, "seed-10482", "standard", "pending_payment", "Preparing", 9600, 0, 816, 10416, "2026-10-28T18:38:00.000Z");
  order.run("VY-09861", jordan.id, "seed-09861", "standard", "historical", "Delivered", 6400, 0, 544, 6944, "2026-09-16T15:00:00.000Z");
  order.run("VY-09024", jordan.id, "seed-09024", "standard", "historical", "Delivered", 3200, 0, 772, 3972, "2026-08-07T15:00:00.000Z");
  const item = db.prepare(`
    INSERT INTO order_items (order_id, product_id, line_id, name, detail, qty, unit_price_cents)
    VALUES ((SELECT id FROM orders WHERE public_id = ?), ?, ?, ?, ?, ?, 3200)
  `);
  item.run("VY-10482", lime.id, "static-lime-pack", "Static Lime", "12 × 330 ml", 2);
  item.run("VY-10482", drop.id, "discovery", "Discovery Drop", "12 × 330 ml · 3 of each flavor", 1);
  item.run("VY-09861", peach.id, "solar-peach-pack", "Solar Peach", "12 × 330 ml", 1);
  item.run("VY-09861", berry.id, "night-berry-pack", "Night Berry", "12 × 330 ml", 1);
  item.run("VY-09024", drop.id, "discovery", "Discovery Drop", "12 × 330 ml · 3 of each flavor", 1);

  const review = db.prepare(`
    INSERT INTO reviews (product_id, name, title, body, rating, helpful, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  review.run(lime.id, "Maya Chen", "Sharp, clean and perfect for late-night runs", "Bright lime and a crisp yuzu finish. The 12-pack fits neatly in the fridge, and the cans arrived well protected.", 5, 24, "2026-03-01T00:00:00.000Z");
  review.run(lime.id, "Jordan Kim", "Zero sugar, zero compromise on flavor", "I’ve tried every zero-sugar energy on the market, and Static Lime is the only one that doesn’t feel like a compromise. The yuzu note is subtle, but it makes the whole can feel premium.", 4, 18, "2026-02-01T00:00:00.000Z");
  review.run(lime.id, "Alex Rivera", "My go-to for long studio nights", "The citrus is crisp and refreshing when served cold. I like the silver-and-black can design and the easy-to-store 12-pack.", 5, 31, "2026-01-01T00:00:00.000Z");
}
