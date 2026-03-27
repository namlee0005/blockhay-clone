import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Article as ArticleModel } from "@/models/Article";
import { Author } from "@/models/Author";
import HreflangTags from "@/components/HreflangTags";

export const revalidate = 300;

interface Params {
  params: Promise<{ category: string; slug: string }>;
}

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  publishedAt: Date;
  updatedAt: Date;
  schemaType: "NewsArticle" | "Article" | "FAQPage";
  sponsored: boolean;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categorySlug: string;
  authorSlug: string;
  tags: string[];
  author?: { name: string; slug: string; socialLinks: string[] };
}

export async function generateStaticParams() {
  await connectDB();
  const articles = await ArticleModel.find()
    .select("slug categorySlug")
    .lean<{ slug: string; categorySlug: string }[]>();
  return articles.map(({ slug, categorySlug }) => ({ slug, category: categorySlug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connectDB();
  const { category, slug } = await params;
  const article = await ArticleModel.findOne({ slug, categorySlug: category })
    .lean<ArticleRow>();
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/${category}/${slug}`,
      languages: { vi: `/${category}/${slug}`, en: `/en/${category}/${slug}` },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: [{ url: article.featuredImageUrl, width: 1200, height: 630, alt: article.featuredImageAlt }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Params) {
  await connectDB();
  const { category, slug } = await params;

  const article = await ArticleModel.findOne({ slug, categorySlug: category })
    .lean<ArticleRow>();
  if (!article) notFound();

  const authorDoc = await Author.findOne({ slug: article.authorSlug })
    .select("name slug socialLinks")
    .lean<{ name: string; slug: string; socialLinks: string[] }>();

  const canonicalPath = `/${category}/${slug}`;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": article.schemaType,
    headline: article.title,
    description: article.excerpt,
    image: [article.featuredImageUrl],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: authorDoc?.name ?? article.authorSlug,
      url: `https://blockhay.com/tac-gia/${article.authorSlug}`,
      sameAs: authorDoc?.socialLinks ?? [],
    },
    publisher: {
      "@type": "Organization",
      name: "Blockhay",
      "@id": "https://blockhay.com/#organization",
    },
    articleSection: category,
    keywords: article.tags.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://blockhay.com${canonicalPath}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://blockhay.com/" },
      { "@type": "ListItem", position: 2, name: category, item: `https://blockhay.com/${category}` },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://blockhay.com${canonicalPath}` },
    ],
  };

  return (
    <>
      <HreflangTags pathname={canonicalPath} />
      <Script id="article-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
          <ol className="flex gap-1">
            <li><a href="/" className="hover:underline">Trang chủ</a></li>
            <li aria-hidden="true">/</li>
            <li><a href={`/${category}`} className="hover:underline capitalize">{category}</a></li>
          </ol>
        </nav>

        {article.sponsored && (
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
            Nội dung tài trợ
          </p>
        )}

        <h1 className="text-2xl md:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
          {article.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {authorDoc && <span>Bởi {authorDoc.name}</span>}
          <span>·</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {new Date(article.publishedAt).toLocaleDateString("vi-VN", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          {article.updatedAt.getTime() !== article.publishedAt.getTime() && (
            <>
              <span>·</span>
              <span>Cập nhật: <time dateTime={article.updatedAt.toISOString()}>
                {new Date(article.updatedAt).toLocaleDateString("vi-VN")}
              </time></span>
            </>
          )}
        </div>

        <div className="relative mt-6 w-full aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt}
            fill priority className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Body — stored as HTML from editor */}
        <div
          className={`mt-8 prose prose-lg dark:prose-invert max-w-none article-body${article.sponsored ? " sponsored" : ""}`}
          // Article body comes from our own DB, not user-generated content
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {article.tags.length > 0 && (
          <footer className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <a
                key={tag}
                href={`/${category}?tag=${encodeURIComponent(tag)}`}
                rel="nofollow"
                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                #{tag}
              </a>
            ))}
          </footer>
        )}
      </article>
    </>
  );
}
