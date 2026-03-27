import { connectDB } from "@/lib/db";
import { Article } from "@/models/Article";
import { auth } from "@/auth";
import Link from "next/link";
import { FileText, Clock, Archive, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface RecentArticle {
  _id: string;
  title: string;
  status: string;
  categorySlug: string;
  slug: string;
  publishedAt: string;
}

export default async function AdminDashboard() {
  const session = await auth();

  await connectDB();

  const [published, drafts, archived, rawRecent] = await Promise.all([
    Article.countDocuments({ status: "published" }),
    Article.countDocuments({ status: "draft" }),
    Article.countDocuments({ status: "archived" }),
    Article.find()
      .sort({ updatedAt: -1 })
      .limit(8)
      .select("title status categorySlug slug publishedAt updatedAt")
      .lean(),
  ]);

  const recent: RecentArticle[] = JSON.parse(JSON.stringify(rawRecent));

  const stats: StatCard[] = [
    {
      label: "Published",
      value: published,
      icon: <FileText size={20} />,
      href: "/admin/articles?status=published",
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: <Clock size={20} />,
      href: "/admin/articles?status=draft",
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950",
    },
    {
      label: "Archived",
      value: archived,
      icon: <Archive size={20} />,
      href: "/admin/articles?status=archived",
      color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, {session?.user?.name ?? "Editor"}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          New Article
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700"
          >
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
              {s.icon}
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {s.value}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent Articles
          </h2>
          <Link
            href="/admin/articles"
            className="text-sm text-orange-500 hover:underline"
          >
            View all
          </Link>
        </div>
        <ul>
          {recent.map((article, i) => (
            <li
              key={article._id}
              className={`flex items-center gap-4 px-6 py-3 ${
                i < recent.length - 1
                  ? "border-b border-slate-100 dark:border-slate-700"
                  : ""
              }`}
            >
              <StatusBadge status={article.status} />
              <div className="flex-1 min-w-0">
                <Link
                  href={`/admin/articles/${article._id}/edit`}
                  className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-orange-500 truncate block"
                >
                  {article.title}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">
                  {article.categorySlug}
                  {article.publishedAt &&
                    ` · ${new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
              </div>
              <Link
                href={`/${article.categorySlug}/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-orange-500 flex-shrink-0"
              >
                View ↗
              </Link>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="px-6 py-8 text-center text-sm text-slate-400">
              No articles yet.{" "}
              <Link href="/admin/articles/new" className="text-orange-500 hover:underline">
                Create your first article
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    draft: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    archived: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  };
  return (
    <span
      className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
        styles[status] ?? styles.archived
      }`}
    >
      {status}
    </span>
  );
}
