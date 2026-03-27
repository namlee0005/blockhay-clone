import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Article, IArticleSeo, ArticleStatus, SchemaType } from "@/models/Article";
import { Category } from "@/models/Category";
import DOMPurify from "isomorphic-dompurify";

// ─── GET /api/admin/articles ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status && ["draft", "published", "archived"].includes(status)) filter.status = status;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { tags: { $regex: search, $options: "i" } },
  ];

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title slug status categorySlug authorSlug publishedAt updatedAt sponsored")
      .lean(),
    Article.countDocuments(filter),
  ]);

  return NextResponse.json({ articles: JSON.parse(JSON.stringify(articles)), total, page, limit });
}

// ─── POST /api/admin/articles ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, excerpt, body: rawBody, categorySlug, tags, featuredImageUrl,
    featuredImageAlt, schemaType, sponsored, status, seo, publishedAt } = body;

  // Basic required field validation
  if (!title || !slug || !excerpt || !categorySlug || !featuredImageUrl || !featuredImageAlt) {
    return NextResponse.json(
      { error: "Missing required fields: title, slug, excerpt, categorySlug, featuredImageUrl, featuredImageAlt" },
      { status: 422 },
    );
  }

  await connectDB();

  // Resolve category ObjectId
  const cat = await Category.findOne({ slug: categorySlug }).select("_id").lean();
  if (!cat) return NextResponse.json({ error: `Category '${String(categorySlug)}' not found` }, { status: 422 });

  // Sanitize TipTap HTML before storage
  const sanitizedBody = DOMPurify.sanitize(String(rawBody ?? ""), {
    ALLOWED_TAGS: ["p","br","strong","em","s","code","pre","h2","h3","h4","ul","ol","li",
      "blockquote","hr","a","img","figure","figcaption"],
    ALLOWED_ATTR: ["href","src","alt","class","target","rel","title"],
    FORCE_BODY: true,
  });

  try {
    const article = await Article.create({
      title: String(title),
      slug: String(slug),
      excerpt: String(excerpt),
      body: sanitizedBody,
      category: cat._id,
      categorySlug: String(categorySlug),
      author: (session.user as { id?: string }).id ?? cat._id,
      authorSlug: session.user.email?.split("@")[0] ?? "editor",
      tags: Array.isArray(tags) ? (tags as string[]) : [],
      featuredImageUrl: String(featuredImageUrl),
      featuredImageAlt: String(featuredImageAlt),
      schemaType: (schemaType as SchemaType | undefined) ?? "NewsArticle",
      sponsored: Boolean(sponsored),
      status: (status as ArticleStatus | undefined) ?? "draft",
      seo: (seo as IArticleSeo | undefined) ?? {},
      publishedAt: status === "published"
        ? (publishedAt ? new Date(String(publishedAt)) : new Date())
        : undefined,
    });

    return NextResponse.json({ id: article._id.toString() }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
