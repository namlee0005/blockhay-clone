# Blockhay Clone — SEO-Optimized Architecture Spec

## Executive Summary

Blockhay.com is a crypto/blockchain news and analysis platform. The clone delivers breaking news, market analysis, educational content, real-time price tickers, and community events in a multi-column editorial layout — monetized via display advertising and sponsored content.

The stack uses **Next.js 15 App Router** with a **custom MongoDB/Mongoose backend** and a **bespoke `/admin` panel** — Sanity CMS is removed entirely. Editorial content is managed via a Next.js Admin UI with TipTap rich text editing and NextAuth.js authentication. All decisions target **Core Web Vitals** (LCP < 2.5s, CLS < 0.1, INP < 200ms), Schema.org structured data, and strong SEO with correct hreflang signaling and dynamic sitemaps.

---

## Recommended Tech Stack

| Layer | Technology | Reasoning |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | RSC + ISR; built-in `next/image`; unified frontend + admin in one repo |
| **Styling** | Tailwind CSS v4 | JIT purging; minimal bundle; editorial grid utilities |
| **Database** | MongoDB (Atlas) + Mongoose | Flexible document model suits article/category nesting; Atlas free tier for launch |
| **Rich Text** | TipTap v2 | Headless ProseMirror; outputs HTML; extensible with custom blocks |
| **Auth** | NextAuth.js v5 (Auth.js) | Credentials + Google OAuth; JWT sessions; `admin` / `editor` roles |
| **Price Data** | CoinGecko Public API | REST polling; no API key required for public tier |
| **Search** | Meilisearch (self-hosted) | Full-text search; synced via MongoDB change streams |
| **Hosting** | Vercel | Edge Network + ISR native; zero-config deployment |
| **Analytics** | Vercel Analytics | Privacy-friendly; lightweight |
| **SEO** | `next-sitemap`, `next-seo`, `schema-dts` | Typed JSON-LD; declarative sitemaps |

---

## Architecture Overview

### Category Taxonomy (English)

| Slug | Display Name |
|---|---|
| `news` | News |
| `markets` | Markets |
| `web3-defi` | Web3 & DeFi |
| `tutorials` | Tutorials |
| `reviews` | Reviews |

### MongoDB Schemas (Mongoose)

```typescript
// Article
{
  slug: String,           // unique, URL-safe
  title: String,
  excerpt: String,        // meta description, max 160 chars
  body: String,           // TipTap HTML output (DOMPurify sanitized on save)
  category: ObjectId,     // ref: Category
  tags: [String],
  author: ObjectId,       // ref: User
  publishedAt: Date,
  featuredImage: { url: String, alt: String },
  schemaType: String,     // 'NewsArticle' | 'Article' | 'FAQPage'
  sponsored: Boolean,
  status: String,         // 'draft' | 'published' | 'archived'
  seo: { metaTitle: String, metaDesc: String, canonicalUrl: String }
}

// Category
{ slug: String, name: String, description: String, parentCategory: ObjectId | null }

// User
{
  name: String, email: String, passwordHash: String,
  role: String,           // 'admin' | 'editor'
  bio: String, twitterHandle: String, avatarUrl: String
}
```

### Admin Panel (`/admin`)

All `/admin/*` routes protected via NextAuth.js middleware — unauthenticated → `/admin/login`.

| Route | Purpose |
|---|---|
| `/admin` | Dashboard: recent articles, draft count, quick-publish |
| `/admin/articles` | Article list: status filter, search, pagination |
| `/admin/articles/new` | TipTap editor + SEO fields + publish controls |
| `/admin/articles/[id]/edit` | Edit existing article |
| `/admin/categories` | CRUD for category taxonomy |
| `/admin/users` | User management (admin-only) |

**TipTap Extensions:** `StarterKit`, `Image`, `Link`, `CodeBlockLowlight`, `Youtube`, `Placeholder`, custom `CalloutBlock`.

### API Routes

```
POST   /api/admin/articles       Create article
PUT    /api/admin/articles/[id]  Update article
DELETE /api/admin/articles/[id]  Delete article
POST   /api/admin/upload         Image upload → Vercel Blob / S3
GET    /api/prices               CoinGecko proxy (Edge cached 30s)
POST   /api/revalidate           On-demand ISR trigger (requires REVALIDATE_SECRET)
```

All `/api/admin/*` routes validate `session.user.role` server-side — no client trust.

### Rendering Strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` Home | ISR | 60s |
| `/[category]/[slug]` Article | ISR | On-demand via `/api/revalidate` |
| `/prices` | SSR | live |
| `/search` | CSR | — |
| `/sitemap.xml` | Dynamic | Hourly + on-demand |

### SEO & Schema.org

- **Homepage:** `WebSite` + `Organization` + `SearchAction`
- **Article:** `NewsArticle` — `author`, `datePublished`, `dateModified`, `image`, `publisher`, `articleSection`
- **Category:** `CollectionPage` + `BreadcrumbList`
- **Price page:** `WebPage` + `Dataset`
- **Author:** `Person` with `sameAs` social links

### hreflang & lang Strategy

Root layout sets `<html lang="en">`. Every page renders a `HreflangTags` RSC:

```html
<link rel="alternate" hreflang="en"        href="https://blockhay.com/[path]" />
<link rel="alternate" hreflang="x-default" href="https://blockhay.com/[path]" />
```

Future locale expansion (e.g. `/vi/`) adds sub-path prefixes without breaking existing URLs.

### Core Web Vitals

- `<Image priority>` on above-fold hero images (LCP)
- `next/font` subset only — minimal font payload (LCP)
- Price ticker isolated as React island — no hydration layout shift (CLS)
- Ad scripts via `next/script strategy="lazyOnload"` + `Suspense` (INP)
- `<link rel="preconnect">` for CoinGecko, image CDN, font origins

### Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| MongoDB cold-start latency | `mongoose.connect()` singleton in `lib/db.ts`; cached across requests |
| Admin XSS via TipTap output | `DOMPurify` on save and on render |
| NextAuth session fixation | Rotate JWT on role change; `httpOnly` + `secure` cookies |
| ISR cache poisoning | `/api/revalidate` requires `REVALIDATE_SECRET` header |
| CoinGecko rate limits | 30s debounce; Edge-cached proxy at `/api/prices` |
| Duplicate content | Canonical tags on tag pages → parent category |
| Search index drift | MongoDB change streams → Meilisearch sync worker |