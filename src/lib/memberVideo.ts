/**
 * The member introduction video, "One Place for Dental Offices" (Lester,
 * 13 Oct 2026). Three minutes, member side only. Embedded on the home page
 * and the join page; linked from the thumbnail in the abandoned-signup and
 * welcome emails, since video cannot play inside an email.
 *
 * Safe to import from client components.
 */
export const MEMBER_VIDEO = {
  title: "One Place for Dental Offices",
  minutes: 3,
  watchUrl: "https://youtu.be/6JgRq6HXNA0",
  // rel=0 keeps YouTube from suggesting other channels' videos at the end.
  embedUrl: "https://www.youtube.com/embed/6JgRq6HXNA0?rel=0",
  /** Served from /public; absolute URL for emails is built with the site origin. */
  thumbnailPath: "/video/member-intro-thumb.jpg",
  emailLine: "Here's a three-minute look at what you get",
} as const;
