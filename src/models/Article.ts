import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ArticleStatus = "draft" | "published" | "archived";
export type SchemaType = "NewsArticle" | "Article" | "FAQPage";

export interface IArticleSeo {
  metaTitle?: string;
  metaDesc?: string;
  canonicalUrl?: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;        // max 160 chars — used as meta description
  body: string;           // TipTap HTML output (DOMPurify sanitized on save)
  category: Types.ObjectId;
  categorySlug: string;   // Denormalized — avoids $lookup on feed queries
  author: Types.ObjectId; // ref: User
  authorSlug: string;     // Denormalized
  tags: string[];
  publishedAt: Date;
  featuredImageUrl: string;
  featuredImageAlt: string;
  schemaType: SchemaType;
  sponsored: boolean;
  status: ArticleStatus;
  seo: IArticleSeo;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: [160, "Excerpt must be ≤ 160 chars for SEO"],
    },
    body: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categorySlug: { type: String, required: true, lowercase: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorSlug: { type: String, required: true, lowercase: true, trim: true },
    tags: [{ type: String, trim: true }],
    publishedAt: { type: Date },
    featuredImageUrl: { type: String, required: true },
    featuredImageAlt: { type: String, required: true },
    schemaType: {
      type: String,
      enum: ["NewsArticle", "Article", "FAQPage"] satisfies SchemaType[],
      default: "NewsArticle",
    },
    sponsored: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"] satisfies ArticleStatus[],
      default: "draft",
      index: true,
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDesc: { type: String, trim: true },
      canonicalUrl: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Canonical route lookup: /[category]/[slug]
ArticleSchema.index({ categorySlug: 1, slug: 1 }, { unique: true });
// Feed queries — published articles sorted newest first
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ status: 1, categorySlug: 1, publishedAt: -1 });
ArticleSchema.index({ status: 1, authorSlug: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1, status: 1, publishedAt: -1 });

export const Article: Model<IArticle> =
  mongoose.models.Article ?? mongoose.model<IArticle>("Article", ArticleSchema);
