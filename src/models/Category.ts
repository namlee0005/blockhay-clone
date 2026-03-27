import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;          // Display name: "News", "Markets", "Web3 & DeFi", etc.
  slug: string;          // URL slug: "news", "markets", "web3-defi", etc.
  description?: string;
  parentCategory?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    parentCategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);
