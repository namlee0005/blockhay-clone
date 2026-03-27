import Script from "next/script";
import type { Metadata } from "next";

// SSR — revalidated on every request; Edge cache handles freshness
export const dynamic = "force-dynamic";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Bảng giá coin — Giá tiền điện tử hôm nay",
  description:
    "Bảng giá tiền điện tử cập nhật theo thời gian thực. Xem giá Bitcoin, Ethereum và hơn 100 altcoin mới nhất.",
  alternates: { canonical: "/bang-gia" },
};

interface CoinGeckoEntry {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

async function fetchPrices(): Promise<CoinGeckoEntry[]> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h";

  const res = await fetch(url, {
    // Edge cache: stale-while-revalidate 30s, hard cap 60s
    next: { revalidate: 30 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`CoinGecko fetch failed: ${res.status}`);
  return res.json();
}

function fmt(n: number, decimals = 2) {
  return n?.toLocaleString("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default async function BangGiaPage() {
  let coins: CoinGeckoEntry[] = [];
  let fetchError = false;

  try {
    coins = await fetchPrices();
  } catch {
    fetchError = true;
  }

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Bảng giá tiền điện tử",
    description: "Dữ liệu giá thị trường tiền điện tử từ CoinGecko",
    url: "https://blockhay.com/bang-gia",
    creator: { "@type": "Organization", name: "Blockhay" },
    license: "https://www.coingecko.com/en/api_terms",
    temporalCoverage: new Date().toISOString(),
  };

  return (
    <>
      <Script
        id="dataset-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bảng giá coin
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Cập nhật mỗi 30 giây · Nguồn: CoinGecko
        </p>

        {fetchError ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-600 dark:text-red-400">
            Không thể tải dữ liệu giá. Vui lòng thử lại sau.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 w-8">#</th>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3 text-right">Giá (USD)</th>
                  <th className="px-4 py-3 text-right">24h %</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    Vốn hóa
                  </th>
                  <th className="px-4 py-3 text-right hidden lg:table-cell">
                    Khối lượng 24h
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {coins.map((coin, i) => {
                  const change = coin.price_change_percentage_24h;
                  const isUp = change >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coin.image}
                            alt={coin.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {coin.name}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">
                        ${fmt(coin.current_price)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          isUp ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {fmt(change)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                        ${fmt(coin.market_cap / 1e9, 2)}B
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">
                        ${fmt(coin.total_volume / 1e6, 1)}M
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
