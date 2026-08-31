import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleView from "@/components/blog/BlogArticleView";
import { PUBLISHED_BLOG_ARTICLES, getBlogArticle } from "@/lib/blog";

const SITE = "https://dentalmembernetwork.com";

/**
 * /blog/[slug] — one server-rendered page per approved article. Slugs,
 * titles, descriptions and copy come verbatim from the approved SEO
 * packages via the registry in src/lib/blog.ts. Statically prerendered
 * (generateStaticParams) so crawlers get complete HTML.
 */
export function generateStaticParams() {
  // Only released articles get a page; unreleased ones (published: false)
  // 404 via dynamicParams=false until Lester clears them.
  return PUBLISHED_BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return {};
  return {
    // Approved meta titles are used exactly — absolute, no template suffix.
    title: { absolute: article.metaTitle },
    description: article.metaDescription,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.metaDescription,
      url: `${SITE}/blog/${article.slug}`,
      siteName: "Dental Member Network",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: [article.expert.name],
      images: [{ url: article.hero.src, alt: article.hero.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.hero.src],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article || article.published === false) notFound();

  const related = PUBLISHED_BLOG_ARTICLES.filter((a) => a.slug !== article.slug);

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE}/blog/${article.slug}#article`,
        headline: article.title,
        description: article.metaDescription,
        image: `${SITE}${article.hero.src}`,
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        inLanguage: "en-US",
        author: {
          "@type": "Person",
          name: article.expert.name,
          jobTitle: article.expert.role,
          ...(article.expert.profileHref ? { url: `${SITE}${article.expert.profileHref}` } : {}),
        },
        publisher: { "@id": `${SITE}/#organization` },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${article.slug}` },
        isPartOf: { "@id": `${SITE}/blog#blog` },
        articleSection: article.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: article.title, item: `${SITE}/blog/${article.slug}` },
        ],
      },
      // FAQPage — mirrors the approved on-page FAQ section exactly, so AI
      // answer engines can extract each Q&A as a self-contained passage.
      ...(article.faqs && article.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${SITE}/blog/${article.slug}#faq`,
              mainEntity: article.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <BlogArticleView article={article} related={related} />
    </>
  );
}
