import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";

const BASE = "https://blockhay.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: { slug: string; categorySlug: string; publishedAt: Date; updatedAt: Date }[] = [];
  let categories: { slug: string; updatedAt: Date }[] = [];
  try {
    await connectDB();
    [articles, categories] = await Promise.all([
      Article.find()
        .sort({ publishedAt: -1 })
        .select("slug categorySlug publishedAt updatedAt")
        .lean<{ slug: string; categorySlug: string; publishedAt: Date; updatedAt: Date }[]>(),
      Category.find()
        .select("slug updatedAt")
        .lean<{ slug: string; updatedAt: Date }[]>(),
    ]);
  } catch {
    // DB unavailable at build time — return static entries only
  }

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/${a.categorySlug}/${a.slug}`,
    lastModified: a.updatedAt ?? a.publishedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        vi: `${BASE}/${a.categorySlug}/${a.slug}`,
        en: `${BASE}/en/${a.categorySlug}/${a.slug}`,
      },
    },
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
    alternates: {
      languages: { vi: `${BASE}/${c.slug}`, en: `${BASE}/en/${c.slug}` },
    },
  }));

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
      alternates: { languages: { vi: BASE, en: `${BASE}/en` } },
    },
    {
      url: `${BASE}/bang-gia`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.7,
      alternates: { languages: { vi: `${BASE}/bang-gia`, en: `${BASE}/en/bang-gia` } },
    },
    {
      url: `${BASE}/tim-kiem`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
