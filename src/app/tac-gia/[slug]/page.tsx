import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { sanityClient } from "@sanity/lib/client";
import { authorPageQuery, allAuthorSlugsQuery } from "@sanity/lib/queries";
import { urlFor } from "@sanity/lib/image";

export const revalidate = 300;

interface Params {
  params: Promise<{ slug: string }>;
}

interface AuthorData {
  author: {
    _id: string; name: string;
    slug: { current: string };
    avatar?: { asset: object; alt?: string };
    bio?: string;
    socialLinks?: string[];
  } | null;
  articles: {
    _id: string; title: string;
    slug: { current: string }; excerpt: string; publishedAt: string;
    featuredImage: { asset: object; alt: string };
    category: { title: string; slug: { current: string } };
  }[];
}

export async function generateStaticParams() {
  const authors: { slug: string }[] = await sanityClient.fetch(allAuthorSlugsQuery);
  return authors.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data: AuthorData = await sanityClient.fetch(authorPageQuery, { slug });
  if (!data.author) return {};
  return {
    title: data.author.name,
    description: data.author.bio ?? `Bài viết bởi ${data.author.name} trên Blockhay`,
    alternates: {
      canonical: `/tac-gia/${slug}`,
      languages: { vi: `/tac-gia/${slug}`, en: `/en/tac-gia/${slug}` },
    },
  };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const data: AuthorData = await sanityClient.fetch(authorPageQuery, { slug });
  if (!data.author) notFound();

  const { author, articles } = data;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://blockhay.com/tac-gia/${slug}`,
    description: author.bio,
    sameAs: author.socialLinks ?? [],
    ...(author.avatar && {
      image: urlFor(author.avatar.asset).width(400).height(400).url(),
    }),
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
        {/* Author card */}
        <div className="flex items-center gap-6 mb-10">
          {author.avatar && (
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={urlFor(author.avatar.asset).width(160).height(160).url()}
                alt={author.avatar.alt ?? author.name}
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
            {author.socialLinks && author.socialLinks.length > 0 && (
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

        {/* Author articles */}
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-5">
          Bài viết của {author.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article._id}
              href={`/${article.category.slug.current}/${article.slug.current}`}
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
              <div className="mt-3">
                <span className="text-xs text-orange-500 uppercase font-medium">
                  {article.category.title}
                </span>
                <h3 className="mt-1 font-semibold leading-snug text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <time dateTime={article.publishedAt} className="mt-1 block text-xs text-slate-400">
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
