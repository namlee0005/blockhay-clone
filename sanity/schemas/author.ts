import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Tác giả",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Tên",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "avatar",
      title: "Ảnh đại diện",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text" }),
      ],
    }),
    defineField({
      name: "bio",
      title: "Tiểu sử",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "socialLinks",
      title: "Mạng xã hội",
      type: "array",
      of: [{ type: "url" }],
    }),
  ],
  preview: {
    select: { title: "name", media: "avatar" },
  },
});
