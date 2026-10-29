"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

const topics = [
  { id: "general", label: "Order or product" },
  { id: "stockist", label: "Become a stockist" },
  { id: "press", label: "Press & partnerships" },
];

export function ContactForm() {
  const requested = useSearchParams().get("topic") ?? "general";
  const initial = topics.some((item) => item.id === requested) ? requested : "general";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState(initial);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, topic: selected, body }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error ?? "The message could not be sent.");
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setBody("");
  }

  if (sent) {
    return <p className="border border-line bg-panel p-6 text-sm text-paper">Message received. We will reply to the email you entered.</p>;
  }

  return (
    <form onSubmit={submit} className="flex max-w-[640px] flex-col gap-5 border border-line bg-panel p-6">
      <label className="flex flex-col gap-2 text-[11px] font-mono text-ash">
        NAME
        <input value={name} onChange={(event) => setName(event.target.value)} className="h-12 border border-line bg-ink px-4 text-sm text-paper" />
      </label>
      <label className="flex flex-col gap-2 text-[11px] font-mono text-ash">
        EMAIL
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 border border-line bg-ink px-4 text-sm text-paper" />
      </label>
      <label className="flex flex-col gap-2 text-[11px] font-mono text-ash">
        TOPIC
        <select value={selected} onChange={(event) => setSelected(event.target.value)} className="h-12 border border-line bg-ink px-4 text-sm text-paper">
          {topics.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-[11px] font-mono text-ash">
        MESSAGE
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} className="border border-line bg-ink px-4 py-3 text-sm text-paper" />
      </label>
      {message ? <p className="text-xs text-[#ff9a8c]">{message}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center bg-lime px-6 text-[13px] font-bold text-ink disabled:opacity-50">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
