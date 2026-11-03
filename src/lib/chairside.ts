/**
 * Chairside, the podcast from the Dental Member Network: the registry for
 * the public episode pages (/chairside and /chairside/[slug]).
 *
 * Same idea as src/lib/blog.ts: one entry per episode, copy locked by
 * Lester. The member-portal listing (the full hour, captions, chapters,
 * audio, the Monday page) lives in the resources table, not here; this
 * file only drives the public website.
 *
 * Copy checked against "Episode page / EPISODE PAGE - copy and layout.md"
 * (Lester, 26 Oct 2026). Listen links and the YouTube link come
 * from Lester on launch day: a null link hides its button.
 */

export type ChairsideChapter = { time: string; label: string };

export type ChairsideEpisode = {
  slug: string;
  number: number;
  title: string;
  guest: {
    name: string;
    role: string;
    location: string;
    headshotUrl: string;
    /** Public expert profile (/experts/[id]) when one exists. */
    expertProfileHref: string | null;
    website: string | null;
    bio: string;
  };
  host: string;
  /** The public 20-minute cut. youtubeUrl null = not released yet (the page stays hidden). */
  publicVideo: { youtubeUrl: string | null; minutes: number };
  /** The public cut as audio, for the player under the video (Episode 2 on). */
  publicAudio?: { src: string; minutes: number };
  /** Listen buttons. A null link hides that button. */
  listen: { spotify: string | null; apple: string | null; youtube: string | null };
  /** 16:9 episode artwork, also the og:image. */
  /** ready=false until the art file is in /public; the YouTube thumbnail shows meanwhile. */
  cover: { src: string; alt: string; ready?: boolean };
  /** Square episode cover for the card on /chairside. */
  cardImage: { src: string; alt: string };
  /** Two lines under the title on the /chairside card. */
  cardSummary: string;
  description: string;
  pullQuote: { text: string; cite: string };
  /** Chapters of the public cut. */
  chapters: ChairsideChapter[];
  /** What members get: the full hour in the library. */
  memberLibrary: { resourceSlug: string; bullets: string[] };
  relatedArticle: { title: string; href: string; category: string } | null;
  datePublished: string;
  published: boolean;
  /** ISO instant the page may show (the YouTube video turns public then). Before it the page 404s. */
  liveFrom?: string;
};

/**
 * Master switch (Rushdha, 26 Oct 2026): nothing Chairside shows anywhere,
 * public site or member portal, until NEXT_PUBLIC_CHAIRSIDE_ENABLED=true is
 * set in Vercel. Episodes additionally wait for their own liveFrom time.
 */
export const CHAIRSIDE_ENABLED = process.env.NEXT_PUBLIC_CHAIRSIDE_ENABLED === "true";

export const CHAIRSIDE_TITLE = "Chairside";
export const CHAIRSIDE_TAGLINE = "The podcast from the Dental Member Network";
// Lester, EPISODE PAGE - copy and layout.md (26 Oct 2026).
export const CHAIRSIDE_STANDFIRST =
  "Practice owners and their teams hear from the people who’ve actually done it. Each episode is one expert and one practice problem, talked through in plain language, with steps a team can run on Monday. Members get every full episode and the expert’s Practice Playbook.";
/** The show cover (3000x3000 from Lester), served from /public. */
export const CHAIRSIDE_SHOW_COVER = "/chairside/show-cover.jpg";

/** Show-level listen links and the trailer, for /chairside (Lester, 26 Oct 2026). */
export const CHAIRSIDE_SHOW = {
  spotify: "https://open.spotify.com/show/516IE8CAHEPsjAXGHle8wN",
  apple: "https://podcasts.apple.com/us/podcast/chairside/id6826901944",
  youtube: "https://www.youtube.com/playlist?list=PLCf87RQppfqQ",
  // Episode 2 trailer (Lester, 3 Nov 2026); the Episode 1 trailer was https://youtu.be/XWUaGKazPe8.
  trailerYoutubeUrl: "https://youtu.be/rHaCLPuTro8",
};

/** The navy members box at the bottom of /chairside (Lester, 27 Oct 2026). */
export const CHAIRSIDE_MEMBERS_BOX = {
  eyebrow: "For members",
  title: "Every full episode, and the playbook that comes with it",
  body: "The public episodes run about 20 minutes. Members get the full hour, the Monday page and the expert\u2019s Practice Playbook in the member library.",
  button: "Join the Dental Member Network",
  href: "/join/member",
};

/** "1:00:10" or "4:49" to seconds. */
export function chapterSeconds(time: string): number {
  return time.split(":").map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

/** YouTube watch/short URL to its video id, or null. */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : (u.searchParams.get("v") ?? u.pathname.split("/").pop() ?? "");
    return id || null;
  } catch {
    return null;
  }
}

/** The link for one chapter: the YouTube video started at that second (Lester: add ?t=). */
export function chapterLink(youtubeUrl: string | null, time: string): string | null {
  const id = youtubeId(youtubeUrl);
  return id ? `https://youtu.be/${id}?t=${chapterSeconds(time)}` : null;
}

/** Cover art, or the YouTube thumbnail while the cover file has not arrived. */
export function coverSrc(ep: Pick<ChairsideEpisode, "cover" | "publicVideo">): { src: string; external: boolean } {
  const id = youtubeId(ep.publicVideo.youtubeUrl);
  if (ep.cover.ready === false && id) return { src: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, external: true };
  return { src: ep.cover.src, external: false };
}

export const CHAIRSIDE_EPISODES: ChairsideEpisode[] = [
  {
    slug: "nice-or-kind",
    number: 2,
    title: "Nice or kind: the conversation you keep putting off",
    guest: {
      name: "Julie Parker",
      role: "Co-founder, Dental Business Mastery",
      location: "Australia",
      headshotUrl: "/chairside/ep2/julie-parker.jpg",
      expertProfileHref: "/experts/e49a90a8-7edb-4d2a-b688-57d477065b44",
      website: "https://dentalbusinessmastery.com.au",
      bio: "Julie Parker began her career as a dental assistant and owned a dental practice in Australia for ten years, from 2003, before becoming a dental practice management consultant. She co-founded Dental Business Mastery with Ameena Basile, and she is an accredited practitioner of the Being Framework.",
    },
    host: "Hosted by Don Adeesha",
    // Lester + Chamal, 3 Nov 2026: YouTube and Spotify go public by themselves
    // at 6:00 am New York; Apple picks the episode up from Spotify within hours
    // (the show page stays the same).
    publicVideo: { youtubeUrl: "https://youtu.be/xcRCT9oA2q8", minutes: 22 },
    publicAudio: {
      src: "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/chairside/ep2/public-episode-22min.mp3",
      minutes: 22,
    },
    listen: {
      spotify: "https://open.spotify.com/episode/7hT1GaZJsBfZ887PpRPM9y",
      apple: "https://podcasts.apple.com/us/podcast/chairside/id6826901944",
      youtube: "https://youtu.be/xcRCT9oA2q8",
    },
    cardImage: { src: "/chairside/ep2/episode-cover.jpg", alt: "Chairside episode 2, Nice or kind: the conversation you keep putting off, with Julie Parker" },
    cardSummary: "Julie Parker on the conversation every owner keeps putting off: why nice is not kind, and how to make it kind, step by step.",
    cover: {
      src: "/chairside/ep2/cover.jpg",
      ready: true,
      alt: "What you tolerate, you get. Chairside episode 2 with Julie Parker",
    },
    description:
      "Julie Parker started out as a dental assistant, owned her own dental practice in Australia for ten years, and now runs Dental Business Mastery with Ameena Basile. On this episode of Chairside she talks about the difference between being nice and being kind: the owner who said yes to everyone, why A-type players leave when a C-type player is tolerated, how to have the conversation you\u2019ve been putting off, step by step, her own first hard conversation as an owner, and the one thing an owner can do this week.",
    pullQuote: {
      text: "Kind would have been telling them exactly what was at stake.",
      cite: "Julie Parker",
    },
    chapters: [
      { time: "0:00", label: "Cold open" },
      { time: "0:32", label: "What owning a practice teaches you" },
      { time: "3:06", label: "Nice or kind" },
      { time: "6:23", label: "The owner who said yes to everyone" },
      { time: "8:40", label: "A, B and C players" },
      { time: "11:07", label: "The conversation, step by step" },
      { time: "12:13", label: "The silent boss" },
      { time: "14:34", label: "Hygienist heaven" },
      { time: "17:42", label: "One thing this week" },
      { time: "18:59", label: "The question from the last chair" },
      { time: "20:40", label: "Where to go next" },
    ],
    memberLibrary: {
      resourceSlug: "nice-or-kind",
      bullets: [
        "The full 54-minute episode",
        "The Monday page: Julie\u2019s five steps for the conversation you\u2019ve been putting off, with a huddle checklist",
        "Julie\u2019s Practice Playbook: Nice Is Not Kind",
      ],
    },
    relatedArticle: null,
    datePublished: "2026-11-03",
    published: true,
    // Lester: live Tuesday 3 November, 6:00 am New York (EST).
    liveFrom: "2026-11-03T11:00:00Z",
  },
  {
    slug: "treating-people-not-patients",
    number: 1,
    title: "Treating people, not patients",
    guest: {
      name: "Dr. Michael Sonick, DMD",
      role: "Periodontist",
      location: "Fairfield, Connecticut",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/7461d5a0-55b6-4060-b662-b25e64a270e9-1788158860187.jpg",
      expertProfileHref: "/experts/7461d5a0-55b6-4060-b662-b25e64a270e9",
      website: "https://michaelsonick.com",
      bio: "A periodontist who has run his own practice in Fairfield, Connecticut since 1985. He has taught at NYU since 1984 and has written seven books, including one on hospitality, Treating People, Not Patients.",
    },
    host: "Hosted by Don Adeesha",
    // Lester, 26 Oct 2026. The YouTube video is private until Tue 27 Oct,
    // 6:00 am New York; publish the page after that.
    publicVideo: { youtubeUrl: "https://youtu.be/vrKvFyofed0", minutes: 21 },
    listen: {
      spotify: "https://open.spotify.com/episode/5OYsSnf04KaqWDdsQ0eMgG",
      apple: "https://podcasts.apple.com/us/podcast/chairside/id6826901944",
      youtube: "https://youtu.be/vrKvFyofed0",
    },
    cardImage: { src: "/chairside/ep1/episode-cover.jpg", alt: "Chairside episode 1, Treating people, not patients, with Dr. Michael Sonick" },
    cardSummary: "With Dr. Michael Sonick, DMD. Why he tells patients the truth, what slowing down costs, and the first hour every new patient gets in his office.",
    cover: {
      src: "/chairside/ep1/cover.jpg",
      ready: true,
      alt: "Be present. Chairside episode 1 with Dr. Michael Sonick, DMD",
    },
    description:
      "Dr. Michael Sonick has run his own periodontal practice in Fairfield, Connecticut since 1985. On the first episode of Chairside he talks about treating people, not patients: why he would rather talk a patient out of treatment than sell them the wrong thing, what slowing down actually costs a practice, the first hour every new patient gets in his office, and the one thing an owner can do this week.",
    pullQuote: {
      text: "When you're present for the patient, the cost is actually nothing.",
      cite: "Dr. Michael Sonick",
    },
    chapters: [
      { time: "0:00", label: "Cold open" },
      { time: "0:36", label: "Who is Dr. Michael Sonick" },
      { time: "4:49", label: "People, not procedures" },
      { time: "9:56", label: "What it costs to slow down" },
      { time: "11:53", label: "The first hour" },
      { time: "13:26", label: "Would you hire them again?" },
      { time: "15:28", label: "From the news: fear" },
      { time: "18:40", label: "One thing this week" },
      { time: "19:53", label: "The question from the last chair" },
      { time: "20:10", label: "Where to go next" },
    ],
    memberLibrary: {
      resourceSlug: "treating-people-not-patients",
      bullets: [
        "The full one-hour episode",
        "The Monday page: all six steps of Dr. Sonick's first hour, with a team huddle checklist",
        "Dr. Sonick's Practice Playbooks: We Didn't Get One Course and Take Care Of The Basics",
      ],
    },
    relatedArticle: {
      title: "How to Make New Dental Patients Feel Cared For: Dr. Michael Sonick's First Hour",
      href: "/blog/new-dental-patient-experience",
      category: "Patient Experience",
    },
    datePublished: "2026-10-27",
    published: true,
    // Lester: the YouTube video is private until Tue 27 Oct, 6:00 am New York.
    liveFrom: "2026-10-27T10:00:00Z",
  },
];

/** Published AND past its go-live time. Evaluate per request (pages revalidate hourly). */
export function isEpisodeLive(e: ChairsideEpisode, now = new Date()): boolean {
  if (!CHAIRSIDE_ENABLED) return false;
  // Local preview (npm run dev): show every published episode, even before
  // its go-live time or its YouTube link, so pages can be checked before
  // they go live. Production is unaffected (NODE_ENV is "production" there).
  if (process.env.NODE_ENV === "development") return e.published;
  // No YouTube link yet = the public page stays hidden (Lester, 3 Nov 2026:
  // "if the YouTube link isn't there by 6:00 am, keep the episode page hidden").
  if (!e.publicVideo.youtubeUrl) return false;
  return e.published && (!e.liveFrom || new Date(e.liveFrom).getTime() <= now.getTime());
}

export function getLiveEpisodes(now = new Date()): ChairsideEpisode[] {
  return CHAIRSIDE_EPISODES.filter((e) => isEpisodeLive(e, now));
}

/** Build-time snapshot; prefer getLiveEpisodes() inside request handlers. */
export const PUBLISHED_CHAIRSIDE_EPISODES = getLiveEpisodes();

export function getChairsideEpisode(slug: string): ChairsideEpisode | undefined {
  return CHAIRSIDE_EPISODES.find((e) => e.slug === slug);
}
