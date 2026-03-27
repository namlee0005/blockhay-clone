import { ImageResponse } from "next/og";
import { sanityClient } from "@sanity/lib/client";
import { articleQuery } from "@sanity/lib/queries";
import { urlFor } from "@sanity/lib/image";

export const runtime = "edge";
export const alt = "Blockhay article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export default async function OGImage({ params }: Props) {
  const { category, slug } = await params;
  const article = await sanityClient.fetch(articleQuery, { slug, category });

  const bgUrl = article?.featuredImage
    ? urlFor(article.featuredImage.asset).width(1200).height(630).url()
    : null;

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
        {bgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgUrl}
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
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#f97316", fontWeight: 800, fontSize: 22 }}>
              Blockhay
            </span>
            {article?.category?.title && (
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
                {article.category.title}
              </span>
            )}
          </div>

          {/* Title */}
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

          {/* Author + date */}
          {article?.author && (
            <div style={{ color: "#94a3b8", fontSize: 18 }}>
              {article.author.name}
              {article.publishedAt && (
                <>
                  {" · "}
                  {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
