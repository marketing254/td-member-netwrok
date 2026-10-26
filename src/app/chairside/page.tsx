import type { Metadata } from "next";
import ChairsideHomeView from "@/components/chairside/ChairsideHomeView";
import { notFound } from "next/navigation";
import { CHAIRSIDE_ENABLED, CHAIRSIDE_SHOW_COVER, CHAIRSIDE_STANDFIRST, CHAIRSIDE_TAGLINE, getLiveEpisodes } from "@/lib/chairside";

const SITE = "https://www.dentalmembernetwork.com";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Chairside, the podcast from the Dental Member Network",
  description: CHAIRSIDE_STANDFIRST,
  alternates: { canonical: "/chairside" },
  openGraph: {
    type: "website",
    title: `Chairside | ${CHAIRSIDE_TAGLINE}`,
    description: CHAIRSIDE_STANDFIRST,
    url: `${SITE}/chairside`,
    images: [CHAIRSIDE_SHOW_COVER],
  },
};

const SERIES_JSONLD = {
  "@context": "https://schema.org",
  "@type": "PodcastSeries",
  "@id": `${SITE}/chairside#series`,
  name: "Chairside",
  description: CHAIRSIDE_STANDFIRST,
  url: `${SITE}/chairside`,
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en-US",
};

/** /chairside: the show home, one card per published episode. */
export default function ChairsideHomePage() {
  if (!CHAIRSIDE_ENABLED) notFound();
  const episodes = getLiveEpisodes().sort((a, b) => b.number - a.number);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERIES_JSONLD) }} />
      <ChairsideHomeView episodes={episodes} />
    </>
  );
}
