import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Bài viết",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tiêu đề",
      type: "string",
      
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      
    }),
    defineField({
      name: "excerpt",
      title: "Tóm tắt (meta description)",
      type: "text",
      rows: 3,
      
    }),
    defineField({
      name: "featuredImage",
      title: "Ảnh đại diện",
      type: "image",
      options: { hotspot: true },
      
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
        }),
      ],
    }),
    defineField({
      name: "category",
      title: "Danh mục",
      type: "reference",
      to: [{ type: "category" }],
      
    }),
    defineField({
      name: "author",
      title: "Tác giả",
      type: "reference",
      to: [{ type: "author" }],
      
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      title: "Ngày xuất bản",
      type: "datetime",
      
    }),
    defineField({
      name: "schemaType",
      title: "Schema.org type",
      type: "string",
      options: {
        list: [
          { title: "NewsArticle", value: "NewsArticle" },
          { title: "Article", value: "Article" },
          { title: "FAQPage", value: "FAQPage" },
        ],
        layout: "radio",
      },
      initialValue: "NewsArticle",
      
    }),
    defineField({
      name: "sponsored",
      title: "Nội dung tài trợ",
      type: "boolean",
      description: "Kích hoạt để thêm rel=sponsored vào outbound links",
      initialValue: false,
    }),
    defineField({
      name: "body",
      title: "Nội dung",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt text" }),
            defineField({ name: "caption", type: "string", title: "Caption" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "featuredImage",
    },
  },
  orderings: [
    {
      title: "Ngày xuất bản, mới nhất",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
