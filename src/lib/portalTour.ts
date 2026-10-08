/**
 * Portal tour videos (Lester, 8 Oct 2026). Experts and partners only;
 * nothing here is shown on the member side. All four are unlisted on the
 * DMN YouTube channel and contain no pricing.
 *
 * Safe to import from client components.
 */

export type TourPortal = "expert" | "partner";

type TourVideo = { id: string; watchUrl: string; embedUrl: string; minutes: number };

const video = (id: string, minutes: number): TourVideo => ({
  id,
  watchUrl: `https://youtu.be/${id}`,
  // rel=0 keeps YouTube from suggesting other channels' videos at the end.
  embedUrl: `https://www.youtube.com/embed/${id}?rel=0`,
  minutes,
});

export const PORTAL_TOUR: Record<TourPortal, { quickGuide: TourVideo; walkthrough: TourVideo; heading: string }> = {
  partner: {
    quickGuide: video("H3vzLVLqhVQ", 5),
    walkthrough: video("YafZnQBuE_A", 11),
    heading: "Welcome to your partner portal",
  },
  expert: {
    quickGuide: video("67aQQ2N-ObY", 5),
    walkthrough: video("igwtKZ4sfYU", 7),
    heading: "Welcome to your expert portal",
  },
};

export const TOUR_COPY = {
  subheading: "Here's a quick tour to get you started. It takes about five minutes.",
  skip: "Skip for now",
  footer: "You can watch this again any time from Portal tour in the sidebar.",
  sidebarLabel: "Portal tour (5 min)",
  loginLink: "New here? Watch the 5-minute tour",
  /** One line for the approval / welcome emails, above the sign-in button. */
  emailLine: (portal: TourPortal) => `New to the portal? This five-minute video shows you around: ${PORTAL_TOUR[portal].quickGuide.watchUrl}`,
};
