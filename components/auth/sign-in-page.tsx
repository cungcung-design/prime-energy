"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { signInAccount } from "@/lib/account";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignInPage() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("jordan.ellis@example.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-8 lg:px-10 lg:py-10 xl:flex-row xl:items-start xl:gap-24 xl:p-16">
        <section className="relative h-[420px] w-full overflow-hidden sm:h-[520px] xl:h-[680px] xl:w-[600px] xl:shrink-0">
          <ImagePanel src="/images/account/sign-in.png" alt="PRIME can on dark stone" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(9,11,10,0.06)] to-[rgba(9,11,10,0.94)]" />
          <div className="absolute inset-x-6 bottom-7 flex flex-col gap-5 sm:inset-x-9 sm:bottom-9">
            <p className="font-mono text-[11px] leading-[1.5] text-lime">THE INNER CIRCUIT / ALWAYS FORWARD</p>
            <h2 className="font-display text-[clamp(56px,8vw,88px)] leading-none font-extrabold">
              SAME ENERGY
              <br />
              WELCOME BACK
            </h2>
            <p className="text-[14px] leading-[1.65]">
              Your next drop. Your order history.
              <br />
              All in one place. All at your pace.
            </p>
          </div>
        </section>

        <form
          className="flex min-w-0 flex-1 flex-col gap-6 xl:pt-3 xl:pr-10"
          onSubmit={(event) => {
            event.preventDefault();
            void signInAccount(email, password, remember).then((result) => {
              if (result.error) {
                setError(result.error);
                return;
              }
              const destination = next?.startsWith("/") ? next : result.role === "admin" ? "/admin" : "/account";
              router.push(destination);
              router.refresh();
            });
          }}
        >
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/">HOME</Link>
            {" / "}
            <Link href="/account">ACCOUNT</Link>
            {" / "}
            SIGN IN
          </p>
          <h1 className="font-display text-[clamp(52px,8vw,76px)] leading-none font-extrabold">BACK IN THE MIX</h1>
          <p className="text-[14px] leading-[1.65] text-mist">Sign in to your PRIME account.</p>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[1.5] text-mist">EMAIL ADDRESS</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[1.5] text-mist">PASSWORD</span>
            <span className="flex h-[52px] items-center justify-between border border-line bg-panel px-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-paper"
              />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((open) => !open)}>
                <Icon src={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"} width={18} height={18} />
              </button>
            </span>
            <span className="text-[11px] leading-[1.5] text-ash">Passwords are case-sensitive.</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2.5 text-[12px] leading-[1.5] text-mist">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-[17px] accent-lime" />
              Keep me signed in
            </label>
            <Link href="/forgot-password" className="text-left text-[13px] font-medium text-lime">
              Forgot password?
            </Link>
          </div>
          {error ? <p className="text-[12px] leading-[1.5] text-lime">{error}</p> : null}
          <button type="submit" className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink">
            Sign In
            <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
          </button>
          <div className="h-px bg-line" />
          <p className="text-[13px] text-mist">
            New to the circuit?{" "}
            <Link href="/sign-up" className="font-medium text-lime">
              Create an account →
            </Link>
          </p>
          <Link href="/checkout" className="inline-flex h-[54px] items-center justify-between border border-line px-5 text-[13px] font-bold">
            Continue to Checkout as guest
            <Icon src="/icons/arrow-up-right-18.svg" width={18} height={18} />
          </Link>
          <p className="text-[11px] leading-[1.65] text-mist">
            Your cart stays with you. No account needed to check out.
            <br />
            Need help signing in? <a href="mailto:hello@prime.energy">hello@prime.energy</a>
          </p>
        </form>
      </main>
      <ShopFooter />
    </div>
  );
}

function ImagePanel({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill sizes="600px" className="object-cover" />;
}
