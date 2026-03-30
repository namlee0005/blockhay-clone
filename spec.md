# Blockhay Clone — SEO-Optimized Architecture Spec

## Executive Summary

Blockhay.com is a crypto/blockchain news and analysis platform. The clone delivers breaking news, market analysis, educational content, real-time price tickers, and community events in a multi-column editorial layout — monetized via display advertising and sponsored content.

The stack uses **Next.js 15 App Router** with a **custom MongoDB/Mongoose backend** and a **bespoke `/admin` panel** — Sanity CMS is removed entirely. Editorial content is managed via a Next.js Admin UI with TipTap rich text editing and NextAuth.js authentication. The application is self-hosted on a **VPS (Ubuntu/Node.js)** with PM2 for process management. All decisions target **Core Web Vitals** (LCP < 2.5s, CLS < 0.1, INP < 200ms), Schema.org structured data, and strong SEO with correct hreflang signaling and dynamic sitemaps.

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
| **Hosting** | VPS (Ubuntu / Node.js) | Full control; no vendor lock-in; PM2 process management + Nginx reverse proxy |
| **Analytics** | Self-hosted Umami (or lightweight script) | Privacy-friendly; no third-party data sharing |
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

### Image Upload Strategy (Local Filesystem)

Images are stored on the VPS filesystem and served as Next.js static assets. No external storage service required.

- **Upload endpoint:** `POST /api/admin/upload`
- **Storage path:** `public/uploads/YYYY/MM/{uuid}-{filename}.ext`
- **Served at:** `/uploads/YYYY/MM/{uuid}-{filename}.ext` (Next.js static serving)
- **Validation:** MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`); max 5MB server-side
- **Security:** UUID prefix prevents collisions; `..` path segments rejected; EXIF stripped via `sharp`

```typescript
// /api/admin/upload — implementation sketch
const filename = `${uuid()}-${sanitize(file.name)}`
const [year, month] = [new Date().getFullYear(), String(new Date().getMonth()+1).padStart(2,'0')]
const dir = path.join(process.cwd(), 'public', 'uploads', `${year}`, month)
await fs.mkdir(dir, { recursive: true })
await sharp(buffer).toFile(path.join(dir, filename))  // EXIF stripped automatically
return { url: `/uploads/${year}/${month}/${filename}` }
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
POST   /api/admin/upload         Image → public/uploads/YYYY/MM/
GET    /api/prices               CoinGecko proxy (server-cached 30s)
POST   /api/revalidate           On-demand ISR trigger (requires REVALIDATE_SECRET)
```

### VPS Deployment (PM2 + Nginx)

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blockhay',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 'max',     // cluster mode — one worker per CPU core
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
}
```

Nginx terminates SSL (Certbot/Let's Encrypt) and proxies `443 → localhost:3000`. Static `/uploads/` files served with long `Cache-Control` headers.

### Rendering Strategy

| Route | Strategy | Revalidate |
|---|---|---|
| `/` Home | ISR | 60s |
| `/[category]/[slug]` Article | ISR | On-demand via `/api/revalidate` |
| `/bang-gia` Prices | SSR | live |
| `/tim-kiem` Search | CSR | — |
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

### Core Web Vitals

- `<Image priority>` on above-fold hero images (LCP)
- `next/font` subset only — minimal font payload (LCP)
- Price ticker isolated as React island — no hydration layout shift (CLS)
- Ad scripts via `next/script strategy="lazyOnload"` + `Suspense` (INP)
- `<link rel="preconnect">` for CoinGecko and font origins

### Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| MongoDB cold-start latency | `mongoose.connect()` singleton in `lib/db.ts`; cached across requests |
| Admin XSS via TipTap output | `DOMPurify` on save and on render |
| NextAuth session fixation | Rotate JWT on role change; `httpOnly` + `secure` cookies |
| ISR cache poisoning | `/api/revalidate` requires `REVALIDATE_SECRET` header |
| CoinGecko rate limits | 30s debounce; server-side cached proxy at `/api/prices` |
| Duplicate content | Canonical tags on tag pages → parent category |
| Search index drift | MongoDB change streams → Meilisearch sync worker |
| Local upload path traversal | UUID filenames; `..` rejection; MIME validation; EXIF strip via `sharp` |
| VPS disk exhaustion | Periodic `public/uploads` cleanup cron; PM2 metrics disk alert at 80% |