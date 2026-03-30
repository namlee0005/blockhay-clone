# Blockhay Clone — Implementation Phases

> **Codebase verified at:** `/home/ben/project/projects/blockhay-clone/` — Next.js App Router project confirmed. Checkmarks reflect actual files found in `src/`.

---

## Phase 1: Foundation & Core Infrastructure

- [x] Scaffold Next.js 15 App Router project with TypeScript strict mode
- [x] Configure Tailwind CSS v4 with editorial theme tokens
- [x] ~~Set up Sanity.io project with Article, Category, Author schemas~~ → **Replaced: MongoDB schemas done in Phase 4**
- [ ] Implement `next/font` with optimized subset
- [x] Create base layout: `<html lang="en">`, `<header>`, `<main>`, `<footer>`, `<nav aria-label>` — `layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`
- [x] Build global price ticker React island — `components/PriceTicker.tsx`
- [ ] Configure `next-seo` defaults: site name, OG base image, Twitter card defaults
- [ ] Add `Organization` + `WebSite` + `SearchAction` JSON-LD to root layout
- [x] Scaffold `/robots.txt` and `/sitemap.xml` — `app/robots.ts`, `app/sitemap.ts`
- [ ] Deploy to VPS; configure Nginx reverse proxy + Certbot SSL

## Phase 2: Content Pages & SEO Implementation

- [x] Build Home page (ISR 60s) — `app/page.tsx`
- [x] Build Article detail page (`/[category]/[slug]`) — `app/[category]/[slug]/page.tsx`
  - [ ] `NewsArticle` JSON-LD: `author`, `datePublished`, `dateModified`, `image`, `publisher`, `articleSection`
  - [ ] `BreadcrumbList` JSON-LD
  - [ ] `<time datetime="ISO8601">` for publish and updated timestamps
  - [ ] `rel="nofollow sponsored"` when `article.sponsored === true`
  - [x] OG image via `@vercel/og` — `app/[category]/[slug]/opengraph-image.tsx`
- [x] Build Category listing pages — `app/[category]/page.tsx`
- [x] Build Author profile page (`/tac-gia/[slug]`) — `app/tac-gia/[slug]/page.tsx`
- [x] Build Price page (`/bang-gia`, SSR) — `app/bang-gia/page.tsx`
- [x] ~~Implement Meilisearch indexing via Sanity webhook~~ → **MongoDB change stream sync (Phase 4)**
- [x] Build Search UI (`/tim-kiem`) — `app/tim-kiem/page.tsx`
- [x] Split sitemap — `app/sitemap.ts`
- [x] Build `HreflangTags` RSC — `components/HreflangTags.tsx`
- [ ] Add `FAQPage` JSON-LD for `/tutorials/` articles
- [ ] Enforce single `<h1>` rule via ESLint plugin; audit all page types
- [ ] Add Lighthouse CI gate: fail build if Performance < 90 or SEO < 100

## Phase 3: Performance, Monetization & Launch Hardening

- [x] Implement skeleton loaders — `components/ArticleSkeleton.tsx`
- [ ] Add `<link rel="preconnect">` for CoinGecko and font origins
- [ ] Wrap ad slots in `next/script strategy="lazyOnload"` + `Suspense`
- [ ] Set up server-side response caching for `/bang-gia` SSR route
- [ ] Implement canonical tag logic: tag pages → parent category canonical URL
- [ ] Configure analytics (self-hosted Umami or lightweight script)
- [ ] Submit sitemap to Google Search Console and Bing Webmaster Tools
- [ ] Validate all JSON-LD via Google Rich Results Test for each page type
- [ ] Load test `/bang-gia` SSR at 100 concurrent users; confirm TTFB < 500ms
- [ ] Security hardening: CSP headers, `X-Robots-Tag`, ad script sandboxing
- [ ] Final Lighthouse audit: all routes >= 90 Performance, 100 SEO

## Phase 4: MongoDB Backend, Admin Panel & Auth

- [x] **Database:** MongoDB connection singleton — `lib/db.ts`, `lib/mongodb.ts`
- [x] **Schemas:** `Article`, `Category`, `User`, `Author` Mongoose models — `models/`
- [x] **Seed categories:** — `lib/seed.ts`
- [x] **NextAuth.js v5:** Configured — `auth.ts` + `app/api/auth/[...nextauth]/route.ts`
- [x] **Auth middleware:** Admin routes protected — `app/admin/layout.tsx`, `app/admin/login/page.tsx`
- [x] **Admin dashboard** (`/admin`) — `app/admin/page.tsx`
- [x] **Article list** (`/admin/articles`) — `app/admin/articles/page.tsx` + `ArticleListClient.tsx`
- [x] **Article editor** (`/admin/articles/new` + `/edit`):
  - [x] TipTap v2 rich text editor — `components/admin/RichTextEditor.tsx`, `ArticleEditorForm.tsx`
  - [ ] SEO fields panel: `metaTitle`, `metaDesc`, `canonicalUrl`
  - [ ] Publish / Save Draft / Archive controls
  - [ ] `DOMPurify` sanitization on save (XSS prevention)
- [x] **Image upload** (`/api/admin/upload`): saves to `public/uploads/YYYY/MM/`; UUID filename; MIME + size validation; EXIF strip via `sharp`; returns `/uploads/...` URL for TipTap insertion
- [x] **Admin article CRUD APIs** — `app/api/admin/articles/route.ts` + `[id]/route.ts`
- [ ] **Category CRUD** (`/admin/categories`): create, rename, reorder, delete with referential check
- [ ] **User management** (`/admin/users`, admin-only): invite editor, reset password, deactivate
- [x] **On-demand ISR** (`/api/revalidate`) — `app/api/revalidate/route.ts`
- [ ] **Meilisearch sync:** MongoDB change stream → index on insert/update, deindex on archive/delete
- [ ] **E2E smoke test:** Publish via admin → ISR revalidates → article live on frontend within 5s

## Phase 5: VPS Production Deployment

- [ ] Provision Ubuntu VPS (minimum 2 vCPU / 4GB RAM)
- [ ] Install Node.js 20 LTS, PM2, Nginx, Certbot on VPS
- [ ] Create `ecosystem.config.js` with PM2 cluster mode (`instances: 'max'`, `exec_mode: 'cluster'`)
- [ ] Configure Nginx: reverse proxy `localhost:3000` → 443; gzip compression; long `Cache-Control` for `/uploads/`
- [ ] Obtain SSL certificate via Certbot (`certbot --nginx -d blockhay.com`)
- [ ] Set all production env vars: `MONGODB_URI`, `NEXTAUTH_SECRET`, `REVALIDATE_SECRET`, `NEXTAUTH_URL`
- [ ] Run `npm run build && pm2 start ecosystem.config.js` on VPS
- [ ] Enable `pm2 startup` and `pm2 save` for reboot persistence
- [ ] Set correct write permissions on `public/uploads/` for the Node.js process user
- [ ] Configure logrotate for PM2 logs; set up disk usage alert at 80% capacity
- [ ] Configure automated MongoDB Atlas backups (daily snapshot, 7-day retention)
- [ ] CI/CD: GitHub Action on `main` push → SSH deploy (`git pull && npm run build && pm2 reload blockhay`)