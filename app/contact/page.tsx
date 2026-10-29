import { ContactForm } from "@/components/site/contact-form";
import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contact — PRIME",
  description: "Send a message to the PRIME store.",
};

export default function ContactPage() {
  return (
    <InfoPage crumb="CONTACT" title="TALK TO THE STORE" lede="Orders, stockist requests, and press all come through this form. Messages are saved with the store.">
      <p className="font-mono text-[12px] text-mist">
        <a href="mailto:hello@prime.energy">hello@prime.energy</a>
      </p>
      <Suspense fallback={<p className="text-sm text-mist">Loading the form…</p>}>
        <ContactForm />
      </Suspense>
    </InfoPage>
  );
}
