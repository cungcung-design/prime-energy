import { currentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

async function AdminGate({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?next=/admin");
  if (user.role !== "admin") redirect("/account");
  return children;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
