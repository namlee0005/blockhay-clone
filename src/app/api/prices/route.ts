import type { NextRequest } from "next/server";

export const runtime = "edge";

// Proxies CoinGecko to enforce server-side rate limiting and add Edge cache.
// Client (PriceTicker) polls this every 30s; multiple concurrent clients
// all hit the Edge cache rather than CoinGecko directly.
export async function GET(req: NextRequest) {
  const ids =
    req.nextUrl.searchParams.get("ids") ??
    "bitcoin,ethereum,binancecoin,solana,ripple";

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;

  const upstream = await fetch(url, {
    next: { revalidate: 30 },
    headers: { Accept: "application/json" },
  });

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: "upstream_error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await upstream.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
