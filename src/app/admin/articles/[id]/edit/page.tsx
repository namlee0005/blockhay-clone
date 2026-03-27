import { connectDB } from "@/lib/db";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { notFound } from "next/navigation";
import ArticleEditorForm from "../../ArticleEditorForm";
import mongoose from "mongoose";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDB();

  const [rawArticle, rawCategories] = await Promise.all([
    Article.findById(id).lean(),
    Category.find().select("slug name").sort({ name: 1 }).lean(),
  ]);

  if (!rawArticle) notFound();

  const article = JSON.parse(JSON.stringify(rawArticle));
  const categories: { slug: string; name: string }[] = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Article</h1>
      <ArticleEditorForm categories={categories} article={article} />
    </div>
  );
}
