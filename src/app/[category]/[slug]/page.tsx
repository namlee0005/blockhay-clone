import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleMeta } from "@/components/articles/ArticleMeta";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { BreadcrumbList } from "@/components/seo/BreadcrumbList";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { getArticleBySlug, getRelatedArticles } from "@/lib/api/articles";
import { Image } from "next/image";

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.seo.metaTitle ?? article.title,
    description: article.seo.metaDesc ?? article.excerpt,
    alternates: { canonical: article.seo.canonicalUrl },
    openGraph: {
      images: [{ url: article.featuredImage.url, alt: article.featuredImage.alt }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getRelatedArticles(slug, category),
  ]);

  if (!article || article.status !== "published") notFound();

  return (
    /*
      Same rule: no background override. Inherits from layout <body>.
      Prose text colors use dark:prose-invert so TipTap HTML body copy
      inverts correctly in dark mode without manual overrides.
    */
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticleJsonLd article={article} />
      <BreadcrumbList category={category} title={article.title} slug={slug} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {article.title}
        </h1>
        <ArticleMeta
          author={article.author}
          publishedAt={article.publishedAt}
          sponsored={article.sponsored}
        />
      </header>

      {article.featuredImage.url && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt}
            width={800}
            height={450}
            priority
            className="w-full object-cover"
          />
        </div>
      )}

      <ArticleBody
        html={article.body}
        className="prose prose-slate max-w-none dark:prose-invert"
      />

      {related.length > 0 && (
        <aside className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-700">
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
            Related Articles
          </h2>
          <RelatedArticles articles={related} />
        </aside>
      )}
    </article>
  );
}