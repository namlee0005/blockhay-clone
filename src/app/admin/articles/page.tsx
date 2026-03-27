import { connectDB } from "@/lib/db";
import { Article } from "@/models/Article";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ArticleListClient from "./ArticleListClient";

export const dynamic = "force-dynamic";

interface SearchParams {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

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

const PAGE_SIZE = 20;

export default async function AdminArticlesPage({ searchParams }: SearchParams) {
  const { status, q, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? "1"));

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status && ["draft", "published", "archived"].includes(status)) filter.status = status;
  if (q) filter.$or = [
    { title: { $regex: q, $options: "i" } },
    { tags: { $regex: q, $options: "i" } },
  ];

  const [rawArticles, total] = await Promise.all([
    Article.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .select("title slug status categorySlug authorSlug publishedAt updatedAt sponsored")
      .lean(),
    Article.countDocuments(filter),
  ]);

  const articles: ArticleRow[] = JSON.parse(JSON.stringify(rawArticles));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Articles</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          New Article
        </Link>
      </div>

      {/* Filters (client-side navigation) */}
      <ArticleListClient
        articles={articles}
        total={total}
        page={page}
        totalPages={totalPages}
        currentStatus={status}
        currentQuery={q}
      />
    </div>
  );
}
