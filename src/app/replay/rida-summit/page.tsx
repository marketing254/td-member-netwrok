import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sortExpertsHouseFirst } from "@/lib/houseOrder";
import ReplayPageView, { type DirectoryFace } from "@/components/replay/ReplayPageView";
import {
  RIDA_CHAPTERS,
  RIDA_RUNTIME_SECONDS,
  RIDA_VIMEO_EMBED,
  RIDA_VIMEO_ID,
  ridaFoundingOpen,
} from "@/lib/events/ridaReplay";

/*
 * /replay/rida-summit, the public replay page (spec v2, 29 Sep 2026).
 * Free, no login, no form. For the September registrants who did not
 * finish joining, and for social. Not linked from the site navigation;
 * people reach it from the campaign emails and social posts.
 */

const SITE = "https://www.dentalmembernetwork.com";
const PATH = "/replay/rida-summit";
const TITLE = "Stop Losing Revenue You Already Earned: the full RIDA Live replay";
const DESCRIPTION =
  "Watch the full RIDA Live recording from 16 September 2026, free, in thirty chapters. Kiera Dent, Ben Tuinei, Dr. Ekta Pandya, Maria Jackson and Francesca Ortepi on case acceptance, insurance and the team that repeats it.";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Dental Member Network` },
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "video.other",
    url: `${SITE}${PATH}`,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${SITE}/replay/rida-live-2026-09-16-banner.jpg`, width: 1600, height: 927, alt: "RIDA Live, 16 September 2026: Stop Losing Revenue You Already Earned" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [`${SITE}/replay/rida-live-2026-09-16-banner.jpg`] },
};

async function loadFaces(): Promise<{ experts: DirectoryFace[]; partners: DirectoryFace[] }> {
  try {
    const sb = getSupabaseAdmin();
    const [e, v] = await Promise.all([
      sb.from("experts").select("id, display_name, full_name, headshot_url").eq("status", "active").not("headshot_url", "is", null).not("bio", "is", null).limit(40),
      sb.from("vendors").select("id, company_name, display_name, logo_url, avatar_url").eq("status", "approved").eq("verified", true).limit(40),
    ]);
    const experts = sortExpertsHouseFirst(e.data ?? [], (r) => r.display_name || r.full_name).map((r) => ({
      id: r.id,
      name: r.display_name || r.full_name || "",
      img: r.headshot_url as string,
      kind: "expert" as const,
    }));
    const partners: DirectoryFace[] = (v.data ?? []).flatMap((r) => {
      const img = r.logo_url ?? r.avatar_url;
      return img ? [{ id: r.id, name: r.display_name || r.company_name || "", img, kind: "partner" as const }] : [];
    });
    return { experts, partners };
  } catch {
    return { experts: [], partners: [] };
  }
}

export default async function ReplayRidaSummitPage() {
  const faces = await loadFaces();
  const foundingOpen = ridaFoundingOpen();

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        "@id": `${SITE}${PATH}#video`,
        name: "RIDA Live, 16 September 2026: Stop Losing Revenue You Already Earned",
        description: DESCRIPTION,
        thumbnailUrl: [`${SITE}/replay/rida-live-2026-09-16-banner.jpg`],
        uploadDate: "2026-09-19",
        duration: `PT${Math.floor(RIDA_RUNTIME_SECONDS / 3600)}H${Math.floor((RIDA_RUNTIME_SECONDS % 3600) / 60)}M${RIDA_RUNTIME_SECONDS % 60}S`,
        embedUrl: RIDA_VIMEO_EMBED,
        contentUrl: `https://vimeo.com/${RIDA_VIMEO_ID}`,
        isFamilyFriendly: true,
        publisher: { "@id": `${SITE}/#organization` },
        hasPart: RIDA_CHAPTERS.map((c, i) => ({
          "@type": "Clip",
          name: c.title,
          startOffset: c.start,
          endOffset: i + 1 < RIDA_CHAPTERS.length ? RIDA_CHAPTERS[i + 1]!.start : RIDA_RUNTIME_SECONDS,
          url: `${SITE}${PATH}?t=${c.start}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "RIDA Live replay", item: `${SITE}${PATH}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <ReplayPageView experts={faces.experts} partners={faces.partners} foundingOpen={foundingOpen} />
    </>
  );
}
