import type { Metadata } from "next";
import BlogIndexView from "@/components/blog/BlogIndexView";
import { getReleasedArticles, BLOG_INDEX_HEADING, BLOG_INDEX_STANDFIRST } from "@/lib/blog";

const SITE = "https://www.dentalmembernetwork.com";

export const metadata: Metadata = {
  title: "Blog — Dental Practice Growth, Operations and Leadership",
  description: BLOG_INDEX_STANDFIRST,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: `${BLOG_INDEX_HEADING} | Dental Member Network`,
    description: BLOG_INDEX_STANDFIRST,
    url: `${SITE}/blog`,
    images: [getReleasedArticles()[0]?.hero.src ?? "/blog/gary-kit-hero.jpg"],
  },
};

// The index renders from the in-repo registry and revalidates hourly, so
// a post scheduled with publishAt appears on its day without a deploy.
export const revalidate = 3600;

export default function BlogIndexPage() {
  const articles = getReleasedArticles();
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE}/blog#blog`,
    url: `${SITE}/blog`,
    name: BLOG_INDEX_HEADING,
    description: BLOG_INDEX_STANDFIRST,
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: "en-US",
    blogPost: articles.map((a) => ({
      "@type": "BlogPosting",
      "@id": `${SITE}/blog/${a.slug}#article`,
      headline: a.title,
      url: `${SITE}/blog/${a.slug}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <BlogIndexView articles={articles} />
    </>
  );
}
