import Link from "next/link";

const steps = [
  { id: 1, href: "/cart" },
  { id: 2, href: "/checkout" },
  { id: 3, href: "" },
] as const;

export function ShopProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      {steps.map((step, index) => {
        const done = step.id < current;
        const active = step.id === current;
        const tone = active || done ? "text-lime" : "text-ash";
        const label =
          step.id === 1
            ? done
              ? "✓ / CART"
              : "01 / CART"
            : step.id === 2
              ? done
                ? "✓ / CHECKOUT"
                : "02 / CHECKOUT"
              : "03 / CONFIRMATION";
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-3">
            {step.href && step.id <= current ? (
              <Link href={step.href} className={`font-mono text-[11px] whitespace-nowrap ${tone}`}>
                {label}
              </Link>
            ) : (
              <span className={`font-mono text-[11px] whitespace-nowrap ${tone}`}>{label}</span>
            )}
            {index < steps.length - 1 ? (
              <span className={`hidden h-px min-w-4 flex-1 sm:block ${done ? "bg-lime" : "bg-line"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
