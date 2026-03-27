"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArticleGridSkeleton } from "@/components/ArticleSkeleton";

interface SearchHit {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  publishedAt: string;
}

const MEILI_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST ?? "";
const MEILI_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ?? "";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setHits([]);
      setTotal(0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${MEILI_HOST}/indexes/articles/search`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MEILI_KEY}`,
            },
            body: JSON.stringify({
              q: query,
              limit: 20,
              attributesToHighlight: ["title", "excerpt"],
              highlightPreTag: "<mark>",
              highlightPostTag: "</mark>",
            }),
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setHits(data.hits ?? []);
        setTotal(data.estimatedTotalHits ?? 0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tìm kiếm</h1>

      <div className="relative mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Tìm kiếm bài viết"
          autoFocus
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {loading && <ArticleGridSkeleton count={3} />}

      {!loading && query && hits.length === 0 && (
        <p className="text-slate-500 text-center py-10">
          Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
        </p>
      )}

      {!loading && hits.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {total.toLocaleString("vi-VN")} kết quả
          </p>
          <div className="space-y-4">
            {hits.map((hit) => (
              <Link
                key={hit.id}
                href={`/${hit.category}/${hit.slug}`}
                className="block p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-colors"
              >
                <span className="text-xs text-orange-500 uppercase font-medium">{hit.category}</span>
                {/* Render highlighted title safely via dangerouslySetInnerHTML
                    — content comes from our own Meilisearch instance, not user input */}
                <h2
                  className="mt-1 font-semibold text-slate-900 dark:text-white [&_mark]:bg-orange-200 dark:[&_mark]:bg-orange-800/60 [&_mark]:rounded"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: hit.title }}
                />
                <p
                  className="mt-1 text-sm text-slate-500 line-clamp-2 [&_mark]:bg-orange-100 dark:[&_mark]:bg-orange-900/40"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                />
                <time dateTime={hit.publishedAt} className="mt-2 block text-xs text-slate-400">
                  {hit.publishedAt
                    ? new Date(hit.publishedAt).toLocaleDateString("vi-VN")
                    : ""}
                </time>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
