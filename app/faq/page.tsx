import { InfoPage } from "@/components/site/info-page";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs — PRIME",
  description: "Answers for shopping, accounts, promos, and orders at PRIME.",
};

const faqs = [
  ["Do I need an account to buy?", "No. Checkout works as a guest. An account keeps your address, order history, and the ability to cancel an unpaid order."],
  ["Where are my orders?", "Sign in and open Account, then Orders. Each order links to its confirmation page, payment state, and tracking when it exists."],
  ["What does PRIME10 do?", "It takes 10% off merchandise when the subtotal is at least $64. It expires in 2027 and has a use limit. Tax is calculated after the discount."],
  ["Why is a flavor unavailable?", "The product page and the shop read live stock. Night Berry is unavailable while its stock is zero. Adding it to the cart is blocked."],
  ["When is a card charged?", "Card details are entered on the secure payment page after you place the order. If that payment step is unavailable, no order is created and no card is charged."],
  ["How do I reset a password?", "Use Forgot password on the sign-in page. The reset link is emailed when mail delivery is configured. The request always returns the same confirmation, whether or not the email is registered."],
];

export default function FaqPage() {
  return (
    <InfoPage crumb="FAQS" title="QUESTIONS, ANSWERED" lede="These answers match how the store actually behaves.">
      <div className="flex max-w-[860px] flex-col">
        {faqs.map(([question, answer]) => (
          <article key={question} className="flex flex-col gap-2 border-t border-line py-6">
            <h2 className="text-lg font-semibold">{question}</h2>
            <p className="text-[14px] leading-[1.7] text-mist">{answer}</p>
          </article>
        ))}
      </div>
      <Link href="/contact" className="text-[13px] font-bold text-lime">
        Still stuck? Contact us →
      </Link>
    </InfoPage>
  );
}
