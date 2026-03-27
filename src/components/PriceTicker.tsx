"use client";

import { useEffect, useRef, useState } from "react";

interface TickerCoin {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const COINS = ["bitcoin", "ethereum", "binancecoin", "solana", "ripple"];
const POLL_MS = 30_000;

export default function PriceTicker() {
  const [coins, setCoins] = useState<TickerCoin[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchPrices() {
    try {
      const res = await fetch(`/api/prices?ids=${COINS.join(",")}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: TickerCoin[] = await res.json();
      setCoins(data);
    } catch {
      // silently swallow — ticker is non-critical
    }
  }

  useEffect(() => {
    fetchPrices();
    timerRef.current = setInterval(fetchPrices, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (coins.length === 0) return null;

  return (
    <div className="flex items-center h-full px-4 gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
      {coins.map((c) => {
        const up = c.price_change_percentage_24h >= 0;
        return (
          <span key={c.id} className="flex items-center gap-1.5">
            <span className="uppercase font-semibold text-white">{c.symbol}</span>
            <span className="text-slate-300">
              ${c.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
            <span className={up ? "text-green-400" : "text-red-400"}>
              {up ? "▲" : "▼"}
              {Math.abs(c.price_change_percentage_24h).toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );
}
