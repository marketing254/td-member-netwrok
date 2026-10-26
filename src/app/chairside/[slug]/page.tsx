import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EpisodeView from "@/components/chairside/EpisodeView";
import { CHAIRSIDE_TAGLINE, getLiveEpisodes, getChairsideEpisode, coverSrc, isEpisodeLive } from "@/lib/chairside";

const SITE = "https://www.dentalmembernetwork.com";

/**
 * /chairside/[slug]: one public page per episode, from the registry in
 * src/lib/chairside.ts. Revalidated hourly so a link added to the registry
 * (YouTube, Spotify, Apple) shows without a full rebuild.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getLiveEpisodes().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ep = getChairsideEpisode(slug);
  if (!ep || !isEpisodeLive(ep)) return {};
  const title = `${ep.title}, with ${ep.guest.name} | Chairside`;
  const cover = coverSrc(ep);
  const coverUrl = cover.external ? cover.src : SITE + cover.src;
  return {
    title: { absolute: title },
    description: ep.description,
    alternates: { canonical: `/chairside/${ep.slug}` },
    openGraph: {
      type: "video.episode",
      title,
      description: ep.description,
      url: `${SITE}/chairside/${ep.slug}`,
      siteName: "Dental Member Network",
      images: [{ url: coverUrl, alt: ep.cover.alt }],
    },
    twitter: { card: "summary_large_image", title, description: ep.description, images: [coverUrl] },
  };
}

export default async function ChairsideEpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ep = getChairsideEpisode(slug);
  if (!ep || !isEpisodeLive(ep)) notFound();

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "PodcastEpisode",
        "@id": `${SITE}/chairside/${ep.slug}#episode`,
        url: `${SITE}/chairside/${ep.slug}`,
        name: ep.title,
        episodeNumber: ep.number,
        description: ep.description,
        datePublished: ep.datePublished,
        image: (() => { const c = coverSrc(ep); return c.external ? c.src : `${SITE}${c.src}`; })(),
        timeRequired: `PT${ep.publicVideo.minutes}M`,
        ...(ep.publicVideo.youtubeUrl ? { associatedMedia: { "@type": "VideoObject", name: ep.title, contentUrl: ep.publicVideo.youtubeUrl } } : {}),
        actor: {
          "@type": "Person",
          name: ep.guest.name,
          jobTitle: ep.guest.role,
          ...(ep.guest.expertProfileHref ? { url: `${SITE}${ep.guest.expertProfileHref}` } : {}),
        },
        partOfSeries: {
          "@type": "PodcastSeries",
          "@id": `${SITE}/chairside#series`,
          name: "Chairside",
          description: CHAIRSIDE_TAGLINE,
          url: `${SITE}/chairside`,
        },
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Chairside", item: `${SITE}/chairside` },
          { "@type": "ListItem", position: 3, name: ep.title, item: `${SITE}/chairside/${ep.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <EpisodeView episode={ep} />
    </>
  );
}
