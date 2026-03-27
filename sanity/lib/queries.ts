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

export const categoryPageQuery = groq`{
  "category": *[_type == "category" && slug.current == $slug][0] {
    _id, title, slug, description, _updatedAt
  },
  "articles": *[_type == "article" && category->slug.current == $slug] | order(publishedAt desc) [$from..$to] {
    _id, title, slug, excerpt, publishedAt,
    featuredImage { asset, alt },
    author->{ name, slug }
  },
  "total": count(*[_type == "article" && category->slug.current == $slug])
}`;

export const authorPageQuery = groq`{
  "author": *[_type == "author" && slug.current == $slug][0] {
    _id, name, slug, avatar { asset, alt }, bio, socialLinks
  },
  "articles": *[_type == "article" && author->slug.current == $slug] | order(publishedAt desc) [0..11] {
    _id, title, slug, excerpt, publishedAt,
    featuredImage { asset, alt },
    category->{ title, slug }
  }
}`;

export const allAuthorSlugsQuery = groq`*[_type == "author"] {
  "slug": slug.current,
  _updatedAt
}`;
