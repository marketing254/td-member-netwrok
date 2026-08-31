import type { Metadata } from "next";
import BlogIndexView from "@/components/blog/BlogIndexView";
import { PUBLISHED_BLOG_ARTICLES, BLOG_INDEX_HEADING, BLOG_INDEX_STANDFIRST } from "@/lib/blog";

const SITE = "https://dentalmembernetwork.com";

export const metadata: Metadata = {
  title: "Blog — Dental Practice Growth, Operations and Leadership",
  description: BLOG_INDEX_STANDFIRST,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `${BLOG_INDEX_HEADING} | Dental Member Network`,
    description: BLOG_INDEX_STANDFIRST,
    url: `${SITE}/blog`,
    images: [PUBLISHED_BLOG_ARTICLES[0]!.hero.src],
  },
};

// The blog index and articles are static content from the in-repo
// registry — fully prerendered, crawlable HTML.
const BLOG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE}/blog#blog`,
  url: `${SITE}/blog`,
  name: BLOG_INDEX_HEADING,
  description: BLOG_INDEX_STANDFIRST,
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en-US",
  blogPost: PUBLISHED_BLOG_ARTICLES.map((a) => ({
    "@type": "BlogPosting",
    "@id": `${SITE}/blog/${a.slug}#article`,
    headline: a.title,
    url: `${SITE}/blog/${a.slug}`,
  })),
};

export default function BlogIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BLOG_JSONLD) }}
      />
      <BlogIndexView />
    </>
  );
}
