import { Icon } from "@/components/icon";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href: string;
  icon: string;
  variant?: "primary" | "outline";
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
}: ButtonProps) {
  return (
    <a
      href={href}
      className={`inline-flex h-[54px] shrink-0 items-center gap-6 border px-6 text-[12px] font-bold ${variants[variant]}`}
    >
      {children}
      <Icon src={icon} width={20} height={20} />
    </a>
  );
}
