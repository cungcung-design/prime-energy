import { SignUpPage } from "@/components/auth/sign-up-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — PRIME",
  description: "Create a PRIME account.",
};

export default function SignUpRoute() {
  return <SignUpPage />;
}
