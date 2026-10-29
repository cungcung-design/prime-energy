import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb } from "@/lib/db";
import { randomToken } from "@/lib/passwords";

const sessionCookie = "prime_session";
const cartCookie = "prime_cart";
const receiptCookie = "prime_receipts";

export type SessionUser = {
  id: number;
  email: string;
  role: "customer" | "admin";
  firstName: string;
  lastName: string;
  phone: string;
  newsletter: boolean;
};

export class StoreError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new StoreError(500, "Set SESSION_SECRET in the environment to a long random value.");
  }
  return secret;
}

export function tokenHash(token: string) {
  return createHash("sha256").update(`${sessionSecret()}:${token}`).digest("hex");
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function currentUser(): Promise<SessionUser | null> {
  await connection();
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT users.id, users.email, users.role, users.first_name, users.last_name, users.phone, users.newsletter
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
    )
    .get(tokenHash(token), new Date().toISOString()) as
    | {
        id: number;
        email: string;
        role: "customer" | "admin";
        first_name: string;
        last_name: string;
        phone: string;
        newsletter: number;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    newsletter: row.newsletter === 1,
  };
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new StoreError(401, "Sign in to continue.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new StoreError(403, "This action is limited to the store team.");
  return user;
}

export async function startSession(userId: number, remember: boolean) {
  const token = randomToken();
  const seconds = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
  const expires = new Date(Date.now() + seconds * 1000).toISOString();
  getDb().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(tokenHash(token), userId, expires);
  const jar = await cookies();
  jar.set(sessionCookie, token, cookieOptions(seconds));
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
  jar.delete(sessionCookie);
}

export async function cartToken() {
  const jar = await cookies();
  const existing = jar.get(cartCookie)?.value;
  if (existing) return existing;
  const token = randomToken();
  jar.set(cartCookie, token, cookieOptions(60 * 60 * 24 * 30));
  return token;
}

export async function readReceipts() {
  const jar = await cookies();
  const raw = jar.get(receiptCookie)?.value;
  if (!raw) return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function rememberReceipt(publicId: string, receipt: string) {
  const current = await readReceipts();
  const next = { ...current, [publicId]: receipt };
  const entries = Object.entries(next).slice(-20);
  const jar = await cookies();
  jar.set(receiptCookie, JSON.stringify(Object.fromEntries(entries)), cookieOptions(60 * 60 * 24 * 30));
}

export function errorResponse(error: unknown) {
  if (error instanceof StoreError) return Response.json({ error: error.message }, { status: error.status });
  console.error(error instanceof Error ? error.message : "request failed");
  return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
}
