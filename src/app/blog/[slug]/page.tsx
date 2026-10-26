import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleView from "@/components/blog/BlogArticleView";
import { getBlogArticle, getReleasedArticles, isReleased } from "@/lib/blog";

const SITE = "https://www.dentalmembernetwork.com";

/**
 * /blog/[slug] — one server-rendered page per approved article. Slugs,
 * titles, descriptions and copy come verbatim from the approved SEO
 * packages via the registry in src/lib/blog.ts. Statically prerendered
 * (generateStaticParams) so crawlers get complete HTML.
 */
export function generateStaticParams() {
  // Released articles are prerendered. Scheduled ones (publishAt in the
  // future) are not; dynamicParams + revalidate let them appear on their
  // day without a redeploy, and isReleased() 404s them until then.
  return getReleasedArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article || !isReleased(article)) return {};
  const share = article.shareImage ?? article.hero;
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
      images: [{ url: share.src, alt: share.alt ?? article.hero.alt, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: [share.src],
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
  if (!article || !isReleased(article)) notFound();

  const related = getReleasedArticles().filter((a) => a.slug !== article.slug);

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE}/blog/${article.slug}#article`,
        headline: article.title,
        description: article.metaDescription,
        image: [`${SITE}${article.hero.src}`, ...(article.shareImage ? [`${SITE}${article.shareImage.src}`] : [])],
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        inLanguage: "en-US",
        // DMN editorial team writes the article; the expert's guidance is
        // the source. Never mark the expert as author (brief rule).
        author: {
          "@type": "Organization",
          name: "Dental Member Network editorial team",
          url: SITE,
        },
        // The expert whose experience the post is built on (SEO brief,
        // Oct 2026): a Person in "about" with name, jobTitle, image, url.
        about: {
          "@type": "Person",
          name: article.expert.name,
          jobTitle: article.expert.role,
          image: article.expert.headshotUrl.startsWith("http") ? article.expert.headshotUrl : `${SITE}${article.expert.headshotUrl}`,
          ...(article.expert.profileHref ? { url: `${SITE}${article.expert.profileHref}` } : {}),
          ...(article.expert.website ? { sameAs: [`https://${article.expert.website.replace(/^https?:\/\//, "")}`] } : {}),
        },
        mentions: {
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
