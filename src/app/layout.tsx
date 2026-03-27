import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Blockhay — Crypto & Blockchain News",
    template: "%s | Blockhay",
  },
  description: "Breaking crypto news, market analysis, and blockchain education.",
  metadataBase: new URL("https://blockhay.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      {/*
        bg-slate-50 / dark:bg-slate-900 is the single source of truth for
        page background. No child page should re-declare a background color.
        text-slate-900 / dark:text-slate-100 ensures baseline contrast passes
        WCAG AA on both surfaces.
      */}
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}