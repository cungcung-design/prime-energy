import { Icon } from "@/components/icon";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  icon: string;
  variant?: "primary" | "outline";
  compact?: boolean;
};

const variants = {
  primary: "border-transparent bg-lime text-ink",
  outline: "border-line bg-transparent text-paper",
};

export function Button({
  children,
  href,
  icon,
  variant = "primary",
  compact = false,
}: ButtonProps) {
  const size = compact
    ? "h-11 min-w-0 flex-1 justify-center gap-1.5 whitespace-nowrap px-2.5 text-[10px] lg:h-[54px] lg:flex-none lg:gap-6 lg:px-6 lg:text-[12px]"
    : "h-[54px] shrink-0 gap-6 px-6 text-[12px]";

  return (
    <a
      href={href}
      className={`inline-flex items-center border font-bold ${size} ${variants[variant]}`}
    >
      {children}
      <Icon src={icon} width={20} height={20} />
    </a>
  );
}
