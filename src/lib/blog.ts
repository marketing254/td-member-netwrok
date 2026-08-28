/**
 * DMN blog registry — the single source of truth for every published
 * article. The public /blog index, the /blog/[slug] template, the sitemap
 * and the member-dashboard "From the blog" rail all read from here, so
 * publishing a new article is: add one entry + drop its hero image in
 * /public/blog.
 *
 * Copy is APPROVED VERBATIM from the launch packages in
 * "DMN-Three-Blog-Launch-Approved" (approver: Lester, 2026-08-24). Do not
 * rewrite article copy, titles, slugs, meta fields, CTA wording or CTA
 * destinations without Lester's sign-off.
 */

export type BlogBlock =
  | { kind: "p"; text: string; lead?: boolean }
  | { kind: "h2"; id: string; text: string; toc: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: { strong?: string; text: string }[] }
  | { kind: "quote"; text: string; cite: string }
  | { kind: "formula"; parts: string[] };

export type BlogArticle = {
  slug: string;
  /** The one H1 on the page. */
  title: string;
  /** Approved meta title, used ABSOLUTE (no site-name template suffix). */
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  /** Intro summary under the H1. */
  dek: string;
  expert: {
    name: string;
    role: string;
    headshotUrl: string;
    /** Public expert profile (/experts/[id]) when one exists. */
    profileHref: string | null;
  };
  /** The kit this article teases — member-portal pages link straight to it. */
  kitSlug: string;
  hero: { src: string; alt: string };
  readTime: string;
  datePublished: string;
  dateModified: string;
  /** Answer-first callout card right under the hero (AEO). */
  quickAnswer?: string;
  body: BlogBlock[];
  takeaway: { eyebrow: string; title: string; body: string };
  kitCta: {
    kitName: string;
    description: string;
    /** Referral landing that carries the 3-months-free offer. LOCKED by Lester. */
    href: string;
  };
};

/** CTA button label — locked by Lester in the build brief. */
export const BLOG_CTA_LABEL = "Start Your 3 Months Free";

export const BLOG_INDEX_HEADING = "Dental Practice Growth, Operations and Leadership";
export const BLOG_INDEX_STANDFIRST =
  "Practical, expert-led guidance for dental practice owners and teams. Full implementation resources are available inside Dental Member Network.";

/** Launch order per the build brief: Gary → Ashley → James. */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "fill-open-hygiene-appointments",
    title: "How to Fill Open Hygiene Appointments Before They Become Lost Production",
    metaTitle: "How to Fill Open Hygiene Appointments | Dental Member Network",
    metaDescription:
      "Use hygiene occupancy, pre-appointing, patient lists, and a weekly team rhythm to prevent open hygiene appointments from becoming lost production.",
    excerpt:
      "Measure hygiene occupancy weekly, keep a ready patient list, pre-appoint before patients leave, and use a short Monday huddle to correct gaps.",
    category: "Practice Management",
    dek: "A last-minute hole in the hygiene schedule is not just an inconvenience. It is chair time the practice cannot sell again. The fix starts with measuring hygiene occupancy every week, then building a simple prevention and recovery rhythm around it.",
    expert: {
      name: "Gary Takacs",
      role: "Founder, Thriving Dentist",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/gary-takacs-headshot.jpg",
      profileHref: "/experts/ecf8bd07-66e7-48f9-b002-b1b33adb2548",
    },
    kitSlug: "9-kpis",
    hero: {
      src: "/blog/gary-kit-hero.png",
      alt: "The 9 KPIs That Drive Your Practice resource kit featuring Gary Takacs",
    },
    readTime: "7 minute read",
    datePublished: "2026-08-28",
    dateModified: "2026-08-28",
    quickAnswer:
      "Track the percentage of available hygiene appointments that are filled, work a current list of patients who can take an opening, and pre-appoint every patient before they leave. Gary Takacs recommends a hygiene occupancy target of 98% or better and reviewing it every week, not after the month is over.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "When hygiene is busy, it is easy to assume the schedule is healthy. But “busy” and “full” are not the same thing. A few unfilled appointments each week can quietly become a recurring production problem.",
      },
      {
        kind: "p",
        text: "Gary includes Hygiene Occupancy among the nine practice KPIs he recommends tracking every week. His point is direct: an open slot is lost revenue that cannot be recovered once that time has passed. The number gives the team an early warning and turns a vague scheduling problem into something visible and actionable.",
      },
      { kind: "h2", id: "measure", text: "1. Measure the real gap before trying to fix it", toc: "Measure the real gap" },
      {
        kind: "p",
        text: "Hygiene occupancy is the percentage of available hygiene slots that were filled. Count the appointments that were actually available, compare them with the appointments that stayed filled, and review the result every week.",
      },
      {
        kind: "formula",
        parts: ["Filled hygiene appointments", "÷", "Available hygiene appointments", "× 100", "= Hygiene occupancy"],
      },
      {
        kind: "p",
        text: "The goal is not to punish the scheduling team. It is to see whether the practice has a one-off cancellation or a repeatable system problem. Mark the result green, yellow, or red against the target. When it is red, choose one corrective action and name one owner.",
      },
      { kind: "h2", id: "fill-now", text: "2. Give the team a ready list for today’s openings", toc: "Fill openings now" },
      {
        kind: "p",
        text: "A team should not start searching from zero every time an appointment opens. Keep a working list inside the practice management system for patients who can reasonably fill hygiene time, such as:",
      },
      {
        kind: "ul",
        items: [
          "Patients who cancelled and never rescheduled",
          "Patients who asked to be seen sooner",
          "Patients who are overdue for continuing care or periodontal maintenance",
          "New patients who are ready to book when an appropriate opening is available",
        ],
      },
      {
        kind: "p",
        text: "Work this list as a weekly office routine, not only when the schedule breaks. That keeps the information current and makes the response faster when the practice needs it.",
      },
      { kind: "h2", id: "prevent", text: "3. Prevent the next opening with pre-appointing", toc: "Prevent the next opening" },
      {
        kind: "p",
        text: "Gary’s central prevention habit is simple: every patient should leave with the next hygiene visit already booked. That shifts the team from trying to rebuild the schedule later to protecting it at the point of care.",
      },
      {
        kind: "quote",
        text: "“What gets measured gets managed. The practices that track their numbers grow. The ones that don’t are guessing.”",
        cite: "Gary Takacs",
      },
      {
        kind: "p",
        text: "Pre-appointing does not eliminate legitimate cancellations. It does create a stronger starting schedule. The team can then reinforce it with a clear appointment policy, consistent reminders, and direct conversations with patients who cancel repeatedly.",
      },
      { kind: "h2", id: "weekly", text: "4. Make hygiene occupancy part of the Monday huddle", toc: "Build the weekly habit" },
      {
        kind: "p",
        text: "Gary recommends compiling the nine KPIs into a one-page weekly report and reviewing them in a 15-minute Monday huddle. For hygiene occupancy, the discussion can stay short:",
      },
      {
        kind: "ol",
        items: [
          { strong: "What was last week’s occupancy?", text: "Mark it green, yellow, or red." },
          { strong: "Why did the open time happen?", text: "Separate preventable gaps from unavoidable events." },
          { strong: "What will we change this week?", text: "Choose one action and one owner." },
          { strong: "Did it work?", text: "Re-measure next Monday." },
        ],
      },
      {
        kind: "p",
        text: "Assign one team champion to own the number. That person does not have to solve every cancellation alone. Their job is to keep the measurement visible, make sure the agreed action happens, and bring the result back to the team.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "Do not wait for an empty chair to create urgency.",
      body: "Measure hygiene occupancy weekly, maintain a usable patient list, pre-appoint before patients leave, and review one corrective action in the Monday huddle. The number tells you when the system is slipping. The weekly habit helps the team correct it before open time becomes normal.",
    },
    kitCta: {
      kitName: "9 KPIs That Drive Your Practice",
      description:
        "The member kit includes the complete nine-KPI framework, benchmarks, an implementation checklist, and tools for building a weekly practice dashboard.",
      href: "/garytakacs",
    },
  },
  {
    slug: "change-systems-after-buying-dental-practice",
    title: "How to Change Systems After Buying a Dental Practice Without Losing the Team or Patients",
    metaTitle: "Changing Systems After Buying a Dental Practice | DMN",
    metaDescription:
      "A people-first approach to changing systems after a dental practice purchase while protecting the team, patients, and cash flow.",
    excerpt:
      "Protect the team, patients, and cash flow by explaining the benefit of change, phasing major systems, training first, and watching early operational signals.",
    category: "Practice Transitions",
    dek: "The legal handover may happen on one date. The human transition takes longer. Protect the value you purchased by building trust first, phasing major system changes, and watching the numbers that move before cash flow does.",
    expert: {
      name: "Ashley E. Boaz",
      role: "RDH, CDA · Founder, Mint Conceptions",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/ashley-boaz-headshot.jpg",
      profileHref: "/experts/73a95417-74cd-4ed7-b8ce-9e0843270a5d",
    },
    kitSlug: "transition-without-turbulence",
    hero: {
      src: "/blog/ashley-kit-hero.png",
      alt: "Transition Without Turbulence resource kit featuring Ashley E. Boaz",
    },
    readTime: "8 minute read",
    datePublished: "2026-08-28",
    dateModified: "2026-08-28",
    quickAnswer:
      "Do not replace every system on day one. Explain how the transition benefits the team and patients, learn from the experienced people already in the practice, separate small back-office changes from major clinical and practice-management changes, and train before switching. Ashley E. Boaz recommends roughly three months for smaller changes and six months for larger ones.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "Buying a profitable dental practice means buying more than equipment, charts, and a lease. Much of its working value lives in the confidence of the team and the trust of the patients.",
      },
      {
        kind: "p",
        text: "A new owner can complete the paperwork and still lose that value through rushed change. Ashley’s transition framework focuses on the people side of the handover because uncertainty can spread quickly. When the team is unsure, presentation confidence, productivity, and patient trust can begin to move with it.",
      },
      { kind: "h2", id: "people", text: "1. Start by explaining what the change means for them", toc: "Start with the people" },
      {
        kind: "p",
        text: "The existing team and patients were comfortable with the previous owner and the previous way of working. The first communication should not be a list of what the buyer plans to replace. It should answer the question everyone is quietly asking: “What does this mean for me?”",
      },
      {
        kind: "p",
        text: "Explain how the new ownership protects care, employment, and the future of the practice. Address concerns before people have to raise them. The goal is not to promise that nothing will change. The goal is to show that the change has been considered with them in mind.",
      },
      {
        kind: "quote",
        text: "“When people feel cared about and respected, they respond far better than when they’re simply told what to do”",
        cite: "Ashley E. Boaz",
      },
      { kind: "h2", id: "fit", text: "2. Confirm that the practice and the new owner actually fit", toc: "Confirm the fit" },
      {
        kind: "p",
        text: "A smooth transition starts before the keys change hands. Ashley recommends evaluating whether the incoming owner’s ideals match what the team and practice already have in place. Financial ability alone does not create a cultural fit.",
      },
      {
        kind: "p",
        text: "Look at how the practice communicates, how decisions are made, how patients experience care, and how the team performs everyday work. If the buyer intends to strip away nearly everything, that is closer to a restart than a transition. The staffing, patient, and operational plan should reflect that reality.",
      },
      {
        kind: "h2",
        id: "phase",
        text: "3. Separate small changes from changes that stop people doing their jobs",
        toc: "Phase the changes",
      },
      {
        kind: "p",
        text: "Teams usually expect some back-office changes after a purchase. A new payroll provider, phone system, text platform, or benefits process may be inconvenient, but people can often adapt without losing the ability to care for patients.",
      },
      {
        kind: "p",
        text: "Major systems are different. Practice-management software, imaging workflows, and billing processes affect how work moves from the operatory to the front desk and into collections. Changing them without preparation can slow the whole practice.",
      },
      { kind: "h3", text: "Months 1 to 3: smaller changes" },
      {
        kind: "p",
        text: "Phones, texting, payroll, benefits, and other back-office tools the team can learn without losing its clinical rhythm.",
      },
      { kind: "h3", text: "Months 4 to 6: major changes" },
      {
        kind: "p",
        text: "Practice-management software, imaging, clinical workflows, and billing changes that require real training and support.",
      },
      {
        kind: "p",
        text: "The timing is a guide, not a reason to delay every improvement. Use the practical test: if people need training before they can do their jobs in the new system, prepare and train before the switch. Do not turn on a major system Monday morning and expect the team to learn it while patients are waiting.",
      },
      { kind: "h2", id: "team", text: "4. Lean on the experienced team instead of arriving blind", toc: "Lean on the team" },
      {
        kind: "p",
        text: "The people already in the practice know where information lives, which processes are informal, and what patients expect. Treat them as transition partners. Ask them to show how work currently moves and where the existing system already creates friction.",
      },
      {
        kind: "p",
        text: "This does not give the team veto power over the future. It gives the incoming owner operational visibility and makes it easier to distinguish a necessary improvement from a change that creates disruption without enough benefit.",
      },
      { kind: "h2", id: "signals", text: "5. Watch the signals that move before cash flow", toc: "Watch early signals" },
      {
        kind: "p",
        text: "Aging accounts receivable tells you about problems that have already had time to build. Ashley points to two faster transition signals: claims that have not been submitted or sent, and treatment acceptance beginning to fall.",
      },
      {
        kind: "ul",
        items: [
          "**Unsubmitted or unsent claims:** An early sign that the clinical-to-billing handoff is breaking.",
          "**Treatment acceptance:** A fast signal that confidence, communication, or patient trust may be shifting.",
          "**Aging accounts receivable:** Still important, but slower to reveal when the problem began.",
        ],
      },
      {
        kind: "p",
        text: "Decide how the clinical team will communicate with billing before the previous hallway conversation disappears. A named channel, a reconciliation report, and clear ownership are more useful than discovering missing information after the claim has been delayed.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "The goal is continuity with a deliberate path to improvement.",
      body: "Start with trust. Explain the benefit of the change, listen to the experienced team, train before major systems move, and monitor the early signals. A slower, structured transition can protect the patients, people, and cash flow that made the practice worth buying.",
    },
    kitCta: {
      kitName: "Transition Without Turbulence",
      description:
        "The member kit includes Ashley’s complete transition framework, key takeaways, implementation checklist, worksheet, and training resources for protecting people and cash flow during a handover.",
      href: "/mintconceptions",
    },
  },
  {
    slug: "why-counting-new-patients-can-hide-a-broken-case-acceptance-system",
    title: "Why Counting New Patients Can Hide a Broken Dental Case Acceptance System",
    metaTitle: "Why Dental Case Acceptance Falls Behind New Patient Growth",
    metaDescription:
      "Learn how to spot gaps between new-patient growth and treatment scheduling, then build a clearer, patient-centered dental case-acceptance process.",
    excerpt:
      "New patients do not automatically create growth. Find the gaps between treatment presentation and scheduling with a patient-centered case-acceptance system.",
    category: "Case Acceptance",
    dek: "A growing patient count is not the same as a growing practice. James DeLuca's case-acceptance framework helps practice owners find where treatment conversations are losing momentum and build a better path to yes.",
    expert: {
      name: "James DeLuca",
      role: "Founder, Precision Dental Analytics",
      headshotUrl: "/blog/james-deluca-headshot.jpg",
      profileHref: "/experts/3a4486a8-117e-4db6-a0d3-fefb63668af6",
    },
    kitSlug: "close-the-case-not-just-the-patient",
    hero: {
      src: "/blog/james-kit-hero-v3.png",
      alt: "Close the Case, Not Just the Patient resource kit featuring James DeLuca",
    },
    readTime: "6 minute read",
    datePublished: "2026-08-28",
    dateModified: "2026-08-28",
    body: [
      {
        kind: "p",
        lead: true,
        text: "New-patient numbers can look encouraging while treatment acceptance quietly stalls. If patients are calling, booking, and arriving, but recommended care is not being scheduled, the practice has not solved its growth problem. It has simply moved the problem further along the patient journey.",
      },
      {
        kind: "p",
        text: "The better question is not only, “How many new patients did we get?” It is, “How reliably do we help the right patients understand, value, and schedule the care they need?”",
      },
      {
        kind: "p",
        text: "James DeLuca's *Close the Case, Not Just the Patient* kit focuses on this distinction. It gives owners and teams a way to look beyond arrivals and improve the system that turns a diagnosis into an informed patient decision.",
      },
      { kind: "h2", id: "first-door", text: "New-patient growth is only the first door", toc: "The first door" },
      {
        kind: "p",
        text: "Attracting a new patient matters. But it is an early step, not the outcome. A patient can be delighted with the front desk, enjoy a friendly appointment, and still leave without moving forward on recommended treatment.",
      },
      {
        kind: "p",
        text: "When this happens repeatedly, leaders often react by asking for more leads, more calls, or more marketing. Those initiatives may increase activity, but they do not repair the moment where value is lost.",
      },
      { kind: "p", text: "Instead, separate these measures:" },
      {
        kind: "ul",
        items: [
          "New patients acquired",
          "Patients diagnosed with a treatment need",
          "Treatment presented",
          "Treatment scheduled",
          "Treatment started and completed",
        ],
      },
      {
        kind: "p",
        text: "The gap between those measures is where the case-acceptance system needs attention.",
      },
      { kind: "h2", id: "why-patients-wait", text: "Why patients do not move forward", toc: "Why patients wait" },
      {
        kind: "p",
        text: "A patient saying “I need to think about it” is not automatically an objection to overcome. It can mean the patient does not yet understand the problem, does not see why timing matters, does not feel confident about the solution, or has not been given a practical next step.",
      },
      {
        kind: "p",
        text: "That is why the strongest case-acceptance process is not a pressure script. It is a patient-centered communication system. The team makes the clinical recommendation clear, connects it to the patient's own goals, answers questions honestly, and makes the next decision easy to understand.",
      },
      { kind: "h2", id: "seven-doors", text: "Use the seven-door mindset", toc: "The seven-door mindset" },
      {
        kind: "p",
        text: "In *Close the Case, Not Just the Patient*, James uses a Seven Doors framework to help teams examine the decision path rather than blaming one conversation or one team member.",
      },
      {
        kind: "p",
        text: "The useful leadership question is: where does the patient journey stop moving?",
      },
      { kind: "p", text: "For example:" },
      {
        kind: "ul",
        items: [
          "Is the diagnosis clear in plain language?",
          "Did the patient have enough time to ask questions?",
          "Was the recommended care connected to the patient’s own priorities?",
          "Did the conversation include a specific next step?",
          "Did the team handle financial options clearly and respectfully?",
          "Was the patient given a reason to act now, without fear or pressure?",
          "Is there a follow-up process for patients who leave undecided?",
        ],
      },
      {
        kind: "p",
        text: "Each answer points to a system issue that can be coached, measured, and improved.",
      },
      { kind: "h2", id: "metric", text: "Make treatment value a visible practice metric", toc: "Make value visible" },
      {
        kind: "p",
        text: "Most practices already track activity: calls, new patients, production, and collections. James's framework adds a more revealing conversation: how much diagnosed treatment is being understood and accepted by patients?",
      },
      {
        kind: "p",
        text: "Choose a simple measurement your team can review consistently. The exact calculation should match your software and workflow, but the purpose is the same: make the distance between presented treatment and scheduled treatment visible.",
      },
      {
        kind: "p",
        text: "Review it alongside new-patient volume. If new patients rise but scheduled treatment does not, the practice has a clear signal that marketing is not the first issue to solve.",
      },
      { kind: "h2", id: "conversation", text: "Build a calmer, more useful treatment conversation", toc: "A better conversation" },
      { kind: "p", text: "Good case acceptance begins before the financial conversation. It starts with listening." },
      {
        kind: "p",
        text: "When a patient describes discomfort, appearance concerns, a future event, or a desire to keep their teeth healthy, capture those words. During the recommendation, connect the clinical finding back to what the patient said matters to them.",
      },
      { kind: "p", text: "Then keep the conversation practical:" },
      {
        kind: "ol",
        items: [
          { text: "Explain the finding in plain language." },
          { text: "Show the patient what you are seeing when visual tools are available." },
          { text: "Explain the consequence of waiting without exaggeration." },
          { text: "Present the recommended path clearly." },
          { text: "Ask what questions the patient has." },
          { text: "Discuss appropriate payment or financing options transparently." },
          { text: "Agree on the next step before the patient leaves." },
        ],
      },
      {
        kind: "p",
        text: "This approach respects patient choice. It also gives the team a repeatable structure that does not depend on one naturally persuasive person.",
      },
      { kind: "h2", id: "follow-up", text: "Follow up with purpose", toc: "Follow up with purpose" },
      {
        kind: "p",
        text: "Not every patient will decide on the day of the visit. That is normal. What matters is whether the practice has a consistent, useful follow-up process.",
      },
      {
        kind: "p",
        text: "Follow up should refer to the patient’s stated concern, restate the recommended next step, make it easy to ask questions, and offer a clear scheduling route. Avoid generic reminders that feel automated or transactional.",
      },
      {
        kind: "p",
        text: "The goal is not to chase a patient into saying yes. The goal is to make sure an informed patient can act when they are ready.",
      },
      { kind: "h2", id: "team-meeting", text: "What to discuss in the next team meeting", toc: "The next team meeting" },
      {
        kind: "p",
        text: "Start small. Ask the team to identify one point in the treatment path that feels inconsistent. It may be how treatment is explained, when financial options are introduced, who owns follow-up, or how results are tracked.",
      },
      {
        kind: "p",
        text: "Improve one part, review the result, and then move to the next. Consistent execution will teach the practice more than a one-time motivational push.",
      },
    ],
    takeaway: {
      eyebrow: "The bottom line",
      title: "New patients are valuable, but they are not the finish line.",
      body: "A sustainable practice helps patients understand the care they need, see its relevance to their goals, and take the next step with confidence.",
    },
    kitCta: {
      kitName: "Close the Case, Not Just the Patient",
      description:
        "The member kit gives owners and teams a way to look beyond arrivals and improve the system that turns a diagnosis into an informed patient decision.",
      href: "/jamesdeluca",
    },
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
