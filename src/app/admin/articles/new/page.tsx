import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import ArticleEditorForm from "../ArticleEditorForm";

export default async function NewArticlePage() {
  await connectDB();
  const rawCategories = await Category.find().select("slug name").sort({ name: 1 }).lean();
  const categories: { slug: string; name: string }[] = JSON.parse(JSON.stringify(rawCategories));

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">New Article</h1>
      <ArticleEditorForm categories={categories} />
    </div>
  );
}
