import { currentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

async function AccountGate({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?next=/account");
  return children;
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AccountGate>{children}</AccountGate>
    </Suspense>
  );
}
