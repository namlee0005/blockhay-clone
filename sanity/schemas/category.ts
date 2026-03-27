import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Danh mục",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Tên danh mục",
      type: "string",
      
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      
    }),
    defineField({
      name: "description",
      title: "Mô tả",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
