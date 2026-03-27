# Blockhay Clone — Implementation Phases

## Phase 1: Foundation & Core Infrastructure

- [ ] Scaffold Next.js 15 App Router project with TypeScript strict mode
- [ ] Configure Tailwind CSS v4 with editorial theme tokens
- [x] ~~Set up Sanity.io project with Article, Category, Author schemas~~ → **Replaced by Phase 4 MongoDB setup**
- [ ] Implement `next/font` with optimized subset
- [ ] Create base layout: `<html lang="en">`, `<header>`, `<main>`, `<footer>`, `<nav aria-label>`
- [ ] Build global price ticker React island (CoinGecko, 30s polling, no hydration mismatch)
- [ ] Configure `next-seo` defaults: site name, OG base image, Twitter card defaults
- [ ] Add `Organization` + `WebSite` + `SearchAction` JSON-LD to root layout
- [ ] Scaffold `/robots.txt` and base `/sitemap.xml` via `app/sitemap.ts`
- [x] ~~Deploy to Vercel; confirm Sanity webhook triggers ISR revalidation~~ → **On-demand ISR via `/api/revalidate` (Phase 4)**

## Phase 2: Content Pages & SEO Implementation

- [ ] Build Home page (ISR 60s): hero featured article, article grid, trending sidebar
- [ ] Build Article detail page (`/[category]/[slug]`, ISR on-demand):
  - [ ] `NewsArticle` JSON-LD: `author`, `datePublished`, `dateModified`, `image`, `publisher`, `articleSection`
  - [ ] `BreadcrumbList` JSON-LD
  - [ ] `<time datetime="ISO8601">` for publish and updated timestamps
  - [ ] `rel="nofollow sponsored"` when `article.sponsored === true`
  - [ ] OG image via `@vercel/og` at 1200×630 with title overlay
- [ ] Build Category listing pages for: `news`, `markets`, `web3-defi`, `tutorials`, `reviews`
- [ ] Build Author profile page (`/author/[slug]`): `Person` JSON-LD with `sameAs`
- [ ] Build Price page (`/prices`, SSR): `Dataset` JSON-LD, sortable CoinGecko table
- [x] ~~Implement Meilisearch indexing via Sanity webhook~~ → **MongoDB change stream sync (Phase 4)**
- [ ] Build Search UI (`/search`, CSR): Meilisearch InstantSearch
- [ ] Split sitemap: `articles.xml` (ISR 1h), `categories.xml`, `authors.xml`
- [ ] Add `FAQPage` JSON-LD for `/tutorials/` articles
- [ ] Enforce single `<h1>` rule via ESLint plugin; audit all page types
- [ ] Add Lighthouse CI gate: fail build if Performance < 90 or SEO < 100

## Phase 3: Performance, Monetization & Launch Hardening

- [ ] Implement skeleton loaders for all CSR/dynamic components (CLS elimination)
- [x] ~~Add `<link rel="preconnect">` for Sanity CDN~~ → **Preconnect for Vercel Blob / S3 CDN and CoinGecko**
- [ ] Wrap ad slots in `next/script strategy="lazyOnload"` + `Suspense`
- [ ] Set up Edge caching for `/prices` SSR route (stale-while-revalidate 10s)
- [ ] Implement canonical tag logic: tag pages → parent category canonical URL
- [ ] Configure Vercel Analytics + Core Web Vitals alerting
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools
- [ ] Validate all JSON-LD via Google Rich Results Test for each page type
- [ ] Load test `/prices` SSR at 100 concurrent users; confirm TTFB < 500ms
- [ ] Security hardening: CSP headers, `X-Robots-Tag`, ad script sandboxing
- [ ] Final Lighthouse audit: all routes >= 90 Performance, 100 SEO

## Phase 4: MongoDB Backend, Admin Panel & Auth

- [ ] **Database:** Connect MongoDB Atlas; create `lib/db.ts` singleton with Mongoose connection pooling
- [ ] **Schemas:** Define `Article`, `Category`, `User` Mongoose schemas per spec
- [ ] **Seed categories:** Insert `news`, `markets`, `web3-defi`, `tutorials`, `reviews` documents
- [ ] **NextAuth.js v5:** Configure Credentials + Google OAuth; JWT sessions; `admin` / `editor` roles
- [ ] **Auth middleware:** Protect all `/admin/*` and `/api/admin/*`; redirect unauthenticated → `/admin/login`
- [ ] **Admin dashboard** (`/admin`): recent articles, draft count, quick-publish shortcuts
- [ ] **Article list** (`/admin/articles`): paginated table with status filter + search
- [ ] **Article editor** (`/admin/articles/new` + `/edit`):
  - [ ] TipTap v2: `StarterKit`, `Image`, `Link`, `CodeBlockLowlight`, `Youtube`, `Placeholder`
  - [ ] SEO fields panel: `metaTitle`, `metaDesc`, `canonicalUrl`
  - [ ] Publish / Save Draft / Archive controls
  - [ ] `DOMPurify` sanitization on save (XSS prevention)
- [ ] **Image upload** (`/api/admin/upload`): upload to Vercel Blob or S3; return URL for TipTap
- [ ] **Category CRUD** (`/admin/categories`): create, rename, reorder, delete with referential check
- [ ] **User management** (`/admin/users`, admin-only): invite editor, reset password, deactivate
- [ ] **On-demand ISR** (`/api/revalidate`): validate `REVALIDATE_SECRET`; call `revalidatePath()` on publish
- [ ] **Meilisearch sync:** MongoDB change stream → index on insert/update, deindex on archive/delete
- [ ] **API hardening:** Verify `session.user.role` server-side on every `/api/admin/*`; return 403 on mismatch
- [ ] **E2E smoke test:** Publish via admin → ISR revalidates → article live on frontend within 5s