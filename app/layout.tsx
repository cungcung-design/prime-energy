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
  title: "PRIME — Full Tilt, No Limit",
  description:
    "Clean, electric energy for those who go all in. Bold flavor. Zero sugar. Nothing holding you back.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${inter.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-sans text-paper">
        <StoreFrame>{children}</StoreFrame>
      </body>
    </html>
  );
}
