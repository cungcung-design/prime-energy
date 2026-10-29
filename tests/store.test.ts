import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { applyCartPromo, checkout, mutateCart } from "@/lib/commerce";
import { openDatabase } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { quote } from "@/lib/pricing";

process.env.SESSION_SECRET = "test-session-secret-value";

test("quote keeps the designed pack totals and applies a percent discount before tax", () => {
  const plain = quote({
    lines: [
      { qty: 2, priceCents: 3200 },
      { qty: 1, priceCents: 3200 },
    ],
    delivery: "standard",
  });
  assert.equal(plain.subtotal, 9600);
  assert.equal(plain.shipping, 0);
  assert.equal(plain.tax, 816);
  assert.equal(plain.total, 10416);

  const discounted = quote({
    lines: [{ qty: 2, priceCents: 3200 }],
    delivery: "express",
    discountCents: 640,
  });
  assert.equal(discounted.taxable, 5760);
  assert.equal(discounted.shipping, 900);
  assert.equal(discounted.tax, Math.round(5760 * 0.085));
});

test("passwords verify only the original secret", () => {
  const stored = hashPassword("JordanEllis#10482");
  assert.equal(verifyPassword("JordanEllis#10482", stored), true);
  assert.equal(verifyPassword("wrong-password", stored), false);
});

test("stock reservation cannot oversell and a repeated checkout key is reused", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "prime-"));
  process.env.PRIME_DB_PATH = path.join(dir, "prime.sqlite");
  const token = "cart-token-for-test";
  assert.throws(() => mutateCart(token, null, "night-berry", 1, "set"), /out of stock/);
  const priced = mutateCart(token, null, "static-lime", 2, "set");
  const discounted = applyCartPromo(token, null, "PRIME10");
  assert.equal(priced.lines[0]?.qty, 2);
  assert.equal(discounted.discount, 6.4);
  assert.throws(() => applyCartPromo(token, null, "NOPE"), /not recognized/);
  const input = {
    token,
    userId: null,
    idempotencyKey: "idem-10482-test",
    delivery: "standard" as const,
    payment: "card",
    email: "guest@example.com",
    firstName: "Guest",
    lastName: "Buyer",
    phone: "4155550100",
    address: {
      street: "1 Market Street",
      apartment: "",
      city: "San Francisco",
      region: "California",
      postal: "94103",
      country: "United States",
    },
  };
  assert.throws(() => checkout(input), /STRIPE_SECRET_KEY/);
  const again = openDatabase(process.env.PRIME_DB_PATH);
  const stock = again.prepare("SELECT stock FROM products WHERE slug = ?").get("static-lime") as { stock: number };
  const orders = again.prepare("SELECT COUNT(*) AS count FROM orders WHERE idempotency_key = ?").get("idem-10482-test") as {
    count: number;
  };
  assert.equal(stock.stock, 432);
  assert.equal(Number(orders.count), 0);
  again.close();
});
