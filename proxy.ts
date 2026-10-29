import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function withCart(request: NextRequest, response: NextResponse) {
  if (request.cookies.get("prime_cart")?.value) return response;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  response.cookies.set("prime_cart", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get("prime_session")?.value;
  if ((path.startsWith("/admin") || path.startsWith("/account")) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return withCart(request, NextResponse.redirect(url));
  }
  return withCart(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
