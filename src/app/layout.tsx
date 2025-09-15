import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Analytics } from "@vercel/analytics/react";
import { eurostile, roboto } from "./fonts";
import DebugBadge from "@/components/site/DebugBadge";
import { Suspense } from "react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Siawsh Studio — Blueprint to Broadcast", template: "%s | Siawsh Studio" },
  description:
    "We fuse strategy with 3D & motion to translate complex ideas into captivating visual worlds.",
  keywords: [
    "3D",
    "motion design",
    "brand",
    "strategy",
    "case studies",
    "Siawsh Studio",
  ],
  openGraph: {
    type: "website",
    title: "Siawsh Studio",
    description: "Blueprint to Broadcast.",
    url: "/",
    images: ["/og/default-og.png"],
  },
  twitter: { card: "summary_large_image", creator: "@siawsh", images: ["/og/default-og.png"] },
  robots: { index: true, follow: true },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${eurostile.variable} ${roboto.variable}`}>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded bg-accent px-3 py-2 text-sm text-background">Skip to content</a>
        <Header />
        <main id="main" className="mx-auto max-w-5xl px-4">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <DebugBadge />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
