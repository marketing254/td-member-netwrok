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
  | { kind: "quote"; text: string; cite?: string }
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
  /** Approved FAQ section — rendered on-page AND emitted as FAQPage JSON-LD. */
  faqs?: { q: string; a: string }[];
  takeaway: { eyebrow: string; title: string; body: string };
  kitCta: {
    kitName: string;
    description: string;
    /** CTA destination. LOCKED by Lester per article — never change without approval. */
    href: string;
    /** Per-article button label (falls back to BLOG_CTA_LABEL). LOCKED by Lester. */
    label?: string;
    /** Approved sentence rendered above the button (supports **bold**). */
    support?: string;
  };
  /**
   * false = approved for staging but NOT released (e.g. CTA destination
   * still unconfirmed by Lester). Unpublished articles are excluded from
   * the index, sitemap, related rails and static generation.
   */
  published?: boolean;
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
      src: "/blog/gary-kit-hero.jpg",
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
      src: "/blog/ashley-kit-hero.jpg",
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
      headshotUrl: "/blog/james-deluca-headshot-v2.jpg",
      profileHref: "/experts/3a4486a8-117e-4db6-a0d3-fefb63668af6",
    },
    kitSlug: "close-the-case-not-just-the-patient",
    hero: {
      src: "/blog/james-kit-hero-v3.jpg",
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
  // ---- Week 2 (approved by Lester 2026-08-30) --------------------------
  {
    slug: "new-patient-calls-to-appointments",
    title: "Why New-Patient Calls Fail to Become Appointments",
    metaTitle: "Why New-Patient Calls Fail to Book | DMN",
    metaDescription:
      "Use a warm greeting, seven discovery questions, clear insurance and price responses, and a two-option close to book more dental new-patient calls.",
    excerpt:
      "A repeatable phone process helps the front desk welcome new callers, understand their needs, answer common questions, and offer a clear appointment choice.",
    category: "Front Desk",
    dek: "A new-patient call can end in a booked visit or a polite goodbye. Gary Takacs's phone framework gives the front desk a repeatable way to welcome the caller, understand what they need, handle common questions, and offer a clear next step.",
    expert: {
      name: "Gary Takacs",
      role: "Founder, Thriving Dentist",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/gary-takacs-headshot.jpg",
      profileHref: "/experts/ecf8bd07-66e7-48f9-b002-b1b33adb2548",
    },
    kitSlug: "new-patient-phone-call",
    hero: {
      src: "/blog/gary-phone-kit-hero.jpg",
      alt: "The New Patient Phone Call resource kit featuring Gary Takacs",
    },
    readTime: "7 minute read",
    datePublished: "2026-08-31",
    dateModified: "2026-08-31",
    quickAnswer:
      "New-patient calls often fail when the team sounds rushed, treats the call as data entry, gives a flat answer to an insurance or price question, or ends without directly offering an appointment. A stronger process is to answer promptly, use a warm greeting, ask a consistent set of discovery questions, and close with two specific appointment times.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "The caller has already taken an important step. They found the practice, decided it might be able to help, and picked up the phone. The front desk should make the next step feel clear and easy.",
      },
      { kind: "h2", id: "why-it-matters", text: "Why the first call matters so much", toc: "Why the call matters" },
      {
        kind: "p",
        text: "Marketing creates attention. The phone call is where that attention becomes a real patient relationship.",
      },
      {
        kind: "p",
        text: "If the call feels cold, confusing, or difficult, the practice can lose the opportunity even when its website, reviews, and advertising worked. Gary's framework treats the front desk as part of the practice's growth system, not simply an administrative checkpoint.",
      },
      {
        kind: "p",
        text: "The goal is not to rush the caller into a booking. It is to understand the reason for the call, show that the practice is prepared to help, and give the caller a useful next action.",
      },
      { kind: "h2", id: "answer-promptly", text: "1. Answer promptly and sound pleased they called", toc: "Answer promptly" },
      {
        kind: "p",
        text: "Gary recommends answering within three rings and smiling before speaking. The smile matters because tone travels through the phone.",
      },
      { kind: "p", text: "A simple opening is enough:" },
      { kind: "quote", text: "\"Thank you for calling [Practice]. This is [Name]. How may I help you today?\"" },
      {
        kind: "p",
        text: "The words are less important than the experience. The caller should feel welcomed, not processed. Avoid making them repeat information unnecessarily, transferring them without explanation, or putting them on hold before understanding why they called.",
      },
      { kind: "h2", id: "seven-questions", text: "2. Ask seven questions that help the practice respond well", toc: "The seven questions" },
      { kind: "p", text: "Gary's call framework uses seven consistent questions:" },
      {
        kind: "ol",
        items: [
          { text: "How did you hear about us?" },
          { text: "What prompted your call today?" },
          { text: "When was your last dental visit?" },
          { text: "Are you experiencing any pain right now?" },
          { text: "Do you have dental insurance?" },
          { text: "What time of day works best for you?" },
          { text: "Is there anything else we should know so we can prepare?" },
        ],
      },
      {
        kind: "p",
        text: "These questions do more than fill an intake form. They reveal urgency, scheduling needs, the source of the call, and what the team should prepare for before the patient arrives.",
      },
      {
        kind: "p",
        text: "Ask them conversationally. The call should not feel like an interrogation. Listen to the answer before moving to the next question.",
      },
      { kind: "h2", id: "insurance", text: "3. Do not let insurance become a dead end", toc: "Handle insurance questions" },
      {
        kind: "p",
        text: "When a caller asks whether the practice accepts an insurance plan, a flat yes or no can end the conversation before the caller understands the available options.",
      },
      {
        kind: "p",
        text: "The team should answer accurately, explain what it can verify, and bring the conversation back to care. Gary's framework suggests language such as:",
      },
      {
        kind: "quote",
        text: "\"We work with many plans and can verify your benefits before your visit. The most important thing is understanding the care you need. When can we see you?\"",
      },
      {
        kind: "p",
        text: "The exact wording must match the practice's real participation and billing policies. The principle is to avoid an abrupt answer that leaves the caller without a path forward.",
      },
      { kind: "h2", id: "price", text: "4. Give context before discussing price", toc: "Price with context" },
      {
        kind: "p",
        text: "A caller may ask, \"How much is a cleaning?\" or \"What will this treatment cost?\" The question is reasonable, but the practice may not know the correct answer until it understands the patient's needs.",
      },
      {
        kind: "p",
        text: "Instead of guessing or avoiding the question, explain why an examination is needed and promise a clear conversation before treatment begins:",
      },
      {
        kind: "quote",
        text: "\"Every patient's needs are a little different. The doctor will assess what you need, and we will discuss the recommendations and costs before proceeding. Let me help you find an appointment.\"",
      },
      {
        kind: "p",
        text: "This respects the caller's concern while avoiding a price quote without clinical context.",
      },
      { kind: "h2", id: "two-choices", text: "5. Close with two real appointment choices", toc: "The two-option close" },
      {
        kind: "p",
        text: "Calls often fade at the finish because the team asks an open question such as, \"When would you like to come in?\" The caller then has to search an entire calendar in their head.",
      },
      { kind: "p", text: "Gary recommends offering two specific choices:" },
      { kind: "quote", text: "\"We have Tuesday at 10:00 or Thursday at 2:30. Which works better for you?\"" },
      {
        kind: "p",
        text: "Two options make the decision smaller. If neither works, the team can offer the next pair. The point is to guide the caller toward a practical choice rather than leave the next step vague.",
      },
      { kind: "h2", id: "confirm", text: "6. Confirm the appointment before the call ends", toc: "Confirm before hanging up" },
      {
        kind: "p",
        text: "Repeat the date, time, provider, location, and anything the patient should bring. Send the confirmation message immediately and make sure the patient knows how to contact the practice if something changes.",
      },
      {
        kind: "p",
        text: "The first impression continues after the phone call. A clear confirmation shows the same care and organization the patient should expect when they arrive.",
      },
      { kind: "h2", id: "coach-the-system", text: "7. Coach the system, not just the person", toc: "Coach the system" },
      { kind: "p", text: "A script sitting in a binder will not change performance. The team needs a short weekly review:" },
      {
        kind: "ul",
        items: [
          "How many new-patient calls came in?",
          "How many were answered and how many were missed?",
          "How many ended in a booked appointment?",
          "Where did callers hesitate or leave the process?",
          "What one part of the call should the team practise this week?",
        ],
      },
      {
        kind: "p",
        text: "Gary's member kit uses a 70% or better call-to-appointment benchmark. Treat that as his coaching target, not a universal guarantee. The useful habit is to measure the practice against its own starting point and improve the conversation consistently.",
      },
      {
        kind: "quote",
        text: "\"The front desk is not an administrative function. It's a revenue-generating function.\"",
        cite: "Gary Takacs",
      },
    ],
    faqs: [
      {
        q: "What should a dental receptionist say to a new patient?",
        a: "Use a warm greeting with the practice and team member's name, ask why the person is calling, listen carefully, gather the information needed to prepare, and offer two specific appointment times.",
      },
      {
        q: "How should a dental office answer insurance questions?",
        a: "Answer accurately based on the practice's real insurance participation. Explain what the team can verify, avoid making promises before checking benefits, and give the caller a clear path to an appointment.",
      },
      {
        q: "How can a dental practice measure phone conversion?",
        a: "Divide the number of new-patient calls that produced booked appointments by the total number of qualified new-patient calls reviewed. Define the calculation once and use the same definition every week.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "A stronger new-patient call is not a longer sales pitch.",
      body: "It is a warmer and more consistent path from \"How can we help?\" to a confirmed appointment. Answer promptly, ask the right questions, respond to insurance and price concerns honestly, and offer two real times.",
    },
    kitCta: {
      kitName: "The New Patient Phone Call: From Ring to Booking",
      description:
        "The member kit includes Gary's Action Guide, seven-question call flow, scripts, checklist, worksheet, wall poster, and team training resources.",
      href: "/garytakacs",
      label: "Start Your Three Months Free",
      support:
        "Gary's invitation includes three months free. Use code **GARY** when registering through his expert link.",
    },
  },
  {
    slug: "improve-dental-team-communication",
    title: "How to Improve Communication in Your Dental Practice",
    metaTitle: "How to Improve Dental Team Communication | DMN",
    metaDescription:
      "Use clear expectations, daily support questions, stronger handoffs, and consistent patient explanations to improve communication in your dental practice.",
    excerpt:
      "A few repeatable communication habits can prevent daily friction, improve handoffs, and help dental teams raise problems before they become blowups.",
    category: "Team & Culture",
    dek: "Communication problems rarely begin with one dramatic blowup. Monica Watson's practical framework helps dental teams prevent daily friction with clear expectations, better handoffs, useful questions, and a culture where people can speak honestly.",
    expert: {
      name: "Monica Watson",
      role: "Founder, Blossom Dental Consulting",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/monica-watson-headshot.jpg",
      profileHref: "/experts/848576aa-148a-424e-ab07-548a070953f0",
    },
    kitSlug: "you-cant-over-communicate",
    hero: {
      src: "/blog/monica-kit-hero.jpg",
      alt: "You Can't Over-Communicate resource kit featuring Monica Watson",
    },
    readTime: "8 minute read",
    datePublished: "2026-08-31",
    dateModified: "2026-08-31",
    quickAnswer:
      "To improve communication in a dental practice, stop relying on people to read one another's minds. Set clear expectations, agree on repeatable handoffs, ask the team what support they need, and make it safe to raise a problem early. Review those habits every day instead of waiting for a conflict, a patient complaint, or a difficult team meeting.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "Monica Watson puts the principle plainly: \"You can't over communicate. You can only under communicate.\"",
      },
      {
        kind: "p",
        text: "That does not mean adding more messages, meetings, or software. It means making the important information clear, timely, consistent, and useful to the person who needs it.",
      },
      { kind: "h2", id: "why-it-breaks", text: "Why dental-team communication breaks down", toc: "Why it breaks down" },
      {
        kind: "p",
        text: "A dental practice moves quickly. The front desk is answering calls, checking benefits, managing the schedule, and helping patients. The clinical team is moving between operatories, preparing treatment, documenting care, and responding to the doctor. Each person may be doing their own job well while the practice still creates gaps between roles.",
      },
      { kind: "p", text: "Those gaps show up in familiar ways:" },
      {
        kind: "ul",
        items: [
          "An emergency patient is added without the clinical team receiving the right details.",
          "The doctor is running behind, but nobody explains the delay to the next patient.",
          "A team member is held accountable for an expectation that was never clearly stated.",
          "The front and clinical teams explain the same procedure differently.",
          "A small concern stays quiet until it becomes a personal conflict.",
        ],
      },
      {
        kind: "p",
        text: "The fix is not simply telling everyone to communicate better. The practice needs a few defined communication systems that remove ambiguity.",
      },
      { kind: "h2", id: "morning-plan", text: "1. Replace firefighting with a morning plan", toc: "The morning plan" },
      {
        kind: "p",
        text: "Monica encourages practices to plan for predictable pressure before the day becomes stressful. During the morning huddle, identify likely trouble points:",
      },
      {
        kind: "ul",
        items: [
          "Where will an emergency patient fit?",
          "Which appointments may require extra time or support?",
          "Where is the schedule especially tight?",
          "Who will update a waiting patient if the doctor falls behind?",
          "What information needs to move from the front desk to the clinical team?",
        ],
      },
      {
        kind: "p",
        text: "This is not a long meeting. A focused huddle gives the team a shared picture of the day and reduces the number of decisions made in a rush.",
      },
      { kind: "h2", id: "expectations", text: "2. Make expectations visible", toc: "Visible expectations" },
      { kind: "p", text: "Monica says, \"Clarity is kindness.\"" },
      {
        kind: "p",
        text: "Team members need to know what good performance looks like, who owns each task, and when a handoff is complete. If the expectation exists only in the practice owner's head, accountability will feel unpredictable and unfair.",
      },
      { kind: "p", text: "Choose one recurring point of friction and write down:" },
      {
        kind: "ol",
        items: [
          { text: "What needs to happen." },
          { text: "Who is responsible." },
          { text: "What information must be recorded or handed off." },
          { text: "When the task is considered complete." },
          { text: "What happens if the normal process cannot be followed." },
        ],
      },
      {
        kind: "p",
        text: "Start small. A clear one-page process for emergency calls or late-running appointments is more useful than a large manual nobody uses.",
      },
      { kind: "h2", id: "handoff", text: "3. Use a complete front-to-back handoff", toc: "Complete handoffs" },
      {
        kind: "p",
        text: "When an emergency patient calls, the front desk should not have to invent the questions. Monica recommends an intake form with a consistent script.",
      },
      { kind: "p", text: "The form might include:" },
      {
        kind: "ul",
        items: [
          "What prompted the call?",
          "Where is the discomfort?",
          "When did it begin?",
          "Has anything made it better or worse?",
          "Is there swelling, trauma, or another urgent concern?",
          "What has the patient already been told about the visit?",
        ],
      },
      {
        kind: "p",
        text: "The clinical team then receives the information before the patient is seated. The front desk should also set an honest expectation: the practice will address the immediate concern, but definitive treatment may require diagnosis, time, and a separate visit.",
      },
      {
        kind: "p",
        text: "The exact clinical questions and urgency rules must be approved by the dentist. The communication principle is universal: the person receiving the handoff should not need to start from zero.",
      },
      { kind: "h2", id: "support-question", text: "4. Ask a daily support question", toc: "The daily support question" },
      { kind: "p", text: "Monica recommends that team members ask one another:" },
      { kind: "quote", text: "\"How can I support you today?\"" },
      {
        kind: "p",
        text: "This question works because it turns a vague idea of teamwork into a specific offer. A dental assistant may need the front desk to protect a handoff window. The scheduling coordinator may need the doctor to make a decision before lunch. A new employee may need clarification without feeling that they are slowing everyone down.",
      },
      {
        kind: "p",
        text: "The answer is not always a request for more help. It may reveal a missing resource, an unclear responsibility, or a conflict that can be addressed while it is still small.",
      },
      { kind: "h2", id: "honest-answers", text: "5. Make it safe to give an honest answer", toc: "Safe honesty" },
      {
        kind: "p",
        text: "Asking for feedback is not enough. Leaders also have to show that an honest response will be handled constructively.",
      },
      {
        kind: "p",
        text: "Monica warns that when a team stops talking to its leader, the culture is already in trouble. If questions are dismissed, concerns are punished, or every suggestion becomes a debate, people learn to remain quiet.",
      },
      { kind: "p", text: "Leaders can change that pattern by responding with three steps:" },
      {
        kind: "ol",
        items: [
          { text: "Thank the person for raising the issue." },
          { text: "Ask for a specific example and the impact it created." },
          { text: "Agree on the next action, owner, and follow-up date." },
        ],
      },
      {
        kind: "p",
        text: "Not every suggestion must be accepted. Every sincere concern should receive a clear response.",
      },
      { kind: "h2", id: "consistent-explanation", text: "6. Give patients one consistent explanation", toc: "One patient explanation" },
      {
        kind: "p",
        text: "Communication gaps affect patients too. Monica recommends creating a benefit statement for every common procedure so the patient receives the same basic answer from the front desk, assistant, hygienist, and doctor.",
      },
      { kind: "p", text: "The statement should explain, in plain language:" },
      {
        kind: "ul",
        items: [
          "What problem the procedure addresses.",
          "Why the dentist may recommend it.",
          "What the patient should ask the clinical team before deciding.",
        ],
      },
      {
        kind: "p",
        text: "The doctor still provides the diagnosis, risks, alternatives, and informed-consent discussion. The shared statement simply prevents different team members from giving conflicting or confusing explanations.",
      },
      { kind: "h2", id: "comfort-question", text: "7. End new-patient calls with the comfort question", toc: "The comfort question" },
      { kind: "p", text: "Monica teaches teams to ask:" },
      { kind: "quote", text: "\"Is there anything you'd like us to know to make your visit more comfortable at our office?\"" },
      {
        kind: "p",
        text: "The answer may reveal anxiety, mobility needs, a previous negative experience, a preference for detailed explanations, or another useful detail. Record it and share it with the clinical team.",
      },
      {
        kind: "p",
        text: "That single question tells the patient that the practice is listening before the appointment begins.",
      },
      { kind: "h2", id: "weekly-review", text: "A simple weekly communication review", toc: "The weekly review" },
      { kind: "p", text: "Once a week, ask the team:" },
      {
        kind: "ul",
        items: [
          "Where did information get lost?",
          "Which handoff worked especially well?",
          "What expectation remained unclear?",
          "Did a patient receive two different answers?",
          "What one process should we clarify this week?",
        ],
      },
      {
        kind: "p",
        text: "Choose one improvement and test it. The goal is not a perfect week. It is a practice that notices communication gaps and repairs them before they become culture problems.",
      },
    ],
    faqs: [
      {
        q: "How can a dentist improve communication with the team?",
        a: "Set explicit expectations, define task ownership, use short daily huddles, ask what support people need, and follow up visibly when someone raises a concern.",
      },
      {
        q: "What should a dental morning huddle include?",
        a: "Focus on the day's pressure points, schedule risks, emergency capacity, important patient needs, handoffs, and decisions that require a named owner.",
      },
      {
        q: "How can a dental practice reduce staff conflict?",
        a: "Address concerns early, discuss the process and impact rather than attacking the person, clarify the expected behavior, and agree on a next step that can be observed.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "Better communication is not more talking. It is fewer assumptions.",
      body: "Plan for predictable problems, make expectations visible, use complete handoffs, ask useful questions, and protect the honesty you asked the team to give you.",
    },
    kitCta: {
      kitName: "You Can't Over-Communicate",
      description:
        "The member kit includes Monica's Action Guide, checklist, worksheet, wall poster, scripts, and team implementation resources.",
      // Monica's expert referral link (confirmed by Lester via Rushdha,
      // 2026-08-31). Her promo code is inactive, so signups via this link
      // see standard pricing — matching the article's no-promotion rule.
      href: "/monicawatson",
      label: "Join Dental Member Network",
    },
  },
  {
    slug: "prevent-dental-insurance-claim-denials",
    title: "How to Prevent Dental Insurance Claim Denials Before They Happen",
    metaTitle: "How to Prevent Dental Claim Denials | DMN",
    metaDescription:
      "Prevent avoidable dental claim denials with a documented process for eligibility, data, clinical notes, attachments, claim review, and follow-up.",
    excerpt:
      "A denied dental claim often begins upstream. A documented workflow helps the team catch eligibility, data, note, and attachment problems before submission.",
    category: "Billing & Collections",
    dek: "A denied claim often begins before the claim is submitted. DeVon Banks's process-first framework helps dental practices find weak points in benefit verification, data entry, documentation, attachments, patient collections, and follow-up.",
    expert: {
      name: "DeVon Banks",
      role: "CEO, D-TECH Billing and Claims",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/b33f7c0b-c844-4d5f-8928-8fd3cec49421-1787635915283.jpg",
      profileHref: "/experts/b33f7c0b-c844-4d5f-8928-8fd3cec49421",
    },
    kitSlug: "the-process-comes-first",
    hero: {
      src: "/blog/devon-kit-hero.jpg",
      alt: "The Process Comes First resource kit featuring DeVon Banks",
    },
    readTime: "8 minute read",
    datePublished: "2026-08-31",
    dateModified: "2026-08-31",
    quickAnswer:
      "To prevent avoidable dental insurance claim denials, build one documented billing process that begins with eligibility verification and continues through accurate patient data, complete clinical notes, required attachments, claim review, submission, and follow-up. Train the team on that process before adding new software or automation. Track rejection and appeal reasons so the practice can correct the step that caused the problem.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "DeVon Banks summarizes the principle clearly: \"Technology is our tools. They're not the process.\"",
      },
      {
        kind: "p",
        text: "The grammar is conversational, but the lesson is precise. A dashboard can reveal a denial. It cannot repair a workflow the practice has never defined.",
      },
      { kind: "h2", id: "upstream", text: "Why denials begin earlier than most teams think", toc: "Denials start upstream" },
      {
        kind: "p",
        text: "When a claim is rejected or denied, the billing team often focuses on the final submission. DeVon asks practices to look further upstream.",
      },
      {
        kind: "p",
        text: "The problem may have started when benefits were not verified, patient details were entered incorrectly, the procedure note did not support the service, an attachment was missing, or nobody owned the follow-up. By the time the payer responds, the original error may be days or weeks old.",
      },
      {
        kind: "p",
        text: "That is why the process needs to cover the full path from appointment preparation to payment.",
      },
      { kind: "h2", id: "write-the-workflow", text: "1. Write the workflow before buying another tool", toc: "Write the workflow" },
      { kind: "p", text: "Start with a simple map of the current process:" },
      {
        kind: "ol",
        items: [
          { text: "Verify eligibility and benefits." },
          { text: "Enter or update patient and plan information." },
          { text: "Confirm the planned procedure and coding information." },
          { text: "Complete the clinical documentation." },
          { text: "Gather required images, narratives, or other attachments." },
          { text: "Review the claim before submission." },
          { text: "Submit through the approved system." },
          { text: "Track the payer response." },
          { text: "Correct, appeal, collect, or escalate according to the result." },
        ],
      },
      {
        kind: "p",
        text: "For each step, name the owner, the deadline, the required information, and the evidence that the task is complete.",
      },
      {
        kind: "p",
        text: "DeVon makes the training problem obvious: \"It's kind of difficult to promote training when there's not a system to train on.\"",
      },
      { kind: "h2", id: "eligibility", text: "2. Begin with eligibility verification", toc: "Start with eligibility" },
      {
        kind: "p",
        text: "The billing process does not begin after treatment. It begins before the patient is in the chair.",
      },
      {
        kind: "p",
        text: "Confirm the patient's current plan details and document what the practice learned. Eligibility and benefit information can change, and verification is not a guarantee of payment. It is still a necessary control because it helps the team identify plan limitations, missing data, and patient responsibility before treatment.",
      },
      {
        kind: "p",
        text: "The American Dental Association advises practices to document details such as the carrier, group number, and member identification information during eligibility verification. The practice should also follow the payer's current rules and the terms of its participating-provider agreements.",
      },
      { kind: "h2", id: "clinical-note", text: "3. Make the clinical note support the claim", toc: "Notes that support claims" },
      { kind: "p", text: "Billing cannot repair documentation that never explains what happened clinically." },
      {
        kind: "p",
        text: "The note should accurately describe the patient's condition, the diagnosis, the service delivered, and any relevant clinical findings. Required radiographs, periodontal records, narratives, or other attachments should match the procedure and payer requirements.",
      },
      {
        kind: "p",
        text: "This does not mean writing notes for an insurance company instead of the patient record. It means making the record complete enough to show why the care was necessary and what was performed.",
      },
      {
        kind: "p",
        text: "The dentist remains responsible for clinical documentation. The billing team can use a checklist to identify missing elements before a claim leaves the practice.",
      },
      { kind: "h2", id: "pre-submission", text: "4. Review the claim before submission", toc: "Pre-submission review" },
      { kind: "p", text: "A short pre-submission review can catch avoidable errors:" },
      {
        kind: "ul",
        items: [
          "Does the patient's name and identification match the plan record?",
          "Is the correct payer and group information attached?",
          "Are procedure details complete and consistent?",
          "Does the clinical note substantiate the service?",
          "Are all required images, narratives, or other documents included?",
          "Has the team recorded any relevant coordination-of-benefits information?",
          "Is the claim being submitted through the correct channel?",
        ],
      },
      {
        kind: "p",
        text: "The checklist should reflect the practice's services and the payer's current rules. It should not depend on one experienced employee remembering every exception.",
      },
      { kind: "h2", id: "track-reasons", text: "5. Track the reason, not just the unpaid balance", toc: "Track denial reasons" },
      {
        kind: "p",
        text: "An accounts-receivable report tells the practice what remains unpaid. It does not always explain why.",
      },
      { kind: "p", text: "Create a simple denial and appeal log with fields such as:" },
      {
        kind: "ul",
        items: [
          "Date submitted",
          "Payer",
          "Procedure or claim category",
          "Rejection or denial reason",
          "Missing information",
          "Action taken",
          "Owner",
          "Follow-up date",
          "Final outcome",
        ],
      },
      {
        kind: "p",
        text: "DeVon used a plain spreadsheet to review a few hundred appeals over about six months, identify patterns, and change processes. The exact volume is not the point. The habit is: collect enough consistent information to see where the workflow is breaking.",
      },
      {
        kind: "p",
        text: "Review the log monthly. If one denial reason keeps returning, fix the upstream step instead of repeatedly correcting the same result.",
      },
      { kind: "h2", id: "patient-collections", text: "6. Include patient collections in the same process", toc: "Patient collections" },
      {
        kind: "p",
        text: "Getting paid includes both the insurance portion and the patient portion. DeVon warns that practices may focus heavily on the payer while leaving patient balances unresolved.",
      },
      {
        kind: "p",
        text: "Before treatment, the team should explain what is known, what remains an estimate, when payment is expected, and which payment methods or financing choices the practice genuinely offers. After the payer responds, communicate any remaining balance clearly and promptly.",
      },
      {
        kind: "p",
        text: "DeVon's standard is direct: \"There should not be a patient in the chair that you're not aware of how you're going to get paid, both from insurance and from patient.\"",
      },
      {
        kind: "p",
        text: "This is not a promise that every estimate will be exact. It is a requirement that the practice has checked the information available and has a defined financial conversation.",
      },
      { kind: "h2", id: "train-then-automate", text: "7. Train for consistency, then automate", toc: "Train, then automate" },
      {
        kind: "p",
        text: "Once the workflow is documented, train every person who owns a step. Use real examples, a skills check, and a short audit period. When the process works consistently, decide which technology can remove repetitive work or improve visibility.",
      },
      { kind: "p", text: "Evaluate a tool against a specific problem:" },
      {
        kind: "ul",
        items: [
          "Which step will it improve?",
          "What input data does it require?",
          "Who monitors exceptions?",
          "How will the practice know it worked?",
          "What happens when the automation fails?",
        ],
      },
      { kind: "p", text: "DeVon's warning is useful here: \"You can't just spend away a problem.\"" },
      { kind: "h2", id: "monthly-review", text: "A 15-minute monthly claims review", toc: "The monthly review" },
      { kind: "p", text: "Bring the practice owner, clinical lead, and billing owner together and answer:" },
      {
        kind: "ul",
        items: [
          "What were the most common denial or rejection reasons?",
          "Which step caused each recurring problem?",
          "Are clinical notes or attachments regularly incomplete?",
          "Are eligibility details being recorded consistently?",
          "Which patient balances have no next action?",
          "What one process change will we test this month?",
        ],
      },
      {
        kind: "p",
        text: "Assign an owner and a review date. A meeting without a process change is only a report.",
      },
    ],
    faqs: [
      {
        q: "What causes dental insurance claims to be denied?",
        a: "Common causes include eligibility problems, inaccurate patient or plan data, incomplete clinical documentation, missing attachments, coding or submission errors, plan limitations, and missed follow-up requirements.",
      },
      {
        q: "Does verifying benefits guarantee payment?",
        a: "No. Verification helps the practice understand available information, but it is not a guarantee of payment. Benefits, eligibility, payer policies, and contract terms can affect the final decision.",
      },
      {
        q: "Should a dental practice buy claims software first?",
        a: "Document the process first. Then choose technology that improves a defined step, uses reliable data, and has a named person responsible for exceptions and follow-up.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "The best time to prevent a denial is before the claim leaves the practice.",
      body: "Verify benefits, keep patient data accurate, document the care completely, attach what the payer requires, review before submission, and track recurring reasons. Build the process first. Use technology to strengthen it.",
    },
    kitCta: {
      kitName: "The Process Comes First",
      description:
        "The member kit includes DeVon's Action Guide, claims-process checklist, workflow worksheet, wall poster, and billing implementation resources.",
      // DeVon's expert referral link (confirmed by Lester via Rushdha,
      // 2026-08-31).
      href: "/devonbanks",
      label: "Join Dental Member Network",
    },
  },
];

/** Only the articles cleared for release — what the public surfaces use. */
export const PUBLISHED_BLOG_ARTICLES = BLOG_ARTICLES.filter((a) => a.published !== false);

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}
