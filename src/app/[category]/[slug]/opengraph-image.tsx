import { ImageResponse } from "next/og";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";

// Edge runtime: Mongoose uses TCP which isn't available on the Edge runtime.
// Use Node.js runtime for this route so Mongoose can connect.
export const runtime = "nodejs";
export const alt = "Blockhay article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export default async function OGImage({ params }: Props) {
  const { category, slug } = await params;

  await connectDB();
  const article = await Article.findOne({ slug, categorySlug: category })
    .select("title featuredImageUrl featuredImageAlt categorySlug authorSlug publishedAt")
    .lean<{
      title: string;
      featuredImageUrl: string;
      featuredImageAlt: string;
      categorySlug: string;
      authorSlug: string;
      publishedAt: Date;
    }>();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0f172a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background image */}
        {article?.featuredImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.95) 40%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            padding: "48px 60px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#f97316", fontWeight: 800, fontSize: 22 }}>Blockhay</span>
            {article?.categorySlug && (
              <span
                style={{
                  backgroundColor: "#f97316",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {article.categorySlug}
              </span>
            )}
          </div>

          <div
            style={{
              color: "white",
              fontSize: article?.title && article.title.length > 80 ? 36 : 44,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: 900,
            }}
          >
            {article?.title ?? "Blockhay — Tin Tức Crypto & Blockchain"}
          </div>

          {article?.publishedAt && (
            <div style={{ color: "#94a3b8", fontSize: 18 }}>
              {article.authorSlug}
              {" · "}
              {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
