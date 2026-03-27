import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { sanityClient } from "@/../../sanity/lib/client";
import { homePageQuery } from "@/../../sanity/lib/queries";
import { urlFor } from "@/../../sanity/lib/image";

export const revalidate = 60;

interface ArticleStub {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  sponsored: boolean;
  featuredImage: { asset: object; alt: string };
  category: { title: string; slug: { current: string } };
  author?: { name: string; slug: { current: string } };
}

interface HomeData {
  featured: ArticleStub;
  articles: ArticleStub[];
}

export default async function HomePage() {
  const data: HomeData = await sanityClient.fetch(homePageQuery);
  const { featured, articles } = data;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://blockhay.com/#website",
        url: "https://blockhay.com/",
        name: "Blockhay",
        inLanguage: "vi",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://blockhay.com/tim-kiem?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://blockhay.com/#organization",
        name: "Blockhay",
        url: "https://blockhay.com/",
        logo: {
          "@type": "ImageObject",
          url: "https://blockhay.com/logo.png",
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Ad network — lazyOnload prevents INP degradation */}
      <Script
        src="https://placeholder-ad-network.example.com/ads.js"
        strategy="lazyOnload"
        id="ad-script"
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero — featured article (LCP target) */}
        {featured && (
          <section aria-label="Bài viết nổi bật" className="mb-10">
            <Link
              href={`/${featured.category.slug.current}/${featured.slug.current}`}
            >
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden">
                <Image
                  src={urlFor(featured.featuredImage.asset)
                    .width(1200)
                    .height(525)
                    .url()}
                  alt={featured.featuredImage.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  {featured.category.title}
                </span>
                <h1 className="mt-1 text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                  {featured.title}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                  {featured.excerpt}
                </p>
              </div>
            </Link>
          </section>
        )}

        {/* Article grid */}
        <section aria-label="Tin tức mới nhất">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Tin tức mới nhất
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map((article) => (
              <Link
                key={article._id}
                href={`/${article.category.slug.current}/${article.slug.current}`}
                className="group flex flex-col"
              >
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={urlFor(article.featuredImage.asset)
                      .width(600)
                      .height(338)
                      .url()}
                    alt={article.featuredImage.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-3 flex-1">
                  <span className="text-xs font-medium text-orange-500 uppercase">
                    {article.category.title}
                  </span>
                  <h3 className="mt-1 font-semibold leading-snug text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <time
                    dateTime={article.publishedAt}
                    className="mt-2 block text-xs text-gray-400"
                  >
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Ad slot placeholder */}
        <div
          className="mt-10 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-400"
          aria-label="Quảng cáo"
        >
          Quảng cáo
        </div>
      </main>
    </>
  );
}
