import { StoreFrame } from "@/components/store-frame";
import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PRIME — Pure Energy",
  description:
    "Experience the power of PRIME Energy. Bold flavor. Zero sugar. Made to fuel your ambition and elevate every moment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${inter.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-sans text-paper" suppressHydrationWarning>
        <StoreFrame>{children}</StoreFrame>
      </body>
    </html>
  );
}
