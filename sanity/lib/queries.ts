import { groq } from "next-sanity";

export const homePageQuery = groq`{
  "featured": *[_type == "article"] | order(publishedAt desc) [0] {
    _id, title, slug, excerpt, publishedAt, sponsored,
    featuredImage { asset, alt },
    category->{ title, slug },
    author->{ name, slug }
  },
  "articles": *[_type == "article"] | order(publishedAt desc) [1..9] {
    _id, title, slug, excerpt, publishedAt,
    featuredImage { asset, alt },
    category->{ title, slug }
  }
}`;

export const articleQuery = groq`*[_type == "article" && slug.current == $slug && category->slug.current == $category][0] {
  _id, title, slug, excerpt, body, publishedAt, _updatedAt, sponsored, schemaType,
  featuredImage { asset, alt },
  category->{ title, slug },
  author->{ name, slug, socialLinks },
  tags
}`;

export const allArticleSlugsQuery = groq`*[_type == "article"] {
  "slug": slug.current,
  "category": category->slug.current,
  publishedAt, _updatedAt
}`;

export const allCategorySlugsQuery = groq`*[_type == "category"] {
  "slug": slug.current,
  _updatedAt
}`;
