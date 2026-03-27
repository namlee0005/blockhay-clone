# Blockhay Clone — Implementation Phases

## Phase 1: Foundation & Core Infrastructure

- [ ] Scaffold Next.js 15 App Router project with TypeScript strict mode
- [ ] Configure Tailwind CSS v4 with Vietnamese editorial theme tokens
- [ ] Set up Sanity.io with Article, Category, Author schemas (`sponsored`, `schemaType` fields included)
- [ ] Implement `next/font` with Vietnamese-only Unicode subset
- [ ] Create base layout: `<html lang="vi">`, `<header>`, `<main>`, `<footer>`, `<nav aria-label>`
- [ ] Build global price ticker React island (CoinGecko, 30s polling, no SSR hydration mismatch)
- [ ] Configure `next-seo` defaults; inject `Organization` + `WebSite` + `SearchAction` JSON-LD in root layout
- [ ] Configure `next-intl`: `vi` default (no prefix), `en` via `/en/` sub-path
- [ ] Build `HreflangTags` RSC: emits `hreflang="vi"`, `hreflang="en"`, `hreflang="x-default"` per page
- [ ] Scaffold `/robots.txt` and `/sitemap.xml` via `app/sitemap.ts` with `xhtml:link` alternate entries
- [ ] Deploy to Vercel; confirm Sanity webhook triggers ISR revalidation on publish

## Phase 2: Content Pages & SEO Implementation

- [ ] Build Home page (ISR 60s): hero article, multi-column grid, trending sidebar
- [ ] Build Article detail page (`/[category]/[slug]`, ISR 300s):
  - [ ] `NewsArticle` JSON-LD: `author`, `datePublished`, `dateModified`, `image`, `publisher`, `articleSection`
  - [ ] `BreadcrumbList` JSON-LD
  - [ ] `<time datetime="ISO8601">` for publish and updated dates
  - [ ] `rel="nofollow sponsored"` when `article.sponsored === true`
  - [ ] OG image via `@vercel/og` at 1200×630 with title overlay
- [ ] Build Category listing page: `CollectionPage` JSON-LD, cursor-based pagination
- [ ] Build Author profile page (`/tac-gia/[slug]`): `Person` JSON-LD with `sameAs`
- [ ] Build Price page (`/bang-gia`, SSR): `Dataset` JSON-LD, sortable CoinGecko table
- [ ] Set up Meilisearch: Sanity publish webhook → index update; Vietnamese tokenizer config
- [ ] Build Search UI (`/tim-kiem`, CSR): InstantSearch with Vietnamese keyboard support
- [ ] Split sitemap: `articles.xml` (ISR 1h, priority 0.8), `categories.xml` (0.9), `authors.xml` (0.5)
- [ ] Add `FAQPage` JSON-LD for `/kien-thuc-101/` educational articles
- [ ] Enforce single `<h1>` rule via ESLint plugin; audit all page types
- [ ] Add Lighthouse CI gate: fail build if Performance < 90 or SEO < 100

## Phase 3: Performance, Monetization & Launch Hardening

- [ ] Add skeleton loaders for all CSR components (CLS elimination)
- [ ] Add `<link rel="preconnect preload">` for CoinGecko, Sanity CDN, font origins
- [ ] Wrap ad slots in `next/script strategy="lazyOnload"` + `Suspense`
- [ ] Configure Edge caching for `/bang-gia` SSR (stale-while-revalidate 10s)
- [ ] Implement canonical tags: tag pages → parent category canonical URL
- [ ] Unit-test `HreflangTags` RSC for all route patterns; post-launch GSC hreflang validation
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools
- [ ] Validate all JSON-LD via Google Rich Results Test for every page type
- [ ] Load test `/bang-gia` SSR at 100 concurrent users; confirm TTFB < 500ms
- [ ] Add CSP headers, `X-Robots-Tag`, ad script sandboxing
- [ ] Final Lighthouse audit: >= 90 Performance, 100 SEO on all route types
- [ ] Smoke-test `/en/` alternates; verify `hreflang` self-referencing and `x-default` in GSC URL Inspection