import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import type { Metadata } from "next";
import { sanityClient } from "@sanity/lib/client";
import { articleQuery, allArticleSlugsQuery } from "@sanity/lib/queries";
import { urlFor } from "@sanity/lib/image";

export const revalidate = 300;

interface Params {
  params: Promise<{ category: string; slug: string }>;
}

// Typed subset of Article from Sanity schema
interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  _updatedAt: string;
  schemaType: "NewsArticle" | "Article" | "FAQPage";
  sponsored: boolean;
  featuredImage: { asset: object; alt: string };
  category: { title: string; slug: { current: string } };
  author: { name: string; slug: { current: string }; socialLinks?: string[] };
  tags?: string[];
  body: object[];
}

export async function generateStaticParams() {
  const slugs: { slug: string; category: string }[] =
    await sanityClient.fetch(allArticleSlugsQuery);
  return slugs.map(({ slug, category }) => ({ slug, category }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  const article: Article | null = await sanityClient.fetch(articleQuery, {
    slug,
    category,
  });
  if (!article) return {};

  const imageUrl = urlFor(article.featuredImage.asset).width(1200).height(630).url();

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
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
      authors: [article.author.name],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.featuredImage.alt }],
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { category, slug } = await params;
  const article: Article | null = await sanityClient.fetch(articleQuery, {
    slug,
    category,
  });
  if (!article) notFound();

  const imageUrl = urlFor(article.featuredImage.asset).width(1200).height(630).url();

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": article.schemaType,
    headline: article.title,
    description: article.excerpt,
    image: [imageUrl],
    datePublished: article.publishedAt,
    dateModified: article._updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: `https://blockhay.com/tac-gia/${article.author.slug.current}`,
      sameAs: article.author.socialLinks ?? [],
    },
    publisher: {
      "@type": "Organization",
      name: "Blockhay",
      "@id": "https://blockhay.com/#organization",
    },
    articleSection: article.category.title,
    keywords: article.tags?.join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://blockhay.com/${category}/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://blockhay.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category.title,
        item: `https://blockhay.com/${category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://blockhay.com/${category}/${slug}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
          <ol className="flex gap-1">
            <li><a href="/" className="hover:underline">Trang chủ</a></li>
            <li aria-hidden="true">/</li>
            <li>
              <a href={`/${category}`} className="hover:underline capitalize">
                {article.category.title}
              </a>
            </li>
          </ol>
        </nav>

        {/* Sponsored label */}
        {article.sponsored && (
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
            Nội dung tài trợ
          </p>
        )}

        <h1 className="text-2xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
          {article.title}
        </h1>

        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
          <span>Bởi {article.author.name}</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {article._updatedAt !== article.publishedAt && (
            <>
              <span>·</span>
              <span>
                Cập nhật:{" "}
                <time dateTime={article._updatedAt}>
                  {new Date(article._updatedAt).toLocaleDateString("vi-VN")}
                </time>
              </span>
            </>
          )}
        </div>

        <div className="relative mt-6 w-full aspect-[16/9] rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.featuredImage.alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {/* Body — PortableText rendering requires @portabletext/react; placeholder */}
        <div className="mt-8 prose prose-lg dark:prose-invert max-w-none">
          {/* TODO: replace with <PortableText value={article.body} /> from @portabletext/react */}
          <p className="text-gray-500 italic">
            [Nội dung bài viết — tích hợp PortableText renderer ở đây]
          </p>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <footer className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </footer>
        )}
      </article>
    </>
  );
}
