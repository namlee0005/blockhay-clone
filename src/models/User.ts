import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "admin" | "editor";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;  // undefined when using OAuth only
  role: UserRole;
  bio?: string;
  twitterHandle?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin", "editor"] satisfies UserRole[],
      default: "editor",
    },
    bio: { type: String, trim: true },
    twitterHandle: { type: String, trim: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
