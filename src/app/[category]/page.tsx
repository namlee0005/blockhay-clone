import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CategoryHero } from "@/components/category/CategoryHero";
import { getArticlesByCategory, getCategoryBySlug } from "@/lib/api/articles";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const [cat, articles] = await Promise.all([
    getCategoryBySlug(category),
    getArticlesByCategory(category),
  ]);

  if (!cat) notFound();

  return (
    /*
      No background class here — inherits bg-slate-50 dark:bg-slate-900 from
      <body> in layout.tsx. Section padding only.
    */
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CategoryHero name={cat.name} description={cat.description} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-16 text-center text-slate-500 dark:text-slate-400">
          No articles yet in this category.
        </p>
      )}
    </section>
  );
}