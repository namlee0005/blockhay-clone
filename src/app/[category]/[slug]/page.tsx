import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Article as ArticleModel } from "@/models/Article";

// On-demand ISR: revalidated by /api/revalidate on article publish/update
export const revalidate = false;

interface Params {
  params: Promise<{ category: string; slug: string }>;
}

// After JSON.parse(JSON.stringify(lean())):
//   ObjectId → string, Date → ISO 8601 string
interface ArticleDoc {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  updatedAt: string;
  schemaType: "NewsArticle" | "Article" | "FAQPage";
  sponsored: boolean;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categorySlug: string;
  authorSlug: string;
  tags: string[];
  seo: {
    metaTitle?: string;
    metaDesc?: string;
    canonicalUrl?: string;
  };
}

// User model has no slug field yet; authorSlug is used as a display fallback
// until a slug field is added to IUser and a proper lookup is wired up

export async function generateStaticParams() {
  await connectDB();
  const articles = await ArticleModel.find({ status: "published" })
    .select("slug categorySlug")
    .lean<{ slug: string; categorySlug: string }[]>();
  return articles.map(({ slug, categorySlug }) => ({ slug, category: categorySlug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connectDB();
  const { category, slug } = await params;
  const raw = await ArticleModel.findOne({ slug, categorySlug: category, status: "published" })
    .select("title excerpt featuredImageUrl featuredImageAlt publishedAt updatedAt seo")
    .lean();
  if (!raw) return {};
  const article: Pick<ArticleDoc, "title" | "excerpt" | "featuredImageUrl" | "featuredImageAlt" | "publishedAt" | "updatedAt" | "seo"> =
    JSON.parse(JSON.stringify(raw));

  const metaTitle = article.seo?.metaTitle || article.title;
  const metaDesc = article.seo?.metaDesc || article.excerpt;
  const canonical = article.seo?.canonicalUrl || `/${category}/${slug}`;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: {
      canonical,
      languages: { en: `https://blockhay.com/${category}/${slug}`, "x-default": `https://blockhay.com/${category}/${slug}` },
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.featuredImageUrl, width: 1200, height: 630, alt: article.featuredImageAlt }],
    },
    twitter: { card: "summary_large_image", title: metaTitle, description: metaDesc },
  };
}

export default async function ArticlePage({ params }: Params) {
  await connectDB();
  const { category, slug } = await params;

  const raw = await ArticleModel.findOne({ slug, categorySlug: category, status: "published" })
    .lean();
  if (!raw) notFound();

  // Serialize all BSON types to plain JSON — safe to pass through RSC boundary
  const article: ArticleDoc = JSON.parse(JSON.stringify(raw));

  // User model has no slug field — display authorSlug as author name until slug is added to IUser
  const authorName = article.authorSlug;

  const canonicalPath = `/${category}/${slug}`;

  const showUpdated = article.updatedAt !== article.publishedAt;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": article.schemaType,
    headline: article.title,
    description: article.excerpt,
    image: [article.featuredImageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: authorName,
      url: `https://blockhay.com/author/${article.authorSlug}`,
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://blockhay.com/" },
      { "@type": "ListItem", position: 2, name: category, item: `https://blockhay.com/${category}` },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://blockhay.com${canonicalPath}` },
    ],
  };

  return (
    <>
      <Script id="article-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />
      <Script id="breadcrumb-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="hover:underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/${category}`} className="hover:underline capitalize">{category}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{article.title}</li>
          </ol>
        </nav>

        {article.sponsored && (
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">
            Sponsored Content
          </p>
        )}

        <h1 className="text-2xl md:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
          {article.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {(authorName) && (
            <span>By {authorName}</span>
          )}
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          {showUpdated && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Updated:{" "}
                <time dateTime={article.updatedAt}>
                  {new Date(article.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </time>
              </span>
            </>
          )}
        </div>

        <div className="relative mt-6 w-full aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={article.featuredImageUrl}
            alt={article.featuredImageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Body — stored as HTML from editor */}
        <div
          className={`mt-8 prose prose-lg dark:prose-invert max-w-none${article.sponsored ? " article-sponsored" : ""}`}
          // Article body comes from our own DB, not user-generated content
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {article.tags.length > 0 && (
          <footer className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/${category}?tag=${encodeURIComponent(tag)}`}
                rel="nofollow"
                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </footer>
        )}
      </article>
    </>
  );
}
