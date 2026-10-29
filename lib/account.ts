"use client";

import { useCallback, useEffect, useState } from "react";

export type Account = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  region: string;
  country: string;
  newsletter: boolean;
  state?: string;
  postal?: string;
  role?: string;
};

const changeEvent = "prime-account-change";

export const defaultDetails = {
  phone: "(415) 555-0142",
  street: "184 Valencia Street",
  apartment: "Apt 4",
  city: "San Francisco",
  region: "CA 94103",
  country: "United States",
  newsletter: true,
};

export const demoAccount: Account = {
  firstName: "Jordan",
  lastName: "Ellis",
  email: "jordan.ellis@example.com",
  ...defaultDetails,
};

async function readError(response: Response) {
  const data = (await response.json()) as { error?: string; account?: Account; role?: string; message?: string };
  return data;
}

export function passwordChecks(password: string) {
  return {
    length: password.length >= 12,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
}

export async function signInAccount(email: string, password: string, remember = true) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, remember }),
  });
  const data = await readError(response);
  if (!response.ok) return { error: data.error ?? "Sign in failed.", role: null };
  window.dispatchEvent(new Event(changeEvent));
  return { error: null, role: data.role ?? "customer" };
}

export async function signUpAccount(input: { firstName: string; lastName: string; email: string; password: string; newsletter?: boolean }) {
  const checks = passwordChecks(input.password);
  if (!input.firstName.trim() || !input.lastName.trim()) return "Add your first and last name.";
  if (!input.email.includes("@")) return "Enter an email address.";
  if (!checks.length || !checks.mixed || !checks.number) {
    return "Use 12 or more characters, with upper and lowercase letters and a number.";
  }
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await readError(response);
  if (!response.ok) return data.error ?? "The account could not be created.";
  window.dispatchEvent(new Event(changeEvent));
  return null;
}

export async function saveAccount(next: Account) {
  const response = await fetch("/api/auth/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  const data = await readError(response);
  if (!response.ok) return data.error ?? "The profile could not be saved.";
  window.dispatchEvent(new Event(changeEvent));
  return null;
}

export async function updatePassword(email: string, current: string, next: string) {
  void email;
  const response = await fetch("/api/auth/password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current, next }),
  });
  const data = await readError(response);
  if (!response.ok) return data.error ?? "The password could not be updated.";
  return null;
}

export async function signOutAccount() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.dispatchEvent(new Event(changeEvent));
}

export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;
    const sync = () => {
      void fetch("/api/auth/session")
        .then((response) => response.json())
        .then((data: { account: Account | null }) => {
          if (!ignore) {
            setAccount(data.account);
            setReady(true);
          }
        })
        .catch(() => {
          if (!ignore) setReady(true);
        });
    };
    sync();
    window.addEventListener(changeEvent, sync);
    return () => {
      ignore = true;
      window.removeEventListener(changeEvent, sync);
    };
  }, []);

  const signOut = useCallback(() => {
    void signOutAccount().then(() => setAccount(null));
  }, []);

  return { account, ready, signOut };
}
