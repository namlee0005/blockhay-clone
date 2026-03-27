import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import { Author } from "@/models/Author";
import { Article } from "@/models/Article";

export const revalidate = 300;

interface Params {
  params: Promise<{ slug: string }>;
}

interface AuthorRow {
  _id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  avatarAlt?: string;
  bio?: string;
  socialLinks: string[];
}

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  publishedAt: Date;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categorySlug: string;
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const authors = await Author.find().select("slug").lean<{ slug: string }[]>();
    return authors.map(({ slug }) => ({ slug }));
  } catch {
    // DB unavailable at build time — pages will be generated on first request
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const author = await Author.findOne({ slug }).lean<AuthorRow>();
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio ?? `Bài viết bởi ${author.name} trên Blockhay`,
    alternates: {
      canonical: `/tac-gia/${slug}`,
      languages: { vi: `/tac-gia/${slug}`, en: `/en/tac-gia/${slug}` },
    },
  };
}

export default async function AuthorPage({ params }: Params) {
  await connectDB();
  const { slug } = await params;

  const [author, articles] = await Promise.all([
    Author.findOne({ slug }).lean<AuthorRow>(),
    Article.find({ authorSlug: slug })
      .sort({ publishedAt: -1 })
      .limit(12)
      .select("-body")
      .lean<ArticleRow[]>(),
  ]);

  if (!author) notFound();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://blockhay.com/tac-gia/${slug}`,
    description: author.bio,
    sameAs: author.socialLinks ?? [],
    ...(author.avatarUrl && { image: author.avatarUrl }),
    worksFor: {
      "@type": "Organization",
      name: "Blockhay",
      "@id": "https://blockhay.com/#organization",
    },
  };

  return (
    <>
      <Script
        id="author-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-6 mb-10">
          {author.avatarUrl && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={author.avatarUrl}
                alt={author.avatarAlt ?? author.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{author.name}</h1>
            {author.bio && (
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm max-w-xl">{author.bio}</p>
            )}
            {author.socialLinks.length > 0 && (
              <div className="mt-2 flex gap-3">
                {author.socialLinks.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs text-orange-500 hover:underline"
                  >
                    {new URL(url).hostname.replace("www.", "")}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-5">
          Bài viết của {author.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={String(article._id)}
              href={`/${article.categorySlug}/${article.slug}`}
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
              <div className="mt-3">
                <span className="text-xs text-orange-500 uppercase font-medium">
                  {article.categorySlug}
                </span>
                <h3 className="mt-1 font-semibold leading-snug text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <time dateTime={article.publishedAt.toISOString()} className="mt-1 block text-xs text-slate-400">
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                </time>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
