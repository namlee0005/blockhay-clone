import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SchemaType = "NewsArticle" | "Article" | "FAQPage";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;        // 150–160 chars — meta description
  body: string;           // HTML string (from editor or MDX compilation)
  category: Types.ObjectId;
  categorySlug: string;   // Denormalized for query performance
  author: Types.ObjectId;
  authorSlug: string;     // Denormalized for query performance
  tags: string[];
  publishedAt: Date;
  featuredImageUrl: string;
  featuredImageAlt: string;
  schemaType: SchemaType;
  sponsored: boolean;
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
      minlength: [150, "Excerpt must be ≥ 150 chars for SEO"],
      maxlength: [160, "Excerpt must be ≤ 160 chars for SEO"],
    },
    body: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categorySlug: { type: String, required: true, lowercase: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    authorSlug: { type: String, required: true, lowercase: true, trim: true },
    tags: [{ type: String, trim: true }],
    publishedAt: { type: Date, required: true },
    featuredImageUrl: { type: String, required: true },
    featuredImageAlt: { type: String, required: true },
    schemaType: {
      type: String,
      enum: ["NewsArticle", "Article", "FAQPage"] satisfies SchemaType[],
      default: "NewsArticle",
    },
    sponsored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for the canonical article route: /[category]/[slug]
ArticleSchema.index({ categorySlug: 1, slug: 1 }, { unique: true });
// Feed queries — most pages sort by publishedAt desc
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ categorySlug: 1, publishedAt: -1 });
ArticleSchema.index({ authorSlug: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1, publishedAt: -1 });

export const Article: Model<IArticle> =
  mongoose.models.Article ?? mongoose.model<IArticle>("Article", ArticleSchema);
