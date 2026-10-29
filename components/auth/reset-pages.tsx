"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-16 sm:px-8">
        <p className="font-mono text-[11px] leading-[1.5] text-ash">
          <Link href="/sign-in">SIGN IN</Link>
          {" / "}
          RESET
        </p>
        <h1 className="font-display text-[clamp(48px,8vw,76px)] leading-none font-extrabold">RESET THE LOCK</h1>
        <p className="text-[14px] leading-[1.65] text-mist">
          Enter the email on your account. If it matches, a reset link is prepared. Mail is sent only when an email
          provider is configured.
        </p>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            void fetch("/api/auth/forgot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            })
              .then(async (response) => {
                const data = (await response.json()) as { message?: string; error?: string };
                if (!response.ok) setError(data.error ?? "The reset could not be started.");
                else setMessage(data.message ?? "If an account exists, a reset link is ready.");
              })
              .catch(() => setError("The reset could not be started."));
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[1.5] text-mist">EMAIL ADDRESS</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
            />
          </label>
          {error ? <p className="text-[12px] text-lime">{error}</p> : null}
          {message ? <p className="text-[12px] leading-[1.5] text-mist">{message}</p> : null}
          <button type="submit" className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink">
            Send reset link
            <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
          </button>
        </form>
      </main>
      <ShopFooter />
    </div>
  );
}

export function ResetPasswordPage() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-16 sm:px-8">
        <h1 className="font-display text-[clamp(48px,8vw,76px)] leading-none font-extrabold">CHOOSE A NEW PASSWORD</h1>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void fetch("/api/auth/reset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password }),
            })
              .then(async (response) => {
                const data = (await response.json()) as { error?: string };
                if (!response.ok) setError(data.error ?? "The password could not be reset.");
                else setMessage("Password updated. Sign in with the new password.");
              })
              .catch(() => setError("The password could not be reset."));
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[1.5] text-mist">NEW PASSWORD</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
            />
          </label>
          <p className="text-[11px] leading-[1.6] text-ash">Use at least 12 characters, including a number and a symbol.</p>
          {error ? <p className="text-[12px] text-lime">{error}</p> : null}
          {message ? (
            <p className="text-[12px] text-mist">
              {message} <Link href="/sign-in" className="text-lime">Sign in →</Link>
            </p>
          ) : null}
          <button type="submit" className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink">
            Update password
            <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
          </button>
        </form>
      </main>
      <ShopFooter />
    </div>
  );
}
