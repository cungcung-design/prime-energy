import { redirect } from "next/navigation";

export default function OrderHistoryRoute() {
  redirect("/account?tab=orders");
}
