import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Blockhay — Tin Tức Crypto & Blockchain",
    template: "%s | Blockhay",
  },
  description:
    "Tin tức crypto, phân tích blockchain, giá coin mới nhất và kiến thức đầu tư cho nhà đầu tư Việt Nam.",
  metadataBase: new URL("https://blockhay.com"),
  alternates: {
    canonical: "/",
    languages: {
      vi: "/",
      en: "/en",
    },
  },
  openGraph: {
    siteName: "Blockhay",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
