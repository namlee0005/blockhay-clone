"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// PriceTicker is a React island — no SSR to prevent hydration CLS
const PriceTicker = dynamic(() => import("./PriceTicker"), { ssr: false });

const NAV_LINKS = [
  { href: "/news", label: "News" },
  { href: "/markets", label: "Markets" },
  { href: "/web3-defi", label: "Web3 & DeFi" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/reviews", label: "Reviews" },
  { href: "/bang-gia", label: "Prices" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      {/* Price ticker strip */}
      <div className="bg-slate-900 dark:bg-slate-950 text-xs text-slate-300 h-7 overflow-hidden">
        <PriceTicker />
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-bold text-xl text-orange-500 tracking-tight"
          aria-label="Blockhay — Trang chủ"
        >
          Blockhay
        </Link>

        <nav aria-label="Điều hướng chính">
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 rounded-md transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/tim-kiem"
          className="text-slate-500 hover:text-orange-500 transition-colors"
          aria-label="Tìm kiếm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
