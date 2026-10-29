"use client";

import { Icon } from "@/components/icon";
import { ShopFooter, ShopHeader } from "@/components/products/shop-chrome";
import { passwordChecks, signUpAccount } from "@/lib/account";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const starterPassword = "PrimeCircuit1";

export function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("Jordan");
  const [lastName, setLastName] = useState("Ellis");
  const [email, setEmail] = useState("jordan.ellis@example.com");
  const [password, setPassword] = useState(starterPassword);
  const [confirm, setConfirm] = useState(starterPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [news, setNews] = useState(false);
  const [error, setError] = useState("");
  const checks = passwordChecks(password);
  const matches = password.length > 0 && password === confirm;

  return (
    <div className="bg-ink text-paper">
      <ShopHeader />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-8 sm:px-8 lg:px-10 lg:py-10 xl:flex-row xl:items-start xl:gap-24 xl:p-16">
        <section className="relative min-h-[520px] w-full overflow-hidden p-7 sm:p-9 xl:h-[792px] xl:w-[600px] xl:shrink-0">
          <Image src="/images/account/sign-up.png" alt="PRIME can in a dark campaign still" fill sizes="600px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(9,11,10,0.25)] to-[rgba(9,11,10,0.96)]" />
          <p className="relative font-mono text-[11px] leading-[1.5] text-lime">PRIME / THE INNER CIRCUIT</p>
          <div className="absolute inset-x-7 bottom-8 flex flex-col gap-[22px] sm:inset-x-9 sm:bottom-10">
            <h2 className="font-display text-[clamp(56px,8vw,94px)] leading-none font-extrabold">
              YOUR ENERGY
              <br />
              YOUR SPACE
            </h2>
            <p className="text-[14px] leading-[1.65]">A little less admin. A lot more momentum.</p>
            <Benefit>01 / Faster checkout, saved details</Benefit>
            <Benefit>02 / Every order, one place</Benefit>
            <Benefit>03 / Drop news, only if you want it</Benefit>
          </div>
        </section>

        <form
          className="flex min-w-0 flex-1 flex-col gap-[21px] xl:pt-3 xl:pr-10"
          onSubmit={(event) => {
            event.preventDefault();
            if (password !== confirm) {
              setError("Passwords do not match.");
              return;
            }
            void signUpAccount({ firstName, lastName, email, password, newsletter: news }).then((message) => {
              if (message) {
                setError(message);
                return;
              }
              router.push("/account");
              router.refresh();
            });
          }}
        >
          <p className="font-mono text-[11px] leading-[1.5] text-ash">
            <Link href="/">HOME</Link>
            {" / "}
            <Link href="/account">ACCOUNT</Link>
            {" / "}
            SIGN UP
          </p>
          <h1 className="font-display text-[clamp(52px,8vw,76px)] leading-none font-extrabold">JOIN THE CIRCUIT</h1>
          <p className="text-[13px] text-mist">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-lime">
              Sign In →
            </Link>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="FIRST NAME" value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <Field label="LAST NAME" value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[1.5] text-mist">EMAIL ADDRESS</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
            />
            <span className="text-[11px] leading-[1.5] text-ash">Use this email to sign in and find your orders.</span>
          </label>
          <PasswordField
            label="CREATE PASSWORD"
            value={password}
            shown={showPassword}
            autoComplete="new-password"
            onChange={setPassword}
            onToggle={() => setShowPassword((open) => !open)}
          />
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] leading-[1.5] text-ash">
            <Mark ok={checks.length}>12+ characters</Mark>
            <Mark ok={checks.mixed}>Upper & lowercase</Mark>
            <Mark ok={checks.number}>Number</Mark>
          </p>
          <PasswordField
            label="CONFIRM PASSWORD"
            value={confirm}
            shown={showConfirm}
            autoComplete="new-password"
            onChange={setConfirm}
            onToggle={() => setShowConfirm((open) => !open)}
          />
          <p className="text-[11px] leading-[1.5] text-ash">{matches ? "✓ Passwords match." : "Re-enter the same password."}</p>
          <label className="flex items-center gap-2.5 text-[12px] leading-[1.5] text-mist">
            <input type="checkbox" checked={news} onChange={(event) => setNews(event.target.checked)} className="size-[17px] accent-lime" />
            Send me new drops and collective news. Optional; unsubscribe anytime.
          </label>
          <p className="text-[11px] leading-[1.65] text-mist">
            By creating an account, you agree to our Terms of Use and acknowledge our Privacy Policy.
          </p>
          {error ? <p className="text-[12px] leading-[1.5] text-lime">{error}</p> : null}
          <button type="submit" className="inline-flex h-[54px] items-center justify-between border border-lime bg-lime px-5 text-[13px] font-bold text-ink">
            Create Account
            <Icon src="/icons/arrow-up-right-dark-18.svg" width={18} height={18} />
          </button>
          <Link href="/checkout" className="text-[13px] font-medium text-lime">
            Just here for the energy? Checkout as guest →
          </Link>
        </form>
      </main>
      <ShopFooter />
    </div>
  );
}

function Benefit({ children }: { children: string }) {
  return <p className="border-t border-line pt-3.5 font-mono text-[11px] leading-[1.5] text-mist">{children}</p>;
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="font-mono text-[11px] leading-[1.5] text-mist">{label}</span>
      <input
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] border border-line bg-panel px-4 text-[14px] outline-none"
      />
    </label>
  );
}

function PasswordField({
  label,
  value,
  shown,
  autoComplete,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  shown: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] leading-[1.5] text-mist">{label}</span>
      <span className="flex h-[52px] items-center justify-between border border-line bg-panel px-4">
        <input
          type={shown ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-[14px] outline-none"
        />
        <button type="button" aria-label={shown ? "Hide password" : "Show password"} onClick={onToggle}>
          <Icon src={shown ? "/icons/eye.svg" : "/icons/eye-off.svg"} width={18} height={18} />
        </button>
      </span>
    </label>
  );
}

function Mark({ ok, children }: { ok: boolean; children: string }) {
  return (
    <span className={ok ? "text-ash" : "text-mist"}>
      {ok ? "✓" : "○"} {children}
    </span>
  );
}
