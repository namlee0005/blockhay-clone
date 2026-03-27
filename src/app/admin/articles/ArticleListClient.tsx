"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  categorySlug: string;
  authorSlug: string;
  publishedAt?: string;
  updatedAt: string;
  sponsored: boolean;
}

interface Props {
  articles: ArticleRow[];
  total: number;
  page: number;
  totalPages: number;
  currentStatus?: string;
  currentQuery?: string;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Archived", value: "archived" },
];

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  draft: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

export default function ArticleListClient({
  articles, total, page, totalPages, currentStatus, currentQuery,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(currentQuery ?? "");
  const [deleting, setDeleting] = useState<string | null>(null);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status: currentStatus, q: currentQuery, ...overrides };
    if (merged.status) params.set("status", merged.status);
    if (merged.q) params.set("q", merged.q);
    if (overrides.page) params.set("page", overrides.page);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildUrl({ q: query || undefined, page: "1" }));
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = (await res.json()) as { error: string };
        alert(error);
      } else {
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-slate-200 dark:border-slate-700">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildUrl({ status: tab.value || undefined, page: "1" })}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              (currentStatus ?? "") === tab.value
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or tag…"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Title</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {articles.map((a) => (
              <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-xs">
                    {a.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 capitalize hidden md:table-cell">
                  {a.categorySlug}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      STATUS_STYLES[a.status] ?? STATUS_STYLES.archived
                    }`}
                  >
                    {a.status}
                  </span>
                  {a.sponsored && (
                    <span className="ml-1 text-xs text-slate-400">sponsored</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {new Date(a.updatedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/articles/${a._id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors rounded"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    {a.status === "published" && (
                      <Link
                        href={`/${a.categorySlug}/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded"
                        title="View live"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(a._id, a.title)}
                      disabled={deleting === a._id}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                  No articles found.{" "}
                  <Link href="/admin/articles/new" className="text-orange-500 hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>{total} articles</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="px-3 py-1.5">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
