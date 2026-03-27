"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Send, Archive } from "lucide-react";

// Load TipTap only on client — ProseMirror has no SSR support
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

interface Category {
  slug: string;
  name: string;
}

interface ArticleData {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  categorySlug?: string;
  tags?: string[];
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  schemaType?: string;
  sponsored?: boolean;
  status?: string;
  seo?: { metaTitle?: string; metaDesc?: string; canonicalUrl?: string };
}

interface Props {
  categories: Category[];
  article?: ArticleData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function ArticleEditorForm({ categories, article }: Props) {
  const router = useRouter();
  const isEditing = Boolean(article?._id);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [categorySlug, setCategorySlug] = useState(article?.categorySlug ?? categories[0]?.slug ?? "");
  const [tagsInput, setTagsInput] = useState((article?.tags ?? []).join(", "));
  const [featuredImageUrl, setFeaturedImageUrl] = useState(article?.featuredImageUrl ?? "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(article?.featuredImageAlt ?? "");
  const [schemaType, setSchemaType] = useState(article?.schemaType ?? "NewsArticle");
  const [sponsored, setSponsored] = useState(article?.sponsored ?? false);
  const [metaTitle, setMetaTitle] = useState(article?.seo?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(article?.seo?.metaDesc ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(article?.seo?.canonicalUrl ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title on new articles
  function handleTitleChange(val: string) {
    setTitle(val);
    if (!isEditing && !slug) setSlug(slugify(val));
  }

  const handleBodyChange = useCallback((html: string) => setBody(html), []);

  async function submit(targetStatus: "draft" | "published" | "archived") {
    setError("");
    setSaving(true);

    const payload = {
      title, slug, excerpt, body, categorySlug,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      featuredImageUrl, featuredImageAlt, schemaType, sponsored,
      status: targetStatus,
      seo: { metaTitle, metaDesc, canonicalUrl },
    };

    try {
      const url = isEditing ? `/api/admin/articles/${article!._id}` : "/api/admin/articles";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }

      // Navigate to edit page after create, or back to list after publish/archive
      if (!isEditing && data.id) {
        router.push(`/admin/articles/${data.id}/edit`);
      } else if (targetStatus !== "draft") {
        router.push("/admin/articles");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {error && (
        <div role="alert" className="px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Title + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Article title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="my-article-slug"
          />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Excerpt <span className="text-red-500">*</span>
          <span className="ml-1 font-normal text-slate-400">({excerpt.length}/160)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={160}
          required
          rows={2}
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          placeholder="Short description — used as meta description (max 160 chars)"
        />
      </div>

      {/* Category + Schema + Sponsored */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Schema Type
          </label>
          <select
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="NewsArticle">NewsArticle</option>
            <option value="Article">Article</option>
            <option value="FAQPage">FAQPage</option>
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sponsored}
              onChange={(e) => setSponsored(e.target.checked)}
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            Sponsored content
          </label>
        </div>
      </div>

      {/* Featured image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Featured Image URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Featured Image Alt <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={featuredImageAlt}
            onChange={(e) => setFeaturedImageAlt(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Descriptive alt text"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Tags <span className="text-slate-400 font-normal">(comma separated)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="bitcoin, ethereum, defi"
        />
      </div>

      {/* Rich text body */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Body
        </label>
        <RichTextEditor
          content={body}
          onChange={handleBodyChange}
          placeholder="Write your article content here…"
        />
      </div>

      {/* SEO fields */}
      <details className="border border-slate-200 dark:border-slate-700 rounded-lg">
        <summary className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
          SEO Fields (optional overrides)
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Meta Title <span className="font-normal text-slate-400">({metaTitle.length}/60)</span>
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Meta Description <span className="font-normal text-slate-400">({metaDesc.length}/160)</span>
            </label>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              maxLength={160}
              rows={2}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Canonical URL
            </label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Leave blank to use default"
            />
          </div>
        </div>
      </details>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => void submit("draft")}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          <Save size={15} />
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => void submit("published")}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Send size={15} />
          {saving ? "Saving…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => void submit("archived")}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 transition-colors"
        >
          <Archive size={15} />
          Archive
        </button>
      </div>
    </form>
  );
}
