"use client";

import { Icon } from "@/components/icon";
import { SectionLabel } from "@/components/section-label";
import { FormEvent, useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }
    void fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (response) => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setMessage(data.error ?? "That email could not be saved.");
          return;
        }
        setMessage("You're on the list.");
        setEmail("");
      })
      .catch(() => setMessage("That email could not be saved."));
  }

  return (
    <section id="inner-circuit" className="bg-lime text-ink">
      <div className="flex w-full flex-col gap-8 px-4 py-12 sm:px-8 lg:flex-row lg:items-center lg:gap-[100px] lg:px-16 lg:py-[72px]">
        <div className="flex w-full flex-col gap-[22px] lg:w-[650px] lg:shrink-0">
          <SectionLabel tone="light">STAY IN THE LOOP NOT IN LINE</SectionLabel>
          <h2 className="font-display text-[40px] leading-[0.94] font-extrabold sm:text-[56px] lg:text-[72px]">
            JOIN THE INNER CIRCUIT
          </h2>
          <p className="text-[14px] leading-[1.5]">
            First access to new drops, underground events and a little disruption.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full flex-1 flex-col gap-[14px]">
          <div className="flex h-[62px] items-center justify-between gap-4 border-b border-ink">
            <label className="sr-only" htmlFor="email">
              Your email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex size-[42px] shrink-0 items-center justify-center bg-ink"
            >
              <Icon src="/icons/arrow-right-light.svg" width={20} height={20} />
            </button>
          </div>
          <p className="text-[10px] leading-[1.5] text-line">
            By signing up, you agree to our{" "}
            <a href="#privacy" className="underline">
              Privacy Policy
            </a>
            . Good energy only. Unsubscribe whenever.
            {message ? ` ${message}` : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
