import { ContactForm } from "@/components/site/contact-form";
import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contact — PRIME",
  description: "Orders, stockists, and press. Write to PRIME.",
};

export default function ContactPage() {
  return (
    <InfoPage
      crumb="CONTACT"
      title={
        <>
          SAY
          <br />
          <span className="text-lime italic">HELLO</span>
        </>
      }
      lede="Orders, stockists, and press. Every message is saved."
    >
      <p className="font-mono text-[11px] tracking-wide text-mist">
        <a href="mailto:hello@prime.energy">hello@prime.energy</a>
      </p>
      <Suspense fallback={<p className="text-[15px] leading-[1.65] text-mist">Loading the form…</p>}>
        <ContactForm />
      </Suspense>
    </InfoPage>
  );
}
