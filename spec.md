# Blockhay Clone — SEO-Optimized Architecture Spec

## Executive Summary

Blockhay.com is a Vietnamese-language crypto/blockchain news and analysis platform targeting retail investors and traders. It delivers breaking news, market analysis, educational content, real-time price tickers, and community events in a multi-column editorial layout — monetized via display advertising and sponsored content.

The clone uses **Next.js 15 App Router** with SSG/ISR for editorial content and SSR for live price data. All decisions target **Core Web Vitals** (LCP < 2.5s, CLS < 0.1, INP < 200ms), **Schema.org structured data**, and strong **Vietnamese-language SEO** with correct hreflang signaling and dynamic sitemaps.

---

## Recommended Tech Stack

| Layer | Technology | Reasoning |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | RSC + ISR for fast static delivery; built-in `next/image` |
| **Styling** | Tailwind CSS v4 | JIT purging; minimal CSS bundle; editorial grid utilities |
| **CMS** | Sanity.io (Headless) | GROQ queries; real-time preview; Vietnamese slug support |
| **Long-form** | MDX via `next-mdx-remote` | Rich articles with embedded React components |
| **Price Data** | CoinGecko Public API | REST polling; no API key required for public tier |
| **Search** | Meilisearch (self-hosted) | Vietnamese tokenization; instant full-text search |
| **Hosting** | Vercel | Edge Network + ISR native; zero-config deployment |
| **Analytics** | Vercel Analytics | Privacy-friendly; lightweight vs GA |
| **SEO** | `next-sitemap`, `next-seo`, `schema-dts` | Typed JSON-LD; declarative sitemaps |
| **i18n** | `next-intl` | `vi` default (no prefix); `en` via `/en/` sub-path |

---

## Architecture Overview

### Content Model (Sanity)

```
Article {
  slug: string           // Vietnamese URL-safe slug
  title: string
  excerpt: string        // Meta description — enforced 150-160 chars
  body: PortableText
  category: Reference    // News | Analysis | Investment | Education | Events | Prices
  tags: string[]
  author: Reference
  publishedAt: datetime
  featuredImage: Image   // Alt text required
  schemaType: enum       // 'NewsArticle' | 'Article' | 'FAQPage'
  sponsored: boolean     // Injects rel="sponsored" on outbound links
}
```

### Rendering Strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` Home | ISR | 60s |
| `/[category]/[slug]` Article | ISR | 300s |
| `/bang-gia` Prices | SSR | live |
| `/tim-kiem` Search | CSR | — |
| `/sitemap.xml` | Dynamic `app/sitemap.ts` | On publish |

### SEO & Schema.org

- **Homepage:** `WebSite` + `Organization` + `SearchAction`
- **Article:** `NewsArticle` — `author`, `datePublished`, `dateModified`, `image`, `publisher`, `articleSection`
- **Category:** `CollectionPage` + `BreadcrumbList`
- **Price page:** `WebPage` + `Dataset`
- **Author:** `Person` with `sameAs` social links

### hreflang & lang Strategy

Root layout sets `<html lang="vi">`. Every page renders a `HreflangTags` RSC that emits:

```html
<link rel="alternate" hreflang="vi"        href="https://blockhay.com/[path]" />
<link rel="alternate" hreflang="en"        href="https://blockhay.com/en/[path]" />
<link rel="alternate" hreflang="x-default" href="https://blockhay.com/[path]" />
```

`x-default` always resolves to the `vi` URL. Sitemap includes `<xhtml:link rel="alternate" hreflang>` entries for both locales. English pages are stub-acceptable at launch.

### Core Web Vitals

- `<Image priority>` on above-fold hero images (LCP)
- `next/font` Vietnamese-only subset — ~70% font payload reduction (LCP)
- Price ticker isolated as React island — no hydration layout shift (CLS)
- Ad scripts via `next/script strategy="lazyOnload"` + `Suspense` (INP)
- `<link rel="preconnect">` for CoinGecko, Sanity CDN, font origins

### Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| CoinGecko rate limits (30 req/min) | 30s polling debounce; Edge cache on SSR price route |
| Vietnamese slug collision | Sanity uniqueness constraint + publish-time validation |
| Ad scripts degrading INP | `lazyOnload` + `Suspense` isolation |
| Duplicate content (tags vs categories) | Canonical tags on tag pages → parent category |
| hreflang GSC errors | `HreflangTags` RSC unit-tested; sitemap audited via `next-sitemap` |