/**
 * RIDA Live replay (16 September 2026): the one source of truth for the
 * public replay page (/replay/rida-summit) and the member portal's Event
 * Replays section. Chapters, clips, speakers and the offer copy live here
 * so the two surfaces can never drift apart.
 *
 * Source files: D:\TD - Member Network\RIDA Emails (Lester, 29 Sep 2026):
 * "1 - Replay page brief", "3 - Chapters and clips", "4 - Offer spec".
 *
 * Copy rules (brief): no "card" wording, no long dashes, "Powered by",
 * hotline = Beacon answers right away and a person follows up in writing,
 * Chairside is "Episode one: DeVon Banks" with no date, no CE claimed for
 * the replay, never say the November seat costs money or is members-only.
 */

export const RIDA_VIMEO_ID = "1228380021";
export const RIDA_VIMEO_EMBED = `https://player.vimeo.com/video/${RIDA_VIMEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479`;

/** One fixed first-charge date for the whole cohort (Lester, 29 Sep). */
export const RIDA_TRIAL_END_ISO = "2027-01-06T05:00:00Z"; // Wednesday 6 January 2027, midnight Eastern
export const RIDA_TRIAL_END_LABEL = "Wednesday 6 January 2027";
/** Founding rate ($49 for life) closes when the November summit starts. */
export const RIDA_FOUNDING_CLOSES_ISO = "2026-11-06T12:00:00-05:00";
export const RIDA_FOUNDING_CLOSES_LABEL = "6 November";

/** Where every button on the replay page sends people. Carries the UTM so joins can be counted. */
export const RIDA_JOIN_UTM = "utm_source=replay&utm_campaign=rida";
export const RIDA_JOIN_HREF = `/rida/join?${RIDA_JOIN_UTM}`;
export const RIDA_JOIN_HREF_AFTER_EVENT = `/join/member?${RIDA_JOIN_UTM}`;

export function ridaFoundingOpen(now: Date = new Date()): boolean {
  return now.getTime() < new Date(RIDA_FOUNDING_CLOSES_ISO).getTime();
}

/** The join link, before and after the 6 November summit. */
export function ridaJoinHref(now: Date = new Date()): string {
  return ridaFoundingOpen(now) ? RIDA_JOIN_HREF : RIDA_JOIN_HREF_AFTER_EVENT;
}

export type ReplayChapter = { start: number; title: string; who: string };
export type ReplayClip = {
  n: string;
  speaker: string;
  title: string;
  /** Seconds into the replay where this moment starts. */
  at: number;
  chapter: number;
  seconds: number;
  poster: string;
};
export type ReplaySpeaker = { name: string; role: string };

function t(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number);
  return m * 60 + s;
}

export function fmtTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/** The thirty chapters, from "3 - Chapters and clips.pdf". Times are minutes:seconds into the recording. */
export const RIDA_CHAPTERS: ReplayChapter[] = [
  { start: t("0:00"), title: "Welcome, housekeeping and tonight's agenda", who: "Don" },
  { start: t("3:17"), title: "Meet panel one: the acceptance architecture", who: "Dr. Pandya, Ben Tuinei, Kiera Dent" },
  { start: t("5:12"), title: "What happens between the diagnosis and the yes", who: "Dr. Pandya" },
  { start: t("8:08"), title: "Is insurance really the problem?", who: "Ben Tuinei" },
  { start: t("10:21"), title: "Diagnosing well but collecting poorly", who: "Kiera Dent" },
  { start: t("14:04"), title: "AI-assisted treatment planning and the human conversation", who: "Dr. Pandya" },
  { start: t("17:16"), title: "When the fee comes up mid-conversation", who: "Ben Tuinei" },
  { start: t("23:39"), title: "Presenting the fee with confidence", who: "Kiera Dent" },
  { start: t("29:43"), title: "Staying on stage at the end of the day", who: "Kiera Dent" },
  { start: t("31:52"), title: "From \u201clet me think about it\u201d to \u201clet's schedule it\u201d", who: "Dr. Pandya" },
  { start: t("36:53"), title: "Where revenue leaks, and the three numbers to track", who: "Ben and Kiera" },
  { start: t("43:30"), title: "The follow-up system for unscheduled treatment", who: "Kiera Dent" },
  { start: t("49:10"), title: "The one shift that moves acceptance most", who: "Dr. Pandya" },
  { start: t("52:44"), title: "Taking back control from PPO fee schedules", who: "Ben Tuinei" },
  { start: t("56:34"), title: "From $500K to $2.4M, and what it really took", who: "Kiera Dent" },
  { start: t("61:32"), title: "Questions from the audience: perio charting, AR over 120 days", who: "Panel one" },
  { start: t("66:40"), title: "A resource from Ekwa: the practice growth audit", who: "Don" },
  { start: t("69:05"), title: "Panel two: culture is your moat", who: "Maria Jackson, Francesca Ortepi" },
  { start: t("71:18"), title: "What AI actually changes for the team, day to day", who: "Maria Jackson" },
  { start: t("75:58"), title: "What an operator sees that the clinician cannot", who: "Francesca Ortepi" },
  { start: t("77:55"), title: "Follow-up that works even when everyone forgets", who: "Maria Jackson" },
  { start: t("81:07"), title: "When patients push back against robots", who: "Francesca and Maria" },
  { start: t("86:51"), title: "Removing the single point of failure", who: "Francesca Ortepi" },
  { start: t("90:59"), title: "Why teams fall back to manual within three weeks", who: "Maria Jackson" },
  { start: t("96:25"), title: "Accountability without micromanaging", who: "Francesca Ortepi" },
  { start: t("105:02"), title: "Which touchpoints technology handles, and which a person must own", who: "Maria Jackson" },
  { start: t("111:36"), title: "Culture is revenue, not vibes", who: "Francesca Ortepi" },
  { start: t("114:24"), title: "How do you know if you are the problem?", who: "Francesca Ortepi" },
  { start: t("116:49"), title: "Audience questions: measuring an AI tool, the toxic high performer", who: "Panel two" },
  { start: t("121:14"), title: "Wrap-up and where to find the panelists", who: "Don" },
];

export const RIDA_RUNTIME_LABEL = "2 h 06 m";
export const RIDA_RUNTIME_SECONDS = 2 * 3600 + 6 * 60 + 28;

/** Index (0-based) of the chapter that contains a given time. */
export function chapterIndexAt(seconds: number): number {
  let idx = 0;
  for (let i = 0; i < RIDA_CHAPTERS.length; i++) {
    if (RIDA_CHAPTERS[i]!.start <= seconds) idx = i;
    else break;
  }
  return idx;
}

/**
 * Clip files live in the public `member-resources` bucket under
 * rida-replay/clips/, uploaded by scripts/rida-replay-upload.mjs. Posters
 * are still frames committed under public/replay/clips/.
 */
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export function ridaClipSrc(n: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/member-resources/rida-replay/clips/clip-${n}.mp4`;
}

/** The five clips on the page, in Lester's order (email 3): 01, 04, 05, 03, 06. */
export const RIDA_CLIPS: ReplayClip[] = [
  { n: "01", speaker: "Kiera Dent", title: "\u201cInsurance is a nice coupon. Don't be leading with that.\u201d", at: t("10:52"), chapter: 5, seconds: 48, poster: "/replay/clips/clip-01.jpg" },
  { n: "04", speaker: "Ben Tuinei", title: "Never lead with insurance. The 30 to 60 percent write-off.", at: t("9:51"), chapter: 4, seconds: 56, poster: "/replay/clips/clip-04.jpg" },
  { n: "05", speaker: "Dr. Ekta Pandya", title: "The patient hears it three or four times, or it loses urgency.", at: t("5:32"), chapter: 3, seconds: 59, poster: "/replay/clips/clip-05.jpg" },
  { n: "03", speaker: "Kiera Dent", title: "\u201cI never say those words out loud.\u201d The number on paper.", at: t("26:31"), chapter: 8, seconds: 34, poster: "/replay/clips/clip-03.jpg" },
  { n: "06", speaker: "Dr. Ekta Pandya", title: "The life cycle of a cavity, in real photos.", at: t("32:11"), chapter: 10, seconds: 63, poster: "/replay/clips/clip-06.jpg" },
];

export const RIDA_SPEAKERS: ReplaySpeaker[] = [
  { name: "Kiera Dent", role: "CEO and Founder, The Dental A Team" },
  { name: "Ben Tuinei", role: "Founder and President, Veritas Dental Resources" },
  { name: "Dr. Ekta Pandya", role: "Dentist, DDS, Public Health and AI Advocate" },
  { name: "Maria Jackson", role: "CEO and Founder, Dental AI Solutions" },
  { name: "Francesca Ortepi", role: "Founder, Dentech Direct, The Practice Operator" },
];

/** The Practice Playbook built from the event. topic_slug matches the import folder "Kit - Stop Losing Revenue You Already Earned". */
export const RIDA_PLAYBOOK = {
  slug: "stop-losing-revenue-you-already-earned",
  title: "Stop Losing Revenue You Already Earned",
  category: "Practice Management",
  cardSrc: "/replay/playbook-stop-losing-revenue-card.jpg",
  /** One line per section, each credited to its speaker (chapter file, page 4). */
  sections: [
    "The handoff: heard three or four times",
    "Value first, insurance as the assistant",
    "Presenting the fee, and the number on paper",
    "The explanation-based treatment plan",
    "Three numbers to track, and the treatment tracker",
    "Two days, two weeks, two months",
    "Scrub the EOBs, watch the network leasing",
    "A shadow for every star, an SOP for every role",
    "One KPI per role, not five",
    "A cheerleader for every tool",
  ],
  contents: "action guide, checklist, worksheet, wall poster, three SOPs, the clips",
};

/** Event Replays registry for the portal. Newest first. */
export type ReplayEntry = {
  slug: string;
  eyebrow: string;
  title: string;
  dateLabel: string;
  /** ISO date used for ordering. */
  date: string;
  blurb: string;
  speakers: string;
  banner: string;
  runtime: string | null;
  status: "live" | "coming";
  footnote: string;
};

export const RIDA_REPLAY_SLUG = "rida-live-2026-09-16";

export const EVENT_REPLAYS: ReplayEntry[] = [
  {
    slug: "rida-annual-summit-2026-11-06",
    eyebrow: "RIDA Annual Summit · 6 November 2026",
    title: "Built to Stay: The Independent Practice Operating System",
    dateLabel: "6 November 2026",
    date: "2026-11-06",
    blurb: "Nine speakers, six of them in this network. Your seat is booked; the replay arrives here afterwards.",
    speakers: "",
    banner: "/replay/rida-annual-2026-11-06-banner.jpg",
    runtime: null,
    status: "coming",
    footnote: "4 CE credits on the day",
  },
  {
    slug: RIDA_REPLAY_SLUG,
    eyebrow: "RIDA Live · 16 September 2026",
    title: "Stop Losing Revenue You Already Earned",
    dateLabel: "16 September 2026",
    date: "2026-09-16",
    blurb: "Two panels: the acceptance architecture, and culture is your moat.",
    speakers: RIDA_SPEAKERS.map((s) => s.name).join(", "),
    banner: "/replay/rida-live-2026-09-16-banner.jpg",
    runtime: RIDA_RUNTIME_LABEL,
    status: "live",
    footnote: "30 chapters · playbook inside",
  },
  {
    slug: "chairside",
    eyebrow: "Chairside · members-only podcast",
    title: "Episode one: DeVon Banks",
    dateLabel: "",
    date: "2026-01-01",
    blurb: "Every episode, in full, with chapters, as it is released.",
    speakers: "",
    banner: "",
    runtime: null,
    status: "coming",
    footnote: "",
  },
];
