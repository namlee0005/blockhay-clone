import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  slug: string;
  avatarUrl?: string;
  avatarAlt?: string;
  bio?: string;
  socialLinks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String },
    avatarAlt: { type: String },
    bio: { type: String, trim: true },
    socialLinks: [{ type: String }],
  },
  { timestamps: true }
);

AuthorSchema.index({ slug: 1 });

export const Author: Model<IAuthor> =
  mongoose.models.Author ?? mongoose.model<IAuthor>("Author", AuthorSchema);
