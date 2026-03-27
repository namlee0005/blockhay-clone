import type { MetadataRoute } from "next";
import { sanityClient } from "@/../../sanity/lib/client";
import {
  allArticleSlugsQuery,
  allCategorySlugsQuery,
} from "@/../../sanity/lib/queries";

const BASE = "https://blockhay.com";

interface ArticleSlug {
  slug: string;
  category: string;
  publishedAt: string;
  _updatedAt: string;
}

interface CategorySlug {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories]: [ArticleSlug[], CategorySlug[]] =
    await Promise.all([
      sanityClient.fetch(allArticleSlugsQuery),
      sanityClient.fetch(allCategorySlugsQuery),
    ]);

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/${a.category}/${a.slug}`,
    lastModified: new Date(a._updatedAt ?? a.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: {
      languages: {
        vi: `${BASE}/${a.category}/${a.slug}`,
        en: `${BASE}/en/${a.category}/${a.slug}`,
      },
    },
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/${c.slug}`,
    lastModified: new Date(c._updatedAt),
    changeFrequency: "daily",
    priority: 0.9,
    alternates: {
      languages: {
        vi: `${BASE}/${c.slug}`,
        en: `${BASE}/en/${c.slug}`,
      },
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
      alternates: {
        languages: { vi: `${BASE}/bang-gia`, en: `${BASE}/en/bang-gia` },
      },
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
