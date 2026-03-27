import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { sanityClient } from "@sanity/lib/client";
import { categoryPageQuery, allCategorySlugsQuery } from "@sanity/lib/queries";
import { urlFor } from "@sanity/lib/image";

export const revalidate = 300;

const PAGE_SIZE = 12;

interface Params {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface CategoryData {
  category: { _id: string; title: string; slug: { current: string }; description?: string; _updatedAt: string } | null;
  articles: {
    _id: string; title: string;
    slug: { current: string }; excerpt: string; publishedAt: string;
    featuredImage: { asset: object; alt: string };
    author: { name: string; slug: { current: string } };
  }[];
  total: number;
}

export async function generateStaticParams() {
  const cats: { slug: string }[] = await sanityClient.fetch(allCategorySlugsQuery);
  return cats.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const data: CategoryData = await sanityClient.fetch(categoryPageQuery, {
    slug: category, from: 0, to: PAGE_SIZE - 1,
  });
  if (!data.category) return {};
  return {
    title: data.category.title,
    description: data.category.description ?? `Tin tức và bài viết về ${data.category.title}`,
    alternates: {
      canonical: `/${category}`,
      languages: { vi: `/${category}`, en: `/en/${category}` },
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Params) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const data: CategoryData = await sanityClient.fetch(categoryPageQuery, {
    slug: category, from, to,
  });
  if (!data.category) notFound();

  const { category: cat, articles, total } = data;
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
        {cat.description && (
          <p className="text-slate-500 mb-6">{cat.description}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/${category}/${article.slug.current}`}
              className="group flex flex-col"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                <Image
                  src={urlFor(article.featuredImage.asset).width(600).height(338).url()}
                  alt={article.featuredImage.alt}
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
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>{article.author.name}</span>
                  <span>·</span>
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
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
            <span className="px-4 py-2 text-sm text-slate-500">
              {page} / {totalPages}
            </span>
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
