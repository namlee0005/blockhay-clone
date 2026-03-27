import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import type { IArticle } from "@/models/Article";

const PAGE_SIZE = 12;

// GET /api/articles
// Query params: category, author, tag, page (1-indexed), limit
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const author = searchParams.get("author");
  const tag = searchParams.get("tag");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (category) filter.categorySlug = category;
  if (author) filter.authorSlug = author;
  if (tag) filter.tags = tag;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-body") // body is large; omit from list views
      .lean(),
    Article.countDocuments(filter),
  ]);

  return NextResponse.json(
    { articles, total, page, pages: Math.ceil(total / limit) },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } }
  );
}

// POST /api/articles
// Body: article fields; protected by ADMIN_SECRET header
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = (await req.json()) as Partial<IArticle>;

  const article = await Article.create({
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    body: body.body ?? "",
    category: body.category,
    categorySlug: body.categorySlug,
    author: body.author,
    authorSlug: body.authorSlug,
    tags: body.tags ?? [],
    publishedAt: body.publishedAt ? new Date(String(body.publishedAt)) : new Date(),
    featuredImageUrl: body.featuredImageUrl,
    featuredImageAlt: body.featuredImageAlt,
    schemaType: body.schemaType ?? "NewsArticle",
    sponsored: body.sponsored ?? false,
  });

  return NextResponse.json(article, { status: 201 });
}
