import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";

export const revalidate = 300;

const PAGE_SIZE = 12;

interface Params {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date;
  featuredImageUrl: string;
  featuredImageAlt: string;
  authorSlug: string;
}

interface CategoryRow {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  updatedAt: Date;
}

export async function generateStaticParams() {
  await connectDB();
  const cats = await Category.find().select("slug").lean<{ slug: string }[]>();
  return cats.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connectDB();
  const { category } = await params;
  const cat = await Category.findOne({ slug: category }).lean<CategoryRow>();
  if (!cat) return {};
  return {
    title: cat.title,
    description: cat.description ?? `Tin tức và bài viết về ${cat.title}`,
    alternates: {
      canonical: `/${category}`,
      languages: { vi: `/${category}`, en: `/en/${category}` },
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  await connectDB();

  const { category } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [cat, articles, total] = await Promise.all([
    Category.findOne({ slug: category }).lean<CategoryRow>(),
    Article.find({ categorySlug: category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .select("-body")
      .lean<ArticleRow[]>(),
    Article.countDocuments({ categorySlug: category }),
  ]);

  if (!cat) notFound();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.title,
    description: cat.description,
    url: `https://blockhay.com/${category}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://blockhay.com/" },
        { "@type": "ListItem", position: 2, name: cat.title, item: `https://blockhay.com/${category}` },
      ],
    },
  };

  return (
    <>
      <Script
        id="collection-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
          <ol className="flex gap-1">
            <li><Link href="/" className="hover:underline">Trang chủ</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-slate-800 dark:text-slate-200">{cat.title}</li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{cat.title}</h1>
        {cat.description && <p className="text-slate-500 mb-6">{cat.description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={String(article._id)}
              href={`/${category}/${article.slug}`}
              className="group flex flex-col"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={article.featuredImageUrl}
                  alt={article.featuredImageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="mt-3 flex-1">
                <h2 className="font-semibold leading-snug text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{article.excerpt}</p>
                <time dateTime={article.publishedAt.toISOString()} className="mt-2 block text-xs text-slate-400">
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                </time>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Phân trang" className="mt-10 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/${category}?page=${page - 1}`}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ← Trước
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-slate-500">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/${category}?page=${page + 1}`}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Sau →
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
