import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import DOMPurify from "isomorphic-dompurify";
import mongoose from "mongoose";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET /api/admin/articles/[id] ────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();
  const article = await Article.findById(id).lean();
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(JSON.parse(JSON.stringify(article)));
}

// ─── PUT /api/admin/articles/[id] ────────────────────────────────────────────
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await connectDB();

  const article = await Article.findById(id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { title, slug, excerpt, body: rawBody, categorySlug, tags, featuredImageUrl,
    featuredImageAlt, schemaType, sponsored, status, seo, publishedAt } = body;

  if (title !== undefined) article.title = String(title);
  if (slug !== undefined) article.slug = String(slug);
  if (excerpt !== undefined) article.excerpt = String(excerpt);
  if (featuredImageUrl !== undefined) article.featuredImageUrl = String(featuredImageUrl);
  if (featuredImageAlt !== undefined) article.featuredImageAlt = String(featuredImageAlt);
  if (schemaType !== undefined) article.schemaType = schemaType as typeof article.schemaType;
  if (sponsored !== undefined) article.sponsored = Boolean(sponsored);
  if (Array.isArray(tags)) article.tags = tags as string[];
  if (seo !== undefined) article.seo = seo as typeof article.seo;

  if (rawBody !== undefined) {
    article.body = DOMPurify.sanitize(String(rawBody), {
      ALLOWED_TAGS: ["p","br","strong","em","s","code","pre","h2","h3","h4","ul","ol","li",
        "blockquote","hr","a","img","figure","figcaption"],
      ALLOWED_ATTR: ["href","src","alt","class","target","rel","title"],
      FORCE_BODY: true,
    });
  }

  if (categorySlug !== undefined && categorySlug !== article.categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).select("_id").lean();
    if (!cat) return NextResponse.json({ error: `Category '${String(categorySlug)}' not found` }, { status: 422 });
    article.category = cat._id as mongoose.Types.ObjectId;
    article.categorySlug = String(categorySlug);
  }

  if (status !== undefined) {
    article.status = status as typeof article.status;
    // Set publishedAt when first publishing
    if (status === "published" && !article.publishedAt) {
      article.publishedAt = publishedAt ? new Date(String(publishedAt)) : new Date();
    }
  }

  try {
    await article.save();
    return NextResponse.json({ id: article._id.toString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── DELETE /api/admin/articles/[id] ─────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can hard-delete
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();
  const result = await Article.findByIdAndDelete(id);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ deleted: true });
}
