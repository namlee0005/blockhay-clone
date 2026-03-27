import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { MeiliSearch } from "meilisearch";

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET!;
const MEILI_HOST = process.env.MEILISEARCH_HOST!;
const MEILI_KEY = process.env.MEILISEARCH_ADMIN_KEY!;
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN!;

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return `sha256=${expected}` === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("sanity-webhook-signature");

  if (!verifySignature(rawBody, sig)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    _type: string;
    _id: string;
    slug?: { current: string };
    title?: string;
    excerpt?: string;
    publishedAt?: string;
    category?: { slug: { current: string } };
    tags?: string[];
    operation: "create" | "update" | "delete";
  };

  // Only index articles
  if (payload._type !== "article") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const meili = new MeiliSearch({ host: MEILI_HOST, apiKey: MEILI_KEY });
  const index = meili.index("articles");

  if (payload.operation === "delete") {
    await index.deleteDocument(payload._id);
  } else {
    await index.addDocuments([
      {
        id: payload._id,
        title: payload.title ?? "",
        excerpt: payload.excerpt ?? "",
        slug: payload.slug?.current ?? "",
        category: payload.category?.slug?.current ?? "",
        tags: payload.tags ?? [],
        publishedAt: payload.publishedAt ?? "",
      },
    ]);
  }

  // Trigger ISR revalidation for the article path
  if (payload.slug?.current && payload.category?.slug?.current) {
    const path = `/${payload.category.slug.current}/${payload.slug.current}`;
    await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?path=${encodeURIComponent(path)}&token=${REVALIDATE_TOKEN}`
    );
  }

  return NextResponse.json({ ok: true });
}
