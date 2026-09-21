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
  // ── Week 4 · article 3 (approved 2026-09-17; release 2026-09-18) ─────
  {
    slug: "train-new-dental-team-member",
    title: "How to Train a New Dental Team Member, Even When They Have Experience",
    metaTitle: "How to Train a New Dental Team Member",
    metaDescription:
      "Use Debra Engelhardt-Nash's tell, show and practise approach to train new dental staff, clarify expectations, and check skills before independent work.",
    excerpt:
      "Use Debra Engelhardt-Nash's tell, show and practise approach to train new dental staff, clarify expectations, and check skills before independent work.",
    category: "Team & Culture",
    dek: "A strong resume does not tell a new employee how your practice works.",
    expert: {
      name: "Debra Engelhardt-Nash",
      role: "Consultant and trainer, co-founder of The Nash Institute",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/73e4faed-1de8-4f4c-b3dc-e73ce97dedfb-1787632945703.jfif",
      profileHref: "/experts/73e4faed-1de8-4f4c-b3dc-e73ce97dedfb",
    },
    kitSlug: "nobody-walks-in-ready",
    hero: {
      src: "/blog/debra-kit-hero.jpg",
      alt: "The Nobody Walks In Ready resource kit featuring Debra Engelhardt-Nash",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-18",
    dateModified: "2026-09-18",
    quickAnswer:
      "To train a new dental team member, explain the task and expected standard, demonstrate how your practice does it, and give the person a safe opportunity to practise. Check their understanding through an observed example, provide feedback, and agree on the next step before assuming they can work independently.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Expert guidance from Debra Engelhardt-Nash, consultant, trainer and co-founder of The Nash Institute, adapted from Nobody Walks In Ready.*",
      },
      {
        kind: "p",
        text: "Debra Engelhardt-Nash's central point is that experience does not replace training. Someone can bring valuable skills from another practice and still need to learn your workflow, handoffs and expectations.",
      },
      { kind: "h2", id: "what-is-different", text: "Start with what is different in your practice", toc: "What is different here" },
      {
        kind: "p",
        text: "A new employee may know the software but not your process for recording a callback. They may have handled patient questions for years but not know when your practice expects a question to go to the dentist.",
      },
      { kind: "p", text: "That does not automatically make them a weak hire. It identifies the work your onboarding needs to do." },
      {
        kind: "p",
        text: "Debra recommends a written training protocol rather than expecting someone to arrive ready for every part of the role. Start with a specific task, the person teaching it, and what satisfactory performance looks like.",
      },
      {
        kind: "p",
        text: "If you are still choosing whom to hire, **[hiring dental staff when you are short-staffed](/blog/hire-dental-staff-under-pressure)** addresses the earlier decision. This article starts after that decision, when the practice needs to help the new person succeed.",
      },
      { kind: "h2", id: "tell-show-practise", text: "Tell them, show them, then let them practise", toc: "Tell, show, practise" },
      { kind: "p", text: "Debra's practical sequence has three parts." },
      { kind: "p", text: "**Tell:** Explain what the person needs to learn and why it matters." },
      {
        kind: "p",
        text: "**Show:** Demonstrate the task or conversation, including the details that an experienced team member may otherwise leave unspoken.",
      },
      {
        kind: "p",
        text: "**Practise:** Let the learner try it in a supported setting before the same situation arrives during a busy patient day.",
      },
      { kind: "p", text: "Watching a video or hearing an explanation can be part of training. It is not the same as demonstrating the skill." },
      { kind: "p", text: "Debra puts the distinction plainly:" },
      { kind: "quote", text: "“If you never practice, never assume that they get it.”", cite: "Debra Engelhardt-Nash" },
      { kind: "h2", id: "rehearse-conversation", text: "Rehearse one patient conversation", toc: "Rehearse one conversation" },
      {
        kind: "p",
        text: "Debra uses patient questions about cost and insurance as examples of conversations worth rehearsing. The aim is to help team members respond thoughtfully, not teach them to make promises they cannot support.",
      },
      { kind: "p", text: "Here is an illustrative exercise applying her method, not a transcript from her kit." },
      { kind: "p", text: "**Situation:** A patient asks why an estimate differs from what they expected." },
      {
        kind: "p",
        text: "**Explain the standard:** Listen, identify what the patient wants clarified, and involve the appropriate team member rather than guessing about benefits or clinical recommendations.",
      },
      {
        kind: "p",
        text: "**Demonstrate:** An experienced colleague shows how to acknowledge the concern, locate the information available and explain the next step.",
      },
      {
        kind: "p",
        text: "**Practise:** The new team member responds while a colleague plays the patient. Swap roles so the learner can hear how the explanation feels from the other side.",
      },
      {
        kind: "p",
        text: "**Review:** Was the response clear? Did the learner avoid unsupported promises? Did they know when and how to ask for help?",
      },
      {
        kind: "p",
        text: "Use fictional examples for rehearsal and the practice's approved procedures for real situations. Clinical advice and payer-specific decisions require the appropriate professional input.",
      },
      { kind: "h2", id: "make-progress-visible", text: "Make progress visible without turning training into a test of confidence", toc: "Make progress visible" },
      { kind: "p", text: "A confident answer is not always an accurate one. A hesitant learner may understand the task but need more practice." },
      { kind: "p", text: "As an editorial tool for applying Debra's framework, use a short task record:" },
      {
        kind: "ul",
        items: [
          "Task being learned.",
          "Person providing the demonstration.",
          "Expected standard.",
          "Practice opportunity completed.",
          "What the learner can do and where support is still needed.",
          "Next review.",
        ],
      },
      {
        kind: "p",
        text: "This is a suggested training record, not a fixed timetable or certification. Different roles and tasks require different levels of supervision. Do not use one successful rehearsal to authorize work beyond the person's responsibilities or qualifications.",
      },
      { kind: "h2", id: "training-time", text: "Put training time in the diary", toc: "Put training in the diary" },
      {
        kind: "p",
        text: "Debra emphasizes scheduling training and holding one-to-one conversations about expectations and growth. If training is always postponed until the practice is quiet, it may never receive focused attention.",
      },
      { kind: "p", text: "Protect time for practice, questions and feedback. Ask which part remains unclear and what support the person needs next." },
      {
        kind: "p",
        text: "The leader has a part in this too. If different experienced team members demonstrate conflicting methods, agree on the practice's standard before asking the new employee to follow it consistently.",
      },
      {
        kind: "p",
        text: "For the wider team habits that make expectations clearer, see **[how to improve communication in your dental practice](/blog/improve-dental-team-communication)**.",
      },
      { kind: "h2", id: "first-question", text: "The first question to ask this week", toc: "The first question this week" },
      {
        kind: "p",
        text: "Choose one task a new team member is expected to perform. Has somebody explained it, demonstrated it and watched them practise it?",
      },
      {
        kind: "p",
        text: "If not, that is a concrete place to begin. Training becomes more useful when the next step is visible to both the learner and the person supporting them.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "Experience does not replace training.",
      body: "Explain the task and the standard, demonstrate it the way your practice does it, and let the new person practise before it happens with a real patient. Record what they can do and what still needs support, and protect the time to do it.",
    },
    kitCta: {
      kitName: "Nobody Walks In Ready",
      description:
        "Available inside Dental Member Network, including The Training Protocol Worksheet.",
      support:
        "Get the complete **Nobody Walks In Ready** resource kit inside Dental Member Network, including **The Training Protocol Worksheet**.",
      href: "/join/member",
      label: "Join Dental Member Network",
    },
  },
  // ── Week 4 · article 2 (approved 2026-09-17; release 2026-09-17) ─────
  {
    slug: "dental-morning-huddle-agenda",
    title: "Dental Morning Huddle Agenda: What to Cover Before the First Patient",
    metaTitle: "Dental Morning Huddle Agenda: What to Cover",
    metaDescription:
      "Build a useful dental morning huddle with Callie Ward's approach: celebrate good work, learn from yesterday, anticipate today's needs, and prepare tomorrow.",
    excerpt:
      "Build a useful dental morning huddle with Callie Ward's approach: celebrate good work, learn from yesterday, anticipate today's needs, and prepare tomorrow.",
    category: "Team & Culture",
    dek: "Use the meeting to make decisions the schedule cannot make for you.",
    expert: {
      name: "Callie Ward",
      role: "Founder and CEO, Dash Dental Consulting",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/callie-ward-headshot.jpg",
      profileHref: "/experts/34a927c7-16a3-4fd2-80c5-3dcefd258aef",
    },
    kitSlug: "successful-morning-huddle",
    hero: {
      src: "/blog/callie-kit-hero.jpg",
      alt: "The Successful Morning Huddle resource kit featuring Callie Ward",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-17",
    dateModified: "2026-09-17",
    quickAnswer:
      "A dental morning huddle should recognize good work, identify one lesson from yesterday, flag today's patient and scheduling needs, and assign any preparation needed for tomorrow. It should finish with clear actions and owners, not simply a readout of appointment times.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Expert guidance from Callie Ward, Founder and CEO of Dash Dental Consulting, adapted from Successful Morning Huddle.*",
      },
      {
        kind: "p",
        text: "Callie Ward describes the huddle as the day's positive kickstart and its air traffic control. Her framework combines the tone of the meeting with the practical decisions that help the team prepare.",
      },
      { kind: "h2", id: "celebration", text: "1. Open with a specific celebration", toc: "1. Open with a celebration" },
      {
        kind: "p",
        text: "Start by acknowledging something a team member did well. Callie suggests rotating the huddle leader, with one person leading for a week before handing over.",
      },
      {
        kind: "p",
        text: "Make the acknowledgement concrete. “Thank you for explaining the delay to that patient yesterday” gives the team a clearer example than “Great job, everyone.”",
      },
      {
        kind: "p",
        text: "This is not a request to pretend yesterday was perfect. It is a way to recognize the work that can disappear into a busy day before discussing what needs attention.",
      },
      { kind: "h2", id: "learn-from-yesterday", text: "2. Learn from yesterday without blaming a person", toc: "2. Learn from yesterday" },
      { kind: "p", text: "Ask where the day became harder than it needed to be." },
      {
        kind: "p",
        text: "Did a missing handoff cause confusion? Was there a delay nobody communicated? Did a patient leave with a question that still needs an answer?",
      },
      {
        kind: "p",
        text: "Callie's approach is to examine the situation in a non-threatening way. Keep the group conversation on the process and the next action. Do not turn the huddle into a public performance review.",
      },
      {
        kind: "p",
        text: "For example, “What information was missing when the appointment changed?” invites a different discussion from “Who messed up the schedule?”",
      },
      {
        kind: "p",
        text: "If the issue needs an individual conversation, **[giving difficult feedback without making it personal](/blog/difficult-feedback-dental-team)** offers a separate framework for that discussion.",
      },
      { kind: "h2", id: "useful-outcomes", text: "3. Review a few useful outcomes", toc: "3. Review useful outcomes" },
      {
        kind: "p",
        text: "Callie's guide includes reviewing production and collections against the measures the practice is already using, checking whether hygiene patients were rescheduled, and identifying follow-up needs.",
      },
      { kind: "p", text: "The purpose is to decide what needs attention, not to recite every number available in the software." },
      {
        kind: "p",
        text: "For each item, ask: does this change what somebody needs to do today? If a patient needs a scheduling conversation, name who will follow up. If a recurring issue needs more investigation, assign that work outside the huddle rather than trying to solve everything at once.",
      },
      { kind: "h2", id: "underneath-today", text: "4. Look underneath today's appointments", toc: "4. Look underneath today" },
      { kind: "p", text: "Everyone can read the appointment list. The meeting is useful when it reveals what the list does not explain." },
      { kind: "p", text: "Discuss the preparations and handoffs that matter today:" },
      {
        kind: "ul",
        items: [
          "Which appointments need extra coordination?",
          "Where could an urgent appointment fit, subject to the clinician's direction?",
          "Is any required information, material or laboratory work missing?",
          "Which patients have an unresolved question or agreed follow-up?",
          "Who will communicate a delay if the schedule changes?",
        ],
      },
      {
        kind: "p",
        text: "Callie also recommends reviewing existing unscheduled treatment with the clinician's priorities in mind. A patient conversation should explore what has prevented scheduling, not use the huddle's production goals to pressure the patient.",
      },
      {
        kind: "p",
        text: "Clinical decisions stay with the clinician. The huddle organizes the team's response; it does not create blanket treatment or imaging rules.",
      },
      { kind: "h2", id: "prepare-tomorrow", text: "5. Prepare tomorrow before it arrives", toc: "5. Prepare tomorrow" },
      {
        kind: "p",
        text: "Look beyond the current day's urgency. Callie's framework includes checking upcoming openings, laboratory cases and supplies so that tomorrow's missing item does not become tomorrow's disruption.",
      },
      {
        kind: "p",
        text: "End each issue with an owner and a next step. “Check the lab case” is less useful than knowing who will check it and when the result needs to reach the team.",
      },
      {
        kind: "p",
        text: "The time you save is not something to assume or promise. Watch whether fewer unresolved preparation questions reach the start of the next day.",
      },
      { kind: "h2", id: "simple-agenda", text: "A simple agenda you can use tomorrow", toc: "A simple agenda" },
      { kind: "p", text: "This is an editorial adaptation of Callie's framework, not a separate worksheet from her kit:" },
      {
        kind: "ol",
        items: [
          { strong: "Recognize:", text: "What did someone do well?" },
          { strong: "Learn:", text: "What happened yesterday that needs a process improvement?" },
          { strong: "Act:", text: "Which results require a follow-up today?" },
          { strong: "Prepare:", text: "What needs attention underneath today's schedule?" },
          { strong: "Look ahead:", text: "What must be ready for tomorrow?" },
          { strong: "Confirm:", text: "Who owns each action?" },
        ],
      },
      {
        kind: "p",
        text: "Keep longer problem-solving discussions outside this meeting. A focused huddle can surface an issue without consuming the time needed to resolve it.",
      },
      {
        kind: "p",
        text: "For habits beyond the daily meeting, read **[how to improve communication in your dental practice](/blog/improve-dental-team-communication)**.",
      },
      { kind: "h2", id: "routine", text: "Turn the agenda into a routine", toc: "Turn it into a routine" },
      {
        kind: "p",
        text: "Try the agenda with your team, then ask what helped them prepare and what was merely repeated information. Keep the parts that lead to clearer decisions.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "A huddle is for decisions, not a readout.",
      body: "Recognize one thing done well, learn one lesson from yesterday, decide which results need action today, look underneath the appointment list, and get tomorrow ready. End every item with an owner and a next step.",
    },
    kitCta: {
      kitName: "Successful Morning Huddle",
      description:
        "Available inside Dental Member Network, including the morning huddle worksheet.",
      support:
        "Get the complete **Successful Morning Huddle** resource kit inside Dental Member Network, including the morning huddle worksheet.",
      href: "/join/member",
      label: "Join Dental Member Network",
    },
  },
  // ── Week 4 · article 1 (approved 2026-09-17; release 2026-09-16) ─────
  {
    slug: "dental-practice-sops",
    title: "How to Write Dental Practice SOPs Your Team Will Actually Use",
    metaTitle: "Dental Practice SOPs: A Simple Way to Get Started",
    metaDescription:
      "Create a practical dental office SOP with Gary Takacs's framework: define the purpose, assign an owner, document the steps, and review one useful measure.",
    excerpt:
      "Create a practical dental office SOP with Gary Takacs's framework: define the purpose, assign an owner, document the steps, and review one useful measure.",
    category: "Practice Management",
    dek: "Start with one recurring problem, one accountable owner and a process the team can follow.",
    expert: {
      name: "Gary Takacs",
      role: "Founder, Thriving Dentist",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/gary-takacs-headshot.jpg",
      profileHref: "/experts/ecf8bd07-66e7-48f9-b002-b1b33adb2548",
    },
    kitSlug: "24-business-systems",
    hero: {
      src: "/blog/gary-sops-kit-hero.jpg",
      alt: "The 24 Business Systems Framework resource kit featuring Gary Takacs",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-16",
    dateModified: "2026-09-16",
    quickAnswer:
      "To write a useful dental practice standard operating procedure, or SOP, define the outcome, name the person responsible for keeping the process on track, and describe the steps in plain language. Add one measure that shows whether the process is working. Test it with the people doing the work before treating the document as finished.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Expert guidance from Gary Takacs, adapted from The 24 Business Systems Framework.*",
      },
      {
        kind: "p",
        text: "Gary Takacs's framework recommends a one-page SOP with a purpose, a system champion, a process of no more than ten steps, and a key performance indicator. The point is not to build a large manual before anything improves. It is to make one important activity repeatable.",
      },
      { kind: "h2", id: "same-question", text: "Start where the team keeps asking the same question", toc: "Start with the same question" },
      { kind: "p", text: "Think about a task that regularly gets delayed, handled differently or passed back to the owner." },
      {
        kind: "p",
        text: "Who follows up with an unanswered new-patient inquiry? How does an appointment change reach the next person at the front desk? Who checks that a promised patient callback happened?",
      },
      {
        kind: "p",
        text: "These are useful starting points because the problem is visible. You can explain what the process needs to accomplish and watch whether the change helps.",
      },
      {
        kind: "p",
        text: "Gary's suggested starting areas are the morning huddle, new-patient phone calls, case acceptance, scheduling, review generation and KPI tracking. Choose a manageable process within one area rather than trying to document the whole practice at once.",
      },
      {
        kind: "p",
        text: "For a patient-facing example, **[why new-patient calls fail to become appointments](/blog/new-patient-calls-to-appointments)** examines the conversation your written process needs to support.",
      },
      { kind: "h2", id: "four-parts", text: "Give the SOP four clear parts", toc: "Four clear parts" },
      { kind: "p", text: "Use these four headings:" },
      {
        kind: "ul",
        items: [
          "**Purpose:** What should happen when the process works?",
          "**Champion:** Who checks that the process is being followed?",
          "**Steps:** What does the team do, in what order?",
          "**Measure:** What evidence will tell you whether it is working?",
        ],
      },
      {
        kind: "p",
        text: "Gary distinguishes the champion from the person doing every task. A champion keeps track of the system and reports progress. Other team members can perform its steps.",
      },
      {
        kind: "p",
        text: "That matters when someone is absent or a busy day requires people to help across roles. A process should explain how work continues, not make one person indispensable.",
      },
      { kind: "h2", id: "worked-example", text: "A worked example: closing a patient-callback request", toc: "A worked example" },
      { kind: "p", text: "The following is an editorial example applying Gary's structure, not a script from his kit." },
      { kind: "p", text: "**Purpose:** Every callback request has a named owner and a recorded outcome." },
      { kind: "p", text: "**Champion:** The person assigned to oversee the callback list." },
      { kind: "p", text: "**Steps:**" },
      {
        kind: "ol",
        items: [
          { text: "Record the request in the practice's approved system." },
          { text: "Confirm the appropriate contact details and the reason for the callback." },
          { text: "Assign the request to the right team member." },
          { text: "Route clinical questions through the dentist's approved process." },
          { text: "Record the contact attempt and what happened." },
          { text: "Keep unanswered or unresolved requests visible." },
          { text: "Review outstanding requests before the team closes the day." },
        ],
      },
      {
        kind: "p",
        text: "**Measure:** The number of callback requests still without an owner or recorded next action at the daily review.",
      },
      {
        kind: "p",
        text: "The practice must define its own response expectations and escalation rules. A short SOP is not a substitute for clinical protocols, privacy requirements or professional judgment.",
      },
      {
        kind: "p",
        text: "For the content of an after-treatment call, see **[what to say in a dental follow-up call](/blog/dental-post-treatment-follow-up-call)**. The SOP answers a different question: how will the practice make sure the conversation happens and any remaining question is handled?",
      },
      { kind: "h2", id: "test-first", text: "Test the instructions before adding more", toc: "Test before adding more" },
      {
        kind: "p",
        text: "Give the SOP to a team member and ask them to talk through a realistic example. Where do they need to guess? Where do they need information the document never mentions? Is the named owner actually able to check the work?",
      },
      {
        kind: "p",
        text: "Use those questions to improve the process. If the document requires a lengthy explanation from its author every time, it is not yet doing enough of the work.",
      },
      {
        kind: "p",
        text: "Gary's suggested implementation rhythm is two systems per month: learn a system, then implement it, assign its champion and track the result. Treat that as his starting cadence, not a guarantee that every practice or process fits the same timetable.",
      },
      { kind: "h2", id: "keep-connected", text: "Keep the document connected to the work", toc: "Keep it connected to the work" },
      {
        kind: "p",
        text: "At the weekly check-in, ask what worked, which step caused difficulty and whether the measure is useful. Update the SOP when an agreed process changes. Do not leave the working version in one person's memory while the written version becomes outdated.",
      },
      {
        kind: "p",
        text: "A useful first result is simple: the team can explain the same process, knows who is checking it, and can see what remains unfinished.",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "One page, one owner, one measure.",
      body: "Pick the process the team keeps asking about, write its purpose, champion, steps and measure on a single page, test it with the people doing the work, and revisit it at the weekly check-in. Repeatable beats comprehensive.",
    },
    kitCta: {
      kitName: "24 Business Systems Framework",
      description:
        "Available inside Dental Member Network, including the implementation guide.",
      support: "Gary's invitation includes three months free with code **GARY**.",
      href: "/garytakacs",
      label: "Join Dental Member Network",
    },
  },
  // ── Week 3 · article 3 (approved 2026-09-08; release 2026-09-11) ─────
  {
    slug: "hire-dental-staff-under-pressure",
    title: "How to Hire Dental Staff When You're Short-Staffed Without Rushing the Decision",
    metaTitle: "Hiring Dental Staff When You're Short-Staffed",
    metaDescription:
      "Use Ameena Basile's approach to hiring under pressure: define job-related standards, arrange temporary cover, and keep your dental team informed.",
    excerpt:
      "An urgent staffing gap does not have to decide your permanent hire. Ameena Basile's approach separates temporary cover from a consistent assessment of the person joining your team.",
    category: "Team & Culture",
    dek: "Separate the need for immediate cover from the decision about who should join your team permanently.",
    expert: {
      name: "Ameena Basile",
      role: "Co-founder, Dental Business Mastery",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/ameena-basile-1788280179204.jpg",
      profileHref: "/experts/65479ac7-4739-43a8-ab5d-fdb1ff1b34d2",
    },
    kitSlug: "you-just-doubled-the-problem",
    hero: {
      src: "/blog/ameena-kit-hero.jpg",
      alt: "The You Just Doubled The Problem resource kit featuring Ameena Basile",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-11",
    dateModified: "2026-09-11",
    // The approved direct opening answer, rendered as the answer-first callout.
    quickAnswer:
      "When your dental practice is short-staffed, make two decisions separately: how to cover the immediate workload and how to assess the permanent hire. Define the role's essential requirements, assess candidates against those requirements consistently, and explain the interim plan to your existing team.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Based on Ameena Basile's DMN resource kit, You Just Doubled The Problem.*",
      },
      {
        kind: "p",
        text: "Ameena Basile, co-founder of Dental Business Mastery, argues that pressure can change the hiring question from “Who meets our needs?” to “Who can start on Monday?” Her alternative is not to move slowly for its own sake. It is to keep urgency from replacing the standard.",
      },
      { kind: "h2", id: "available-not-right", text: "Why an available candidate is not automatically the right hire", toc: "Available is not right" },
      {
        kind: "p",
        text: "A vacancy creates real pressure. Calls still need answering, patients still arrive, and other team members may already be covering unfamiliar work.",
      },
      {
        kind: "p",
        text: "In Ameena's framework, a rushed hire can add a second problem to the first: the workload gap remains, while the team must also manage someone who does not meet the role's needs.",
      },
      {
        kind: "p",
        text: "Her kit uses lateness as an example. If punctuality has been a clear expectation but repeated lateness is suddenly ignored because a new hire is needed, existing staff see inconsistent treatment. The issue becomes bigger than one person's start time.",
      },
      {
        kind: "p",
        text: "The lesson is not to reject a candidate over an assumption or a single unexplained event. It is to avoid quietly abandoning agreed standards because the practice is under pressure.",
      },
      { kind: "h2", id: "non-negotiables", text: "Write down the non-negotiables before comparing candidates", toc: "Write the non-negotiables" },
      {
        kind: "p",
        text: "Ameena recommends identifying non-negotiables before a vacancy becomes urgent. If the gap already exists, make this the first step now.",
      },
      {
        kind: "p",
        text: "Translate broad values into specific, job-related expectations. “A good fit” is too vague to guide a consistent assessment.",
      },
      { kind: "p", text: "For a front-desk role, an illustrative list might include:" },
      {
        kind: "ul",
        items: [
          "Can carry out the essential scheduling and communication tasks, with a clear plan for any trainable gaps.",
          "Handles patient information carefully and follows the practice's procedures.",
          "Can meet the role's agreed schedule and communicates promptly when a problem arises.",
        ],
      },
      {
        kind: "p",
        text: "These are editorial examples, not Ameena's prescribed selection criteria. Your list should reflect the actual job, with essential requirements separated from skills you can reasonably teach.",
      },
      {
        kind: "p",
        text: "Do not use “fit” to mean someone with the same personality or background as the rest of the team. Focus on the work and the standards needed to do it.",
      },
      { kind: "h2", id: "consistent-assessment", text: "Keep the assessment consistent when someone can start immediately", toc: "Keep the assessment consistent" },
      {
        kind: "p",
        text: "Availability is useful information. It should not erase an unanswered question about the role.",
      },
      {
        kind: "p",
        text: "One practical approach is to ask each candidate the same core, job-related scenario question and record the evidence in their answer. For example:",
      },
      {
        kind: "quote",
        text: "“An appointment change has not reached the next person taking over the desk. How would you identify what changed and make sure the handoff is complete?”",
      },
      {
        kind: "p",
        text: "This is an editorial application of Ameena's call for a thorough process, not a question taken from her kit.",
      },
      {
        kind: "p",
        text: "Consider what the answer shows about communication and follow-through. If an important requirement remains unverified, name the missing evidence instead of treating enthusiasm or a fast start date as proof.",
      },
      {
        kind: "p",
        text: "Ameena also acknowledges that a process cannot guarantee the outcome. Some people interview well and look strong on paper. The aim is a considered decision, not certainty.",
      },
      { kind: "h2", id: "temporary-cover", text: "Arrange temporary cover with a clear limit", toc: "Arrange temporary cover" },
      {
        kind: "p",
        text: "Holding to your standards does not solve Tuesday's staffing problem. Ameena specifically suggests interim options such as familiar casual staff, temporary agencies, or extra shifts from existing team members.",
      },
      {
        kind: "p",
        text: "Review what is actually feasible for your practice. Extra shifts should not become an open-ended assumption that the current team can absorb any workload. Check capacity, arrange appropriate cover, and set a date to review the plan.",
      },
      {
        kind: "p",
        text: "Separate “How do we cover this week?” from “Should we offer this person a permanent role?” A workable answer to the first question gives you more room to assess the second.",
      },
      { kind: "h2", id: "explain-the-plan", text: "Explain the plan to the people carrying the gap", toc: "Explain the plan to the team" },
      {
        kind: "p",
        text: "Ameena emphasizes telling the team what you are doing and why. Without that conversation, a careful recruitment process can look like inaction.",
      },
      { kind: "p", text: "Here is illustrative wording:" },
      {
        kind: "quote",
        text: "“We are still recruiting for the role. We are checking the requirements we agreed rather than hiring only for an immediate start. Here is the cover arranged for this week. Please flag where the workload is not manageable, and we will review the plan together on Friday.”",
      },
      {
        kind: "p",
        text: "Only describe cover that has actually been arranged. Ask for specific workload concerns rather than assuming everyone supports the plan because nobody objects.",
      },
      {
        kind: "p",
        text: "For the broader communication routine, see **[How to Improve Communication in Your Dental Practice](/blog/improve-dental-team-communication)**. Once someone joins, **[How to Give a Dental Team Member Difficult Feedback Without Making It Personal](/blog/difficult-feedback-dental-team)** addresses the next stage: setting expectations and correcting problems respectfully.",
      },
      { kind: "h2", id: "hire-quickly-prepared", text: "Hire quickly because you are prepared", toc: "Hire quickly, prepared" },
      {
        kind: "p",
        text: "Ameena's distinction is useful: fast hiring and rushed hiring are not the same thing. A prepared practice can move promptly because it knows what it is assessing.",
      },
      { kind: "p", text: "Her instruction is:" },
      {
        kind: "quote",
        text: "“We shouldn't be pushed by the urgency. We should just do the job thoroughly.”",
        cite: "Ameena Basile",
      },
    ],
    takeaway: {
      eyebrow: "The takeaway",
      title: "Fast hiring and rushed hiring are not the same thing.",
      body: "Decide the temporary cover and the permanent hire separately. Write the role's non-negotiables before comparing candidates, ask every candidate the same job-related questions, and tell the team what cover is arranged and when you will review it. A prepared practice can move promptly because it knows what it is assessing.",
    },
    kitCta: {
      kitName: "You Just Doubled The Problem",
      description:
        "Ameena Basile's complete kit for hiring under pressure, available inside Dental Member Network.",
      support:
        "Get the complete **You Just Doubled The Problem** resource kit inside Dental Member Network, including **The Non-Negotiables Worksheet**, to put those expectations into writing before the next hiring decision.",
      // Standard paid membership route — no trial or free-month wording
      // (same destination Lester confirmed for Liz Lord's Week 3 article).
      href: "/join/member",
      label: "Join Dental Member Network",
    },
  },
  // ── Week 3 · article 2 (approved 2026-09-08; release 2026-09-10) ─────
  {
    slug: "difficult-feedback-dental-team",
    title: "How to Give a Dental Team Member Difficult Feedback Without Making It Personal",
    metaTitle: "Difficult Feedback for Dental Teams: A Practical Approach",
    metaDescription:
      "Give dental staff clear, specific feedback using Liz Lord's problem-first approach. Check expectations, training, tools, and support before assigning blame.",
    excerpt:
      "Difficult feedback becomes more useful when it addresses a specific problem instead of a person's character. Liz Lord's approach starts with clarity, support, and the standard you need to meet.",
    category: "Team & Culture",
    dek: "Address the missed standard, check the support you provided, and agree on what changes next.",
    expert: {
      name: "Liz Lord",
      role: "Founder and Chief Architect, The Practice Transformation Institute",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/liz-lord-headshot.jpg",
      profileHref: "/experts/d53eb2fa-4da9-4cb1-863a-61c1fc6bf2be",
    },
    kitSlug: "attack-the-problem-not-the-person",
    hero: {
      src: "/blog/liz-kit-hero.jpg",
      alt: "The Attack The Problem, Not The Person resource kit featuring Liz Lord",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-10",
    dateModified: "2026-09-10",
    quickAnswer:
      "To give a dental team member difficult feedback, describe the specific behavior and its effect rather than making a judgment about their character. Check whether you made the standard clear and provided the training, feedback, and tools to meet it. Then listen to their perspective and agree on a practical next step.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Based on Liz Lord's DMN resource kit, Attack The Problem, Not The Person.*",
      },
      {
        kind: "p",
        text: "Liz Lord, Founder and Chief Architect of The Practice Transformation Institute, summarizes the principle this way:",
      },
      { kind: "quote", text: "\u201cYou attack problems, you don't attack people.\u201d", cite: "Liz Lord" },
      {
        kind: "p",
        text: "That does not mean avoiding a difficult message. It means being clear about the problem you need to solve.",
      },
      { kind: "h2", id: "your-part", text: "Before the conversation, check your part in the problem", toc: "Check your part first" },
      {
        kind: "p",
        text: "It is tempting to begin with what the employee should have done. Liz starts one step earlier: what has the leader done, or failed to do, that contributes to the situation?",
      },
      { kind: "p", text: "Her framework asks you to check four things:" },
      {
        kind: "ul",
        items: [
          "Did you clearly communicate what a good job looks like?",
          "Did you provide the training needed to do it?",
          "Did you provide feedback?",
          "Did you provide the tools the person needs?",
        ],
      },
      {
        kind: "p",
        text: "These questions make a vague complaint more useful. \u201cThe handoffs are poor\u201d might mean the team member missed an agreed step. It might also mean that three people use three different handoff processes.",
      },
      {
        kind: "p",
        text: "If you never established the standard, acknowledge that gap and put it in place. You can still address the immediate problem without pretending the expectations were clear all along.",
      },
      { kind: "h2", id: "what-happened", text: "Describe what happened, not who the person is", toc: "Describe what happened" },
      { kind: "p", text: "Compare these two openings:" },
      { kind: "quote", text: "\u201cYou're careless with the schedule.\u201d" },
      {
        kind: "quote",
        text: "\u201cYesterday, two appointment changes were not included in the handoff, so the next team member had to reconstruct what had changed.\u201d",
      },
      {
        kind: "p",
        text: "The second is an illustrative example, not a quote from Liz or a report of an actual DMN practice. It names an observable event and its operational effect. The first assigns a personality trait that the person has little room to respond to constructively.",
      },
      {
        kind: "p",
        text: "Before your conversation, write down the event, the expected standard, and the impact. If you cannot describe those plainly, you may need more information before drawing a conclusion.",
      },
      { kind: "h2", id: "acknowledge", text: "Acknowledge good work without cancelling it", toc: "Acknowledge good work" },
      {
        kind: "p",
        text: "Liz recommends genuinely acknowledging what is going well and letting that acknowledgement land. Her warning is about following praise immediately with \u201cbut,\u201d which can make the positive statement feel disposable.",
      },
      {
        kind: "p",
        text: "This is not a requirement to invent a compliment. Choose something real and specific. Give it space. Then move to the area that needs attention without turning the first statement into a setup.",
      },
      { kind: "p", text: "For example:" },
      {
        kind: "quote",
        text: "\u201cYou handled those patient questions thoughtfully this morning. I appreciate the care you took.\u201d",
      },
      {
        kind: "quote",
        text: "\u201cI also want us to work through yesterday's handoff. Two appointment changes were missing. Can you walk me through what happened?\u201d",
      },
      {
        kind: "p",
        text: "This wording is an editorial adaptation of the principle. The important features are genuine acknowledgement, a concrete problem, and an invitation to explain.",
      },
      { kind: "h2", id: "standard-and-support", text: "Agree on the standard and the support", toc: "Agree the standard and support" },
      { kind: "p", text: "Once you understand the issue, make the next step observable." },
      {
        kind: "p",
        text: "In the handoff example, you might agree that appointment changes are recorded in one shared place before the next person takes over. If the person needs training or access, name who will provide it. Agree when you will check whether the process is working.",
      },
      {
        kind: "p",
        text: "Liz distinguishes accountability from sole ownership. The accountable person does not have to perform every task alone. Other people can help, but someone needs to keep track of whether the work meets the standard.",
      },
      {
        kind: "p",
        text: "That distinction matters in a busy dental practice. \u201cEveryone helps\u201d should not leave nobody responsible for checking completion.",
      },
      {
        kind: "p",
        text: "If expectations are inconsistent across the whole team, **[How to Improve Communication in Your Dental Practice](/blog/improve-dental-team-communication)** is a useful companion topic. A private correction cannot solve a process that the entire team understands differently.",
      },
      { kind: "h2", id: "keeps-happening", text: "What if the problem keeps happening?", toc: "If it keeps happening" },
      {
        kind: "p",
        text: "Respectful feedback is not the same as indefinite tolerance. Liz is clear that leaders still need to address problems rather than letting them continue.",
      },
      {
        kind: "p",
        text: "Return to the agreed standard and what has happened since the conversation. Check whether the promised support was provided. Discuss the remaining gap using specific examples rather than escalating to labels such as \u201clazy\u201d or \u201cnot a team player.\u201d",
      },
      {
        kind: "p",
        text: "Use the practice's established management process for any further action. This article is a communication framework, not a disciplinary procedure.",
      },
    ],
    takeaway: {
      eyebrow: "Make the next conversation easier to prepare",
      title: "Four lines before you start.",
      body: "Before the next difficult conversation, write four lines: what happened, what good work should look like, what support is needed, and when you will follow up. This preparation exercise is an editorial application of Liz's approach. You do not need to choose between protecting the relationship and addressing the work. Be respectful of the person and clear about the standard.",
    },
    kitCta: {
      kitName: "Attack The Problem, Not The Person",
      description:
        "Available inside Dental Member Network, to work through Liz Lord's approach to communication, leadership, and accountability.",
      // Standard paid membership route — no trial or free-month wording.
      href: "/join/member",
      label: "Join Dental Member Network",
    },
  },
  // ── Week 3 (approved 2026-09-08; release 2026-09-09) ────────────────
  {
    slug: "dental-post-treatment-follow-up-call",
    title: "What Should a Dentist Say in a Follow-Up Call After Treatment?",
    metaTitle: "Dental Follow-Up Call After Treatment: What to Say",
    metaDescription:
      "Use Gary Takacs's patient follow-up framework to plan a caring check-in after dental treatment, handle questions, and record what needs attention.",
    excerpt:
      "A caring after-treatment call needs a clear opening, time to listen, and a reliable next step. Gary Takacs's framework helps your team plan who calls and how to follow through.",
    category: "Patient Experience",
    dek: "A useful patient check-in starts with listening, not selling. Gary Takacs's evening call framework gives your team a simple place to begin.",
    expert: {
      name: "Gary Takacs",
      role: "Founder, Thriving Dentist",
      headshotUrl:
        "https://jbntnrtnaqigsyzgvuyv.supabase.co/storage/v1/object/public/kit-thumbnails/profiles/gary-takacs-headshot.jpg",
      profileHref: "/experts/ecf8bd07-66e7-48f9-b002-b1b33adb2548",
    },
    kitSlug: "evening-we-care-call",
    hero: {
      src: "/blog/gary-we-care-kit-hero.jpg",
      alt: "The Evening 'We Care' Call resource kit featuring Gary Takacs",
    },
    readTime: "5 minute read",
    datePublished: "2026-09-09",
    dateModified: "2026-09-09",
    quickAnswer:
      "A dental follow-up call should identify who is calling, explain that the practice is checking in after treatment, ask how the patient is feeling, and give them space to raise questions. The caller should then record the conversation and route any clinical concern to the dentist through the practice's agreed process.",
    body: [
      {
        kind: "p",
        lead: true,
        text: "*Based on Gary Takacs's DMN resource kit, The Evening 'We Care' Call That Creates Patient Loyalty.*",
      },
      {
        kind: "p",
        text: "The point is not to complete a script as quickly as possible. It is to make sure the patient has been heard and knows what happens next.",
      },
      { kind: "h2", id: "check-in", text: "Start with a genuine check-in", toc: "Start with a check-in" },
      {
        kind: "p",
        text: "Gary Takacs's approach is the evening \u201cWe Care\u201d call: a personal follow-up after a significant procedure. His framework puts a human conversation after the clinical appointment, when the patient is back at home.",
      },
      { kind: "p", text: "Here is illustrative wording adapted from that framework, not a verbatim quotation:" },
      {
        kind: "quote",
        text: "\u201cHi, this is Sam calling from your dental practice. Dr. Lee asked me to check in after your visit today. How are you feeling? Is there anything you would like us to help with?\u201d",
      },
      {
        kind: "p",
        text: "Use the real caller's name and identify the practice. Confirm you are speaking with the intended patient before discussing treatment details.",
      },
      {
        kind: "p",
        text: "Then stop talking. The question matters only if the patient has room to answer it. A patient who says, \u201cI'm not sure about one of the instructions,\u201d needs a response, not the next line of a script.",
      },
      { kind: "h2", id: "who-and-when", text: "Decide who calls and when", toc: "Decide who calls and when" },
      {
        kind: "p",
        text: "Gary suggests that the doctor call after complex procedures and that an assistant can handle routine follow-up calls. His suggested evening window is 6 to 7 p.m.",
      },
      {
        kind: "p",
        text: "Treat that as a starting point for the practice's workflow, not a reason to ignore a patient's contact preferences. Agree in advance which patients need a call, who owns each call, and who is available if a question needs the dentist's attention.",
      },
      {
        kind: "p",
        text: "For example, the team could identify the day's follow-up patients before closing and assign one caller to each. That is an editorial implementation suggestion, not an additional rule from Gary's kit.",
      },
      { kind: "p", text: "The useful distinction is ownership: someone should know that the call is theirs to make." },
      { kind: "h2", id: "concerns", text: "Know what to do when the patient raises a concern", toc: "When a concern is raised" },
      {
        kind: "p",
        text: "A caring call can surface a question the patient did not ask at the appointment. It should not turn a non-clinical team member into someone who diagnoses symptoms or improvises treatment advice.",
      },
      {
        kind: "p",
        text: "Before introducing the routine, the dentist should define how callers route clinical questions and urgent concerns. Follow the practice's clinician-approved instructions and escalation process. This article addresses communication, not clinical aftercare, and the call does not replace written discharge instructions.",
      },
      { kind: "p", text: "Consider this illustrative response:" },
      {
        kind: "quote",
        text: "\u201cThank you for telling me. I will pass that question to the dentist through our follow-up process so you can get the right guidance.\u201d",
      },
      {
        kind: "p",
        text: "Only promise a callback time that the practice can meet. If a concern needs urgent attention, use the agreed urgent-care process rather than leaving it as a routine message.",
      },
      { kind: "h2", id: "voicemail", text: "Leave a useful voicemail and record the outcome", toc: "Voicemail and the record" },
      { kind: "p", text: "Gary recommends leaving a warm voicemail when the patient does not answer and logging each call." },
      { kind: "p", text: "Keep voicemail wording general and consistent with the patient's communication preferences. For example:" },
      {
        kind: "quote",
        text: "\u201cHi, this is Sam from your dental practice, checking in with you. Please call us back on our practice number if you would like to speak with the team.\u201d",
      },
      {
        kind: "p",
        text: "In the call record, note whether you reached the patient, left a message, or identified a question needing follow-up. Record the next owner and action when something remains unresolved. These record fields are an editorial suggestion for making Gary's logging step usable.",
      },
      { kind: "p", text: "A \u201ccall completed\u201d tick should not hide an unanswered question." },
      { kind: "h2", id: "not-a-sales-call", text: "Keep this call separate from a sales conversation", toc: "Not a sales conversation" },
      {
        kind: "p",
        text: "An after-treatment check-in has a different purpose from a call that books a new patient. If someone is uncomfortable or uncertain, focus on that concern. Do not treat the moment as an opportunity to sell another service or request a positive review.",
      },
      {
        kind: "p",
        text: "For the earlier part of the patient journey, our article **[Why New-Patient Calls Fail to Become Appointments](/blog/new-patient-calls-to-appointments)** covers the booking conversation. Here, success starts with a clear answer to a simpler question: did the patient get the support they needed after the visit?",
      },
    ],
    takeaway: {
      eyebrow: "Put the routine into practice",
      title: "Start small, and make sure the call has an owner.",
      body: "Start with a defined group of follow-up patients, a named caller, an agreed contact window, and a clear route back to the dentist. Review any unresolved questions at the next team check-in.",
    },
    kitCta: {
      // The CTA template prefixes "Get the complete … resource kit", so the
      // leading "The" is dropped here to avoid "the complete The Evening…".
      kitName: "Evening 'We Care' Call That Creates Patient Loyalty",
      description:
        "Available inside Dental Member Network, including the companion call script.",
      href: "/garytakacs",
      label: "Join Dental Member Network",
      support: "Gary's invitation offers three months free with code **GARY**.",
    },
  },
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
