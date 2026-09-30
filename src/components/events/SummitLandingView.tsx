"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics";
import { initMetaPixel, trackMeta } from "@/components/ads/metaPixel";
import { useSignOut } from "@/lib/auth/identity";

/**
 * DMN × RIDA summit landing page — Option 3 (compact signup), built from
 * the supplied design. Markup mirrors the reference HTML so the scoped
 * stylesheet (summit.css) applies unchanged; the inert reference form is
 * replaced with the live one.
 *
 * The live form collects exactly the Zoom registration questions plus the
 * recurring-billing agreement, then opens Stripe's EMBEDDED checkout for
 * the campaign offer ($0 today, nothing to pay until 6 January 2027, then $49/month). Nothing
 * here grants access: the server creates the registration as pending,
 * and only the verified Stripe webhook can entitle it and trigger Zoom.
 */

/** Stripe.js is heavy; it is fetched only once a checkout session exists. */
const SummitCheckout = dynamic(() => import("./SummitCheckout"), {
  ssr: false,
  loading: () => <p className="stripe-loading">Loading secure checkout…</p>,
});

/** The nine speakers on the 6 November banner (RIDA Annual Summit 2026, "Built to Stay"). */
const SPEAKERS = [
  { img: "/rida/nov/devon-banks.jpg", name: "DeVon Banks", role: "CEO, D-TECH Billing & Claims" },
  { img: "/rida/nov/kelly-fox-galvagni.jpg", name: "Kelly Fox Galvagni", role: "Founder, Smile Potential" },
  { img: "/rida/nov/ken-kaufman.jpg", name: "Ken Kaufman", role: "Founder, Dental Finance Forum and AccruDent" },
  { img: "/rida/nov/laura-phillips.jpg", name: "Laura Phillips, E.A.", role: "Co-Founder, The Phillips Group" },
  { img: "/rida/nov/lorne-lavine.jpg", name: "Dr. Lorne Lavine", role: "Owner, The Digital Dentist" },
  { img: "/rida/nov/naren-arulrajah.jpg", name: "Naren Arulrajah", role: "Founder & CEO, Ekwa Marketing" },
  { img: "/rida/nov/gary-takacs.jpg", name: "Gary Takacs", role: "Founder, The Thriving Dentist" },
  { img: "/rida/nov/kristie-kapp.jpg", name: "Kristie Kapp, RDH", role: "CEO & Co-Founder, EBITDent" },
  { img: "/rida/nov/michael-sonick.jpg", name: "Dr. Michael Sonick", role: "Periodontist and keynote speaker" },
];

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  practiceWebsiteName: string;
  speakerQuestion: string;
  agree: boolean;
};

const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  practiceWebsiteName: "",
  speakerQuestion: "",
  agree: false,
};

type MemberMe = {
  signedIn: boolean;
  paid?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  practiceName?: string;
  registration?: { status: string } | null;
};

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/**
 * mode "landing" is /rida: the summit page, every button leads to /rida/join.
 * mode "join" is /rida/join: the join step only, the offer summary beside
 * the form, same offer text, same Stripe step. Ad and replay tags are
 * carried from /rida to /rida/join in the address bar.
 */
export default function SummitLandingView({ mode = "landing" }: { mode?: "landing" | "join" }) {
  const isJoin = mode === "join";
  const [joinHref, setJoinHref] = useState("/rida/join");
  const signOut = useSignOut("member");
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [me, setMe] = useState<MemberMe | null>(null);
  const [memberDone, setMemberDone] = useState<string | null>(null);
  const tracking = useRef<{ utm: Record<string, string>; fbclid: string | null; landingUrl: string | null }>({ utm: {}, fbclid: null, landingUrl: null });

  // Campaign context + pixel + signed-in member check, once on mount.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const k of ["source", "medium", "campaign", "content", "term"]) {
        const v = sp.get(`utm_${k}`);
        if (v) utm[k] = v.slice(0, 200);
      }
      tracking.current = { utm, fbclid: sp.get("fbclid"), landingUrl: window.location.href.slice(0, 400) };
      // Deferred so the state update is not synchronous inside the effect.
      const nextHref = isJoin ? "#signup" : `/rida/join${window.location.search}`;
      queueMicrotask(() => setJoinHref(nextHref));
      initMetaPixel();
      trackMeta("PageView");
      trackMeta("ViewContent", { content_name: "summit_trial" });
      trackEvent("summit_view", { campaign: utm.campaign ?? "" });
    } catch {
      /* measurement must never break the page */
    }
    (async () => {
      try {
        const res = await fetch("/api/events/summit/register", { cache: "no-store" });
        const body = (await res.json().catch(() => ({}))) as MemberMe;
        setMe(body);
        if (body.signedIn) {
          setForm((f) => ({
            ...f,
            firstName: body.firstName ?? f.firstName,
            lastName: body.lastName ?? f.lastName,
            email: body.email ?? f.email,
            phone: body.phone ?? f.phone,
            practiceWebsiteName: body.practiceName ?? f.practiceWebsiteName,
          }));
          if (body.registration?.status === "zoom_registered") setMemberDone("zoom_registered");
        }
      } catch {
        setMe({ signedIn: false });
      }
    })();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const memberPath = !!me?.signedIn && !!me.paid;

  const canSubmit = useMemo(() => {
    const base = form.phone.trim().length >= 6 && form.practiceWebsiteName.trim().length >= 2;
    if (memberPath) return base;
    return base && form.firstName.trim() !== "" && form.lastName.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) && form.agree;
  }, [form, memberPath]);

  const startTrial = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    setAlreadyMember(false);
    try {
      const res = await fetch("/api/events/summit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          practiceWebsiteName: form.practiceWebsiteName,
          speakerQuestion: form.speakerQuestion || null,
          agreementAccepted: form.agree,
          utm: tracking.current.utm,
          fbclid: tracking.current.fbclid,
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          landingUrl: tracking.current.landingUrl,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { clientSecret?: string; error?: string; alreadyMember?: boolean; alreadyRegistered?: boolean };
      if (!res.ok || !body.clientSecret) {
        if (body.alreadyMember) setAlreadyMember(true);
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      trackEvent("sign_up", { method: "summit_trial" });
      trackEvent("begin_checkout", { currency: "USD", value: 0, items: [{ item_id: "summit_trial", item_name: "DMN two months on us" }] });
      trackMeta("InitiateCheckout", { value: 0, currency: "USD", content_name: "summit_trial" });
      setClientSecret(body.clientSecret);
      setTimeout(() => document.getElementById("pay-head")?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, form]);

  const registerMember = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/events/summit/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          practiceWebsiteName: form.practiceWebsiteName,
          speakerQuestion: form.speakerQuestion || null,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; status?: string; error?: string };
      if (!res.ok || !body.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      trackEvent("summit_member_registered", {});
      setMemberDone(body.status ?? "entitled");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, form]);

  const registrationFields = (
    <>
      <label>
        Mobile phone
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+1 555 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </label>
      <label>
        Practice website and name
        <input name="practice" autoComplete="organization" required placeholder="Riverside Family Dental · riversidedental.com" value={form.practiceWebsiteName} onChange={(e) => set("practiceWebsiteName", e.target.value)} />
      </label>
      <label>
        Any questions you would like the speakers to address during the live session? <span style={{ fontWeight: 400, color: "#6a7680" }}>(optional)</span>
        <textarea name="question" maxLength={1000} value={form.speakerQuestion} onChange={(e) => set("speakerQuestion", e.target.value)} />
      </label>
    </>
  );

  return (
    <>
      <header className="event-header container">
        <a href="#join" aria-label="DMN summit and membership trial">
          <Image src="/rida/dmn-logo.png" alt="Dental Member Network" className="dmn-logo" width={194} height={62} sizes="194px" priority />
        </a>
        <span className="brand-partner">
          <span className="partner-with">WITH</span>
          <Image className="rida-logo" src="/rida/rida-logo.png" alt="RIDA — Reducing Insurance Dependence Academy" width={166} height={48} sizes="166px" priority />
        </span>
        <nav aria-label="Event navigation">
          <a href="#program">The program</a>
          <a href="#panel">Speakers</a>
          <a href="#membership">DMN membership</a>
          <a href={joinHref} className="small-cta">Start my two months ↗</a>
        </nav>
      </header>

      <main>
        {/* The DMN version of the November banner (no cost line, no register button), spec v2. */}
        {!isJoin && (
        <div className="container" style={{ paddingTop: 18 }}>
          <Image
            src="/replay/rida-annual-2026-11-06-banner.jpg"
            alt="RIDA Annual Summit 2026, Built to Stay: The Independent Practice Operating System. Nine speakers."
            width={1600}
            height={658}
            sizes="(max-width: 1200px) 100vw, 1160px"
            priority
            style={{ width: "100%", height: "auto", borderRadius: 14, display: "block", boxShadow: "0 14px 36px rgba(10,26,47,0.14)" }}
          />
        </div>
        )}
        <section className="c-hero container" id="join">
          {isJoin ? (
          <div className="c-overview">
            <span className="eyebrow">TWO MONTHS ON US · JOIN THE DENTAL MEMBER NETWORK</span>
            <h1>
              Join now.<br />Your seat on 6 November <em>is booked for you.</em>
            </h1>
            <p className="intro">The Practice Playbook from RIDA Live is on your dashboard the day you join, and there is nothing to pay until Wednesday 6 January 2027. $49 a month for life if you join before 6 November. Cancel any time.</p>
            <div className="facts">
              <div><span>TODAY</span><b>$0</b></div>
              <div><span>FIRST BILLING</span><b>6 January 2027</b></div>
              <div><span>THEN</span><b>$49 a month</b></div>
            </div>
            <div className="c-checks">
              <p><span>✓</span> Your seat at the RIDA Annual Summit on 6 November, with 4 CE credits through RIDA</p>
              <p><span>✓</span> The Practice Playbook from RIDA Live on your dashboard today</p>
              <p><span>✓</span> Expert Hotline, Practice Playbooks, directories and member offers</p>
              <p><span>✓</span> Thirty-day money-back guarantee. Cancel any time before 6 January and you pay nothing</p>
            </div>
            <Link className="membership-jump" href={`/rida${typeof window === "undefined" ? "" : window.location.search}`}>About the summit and the speakers ↗</Link>
          </div>
          ) : (
          <div className="c-overview">
            <span className="eyebrow">NOVEMBER 6 · RIDA ANNUAL SUMMIT 2026</span>
            <h1>
              Built to stay.<br />The independent practice <em>operating system.</em>
            </h1>
            <p className="intro">The playbook for practices feeling the squeeze. Practical strategies from nine experts, six of them in this network, over one afternoon on Zoom.</p>
            <div className="facts">
              <div><span>FRIDAY</span><b>November 6, 2026</b></div>
              <div><span>LIVE ON ZOOM</span><b>12:00 to 4:30 PM Eastern</b></div>
              <div><span>CONTINUING EDUCATION</span><b>4 CE credits</b></div>
            </div>
            <div className="c-checks">
              <p><span>✓</span> Your seat on 6 November, booked for you, with 4 CE credits</p>
              <p><span>✓</span> The Practice Playbook from RIDA Live on your dashboard today</p>
              <p><span>✓</span> Expert Hotline, Practice Playbooks, directories and member offers</p>
              <p><span>✓</span> $0 today. Nothing to pay until Wednesday 6 January 2027</p>
            </div>
            <a className="cta hero-cta" href={joinHref}>Start my two months ↗</a>
            <a className="membership-jump" href="#membership">What is included in my DMN membership? ↓</a>
            <span className="speaker-caption" id="panel">YOUR SUMMIT SPEAKERS</span>
            <div className="c-faces">
              {SPEAKERS.map((s) => (
                <article className="person" key={s.name}>
                  <Image src={s.img} alt={s.name} width={400} height={440} sizes="(max-width: 760px) 25vw, 110px" />
                  <div><h3>{s.name}</h3></div>
                </article>
              ))}
            </div>
            <details className="speaker-roles">
              <summary>Meet the speakers and their roles <span aria-hidden="true">+</span></summary>
              <ul>
                {SPEAKERS.map((s) => (
                  <li key={s.name}><b>{s.name}</b><span>{s.role}</span></li>
                ))}
              </ul>
            </details>
          </div>
          )}

          <div className="c-form">
            <div className="signup-card" id="signup">
              <span className="trial-label">DMN MEMBERSHIP · TWO MONTHS ON US</span>
              <div className="trial-price">$0 <span>today</span></div>
              <p>
                Nothing to pay until <strong>Wednesday 6 January 2027</strong>.<br />Then $49 a month, yours for life if you join before 6 November. Cancel any time before then and you will not be charged at all.
              </p>
              <div className="signup-includes">
                <b>Your membership includes</b>
                <span>Your seat at the 6 November summit + the RIDA Live playbook + DMN membership</span>
                <small>Expert Hotline · Practice Playbooks &amp; templates · directories &amp; member offers</small>
              </div>
              <div className="divider" />

              {clientSecret ? (
                <>
                  <h3 id="pay-head">Complete your membership</h3>
                  <p className="pay-head">
                    {form.email} · $0 today, nothing to pay until 6 January 2027.{" "}
                    <button type="button" onClick={() => setClientSecret(null)}>Edit details</button>
                  </p>
                  <div className="stripe-wrap">
                    <SummitCheckout clientSecret={clientSecret} />
                  </div>
                </>
              ) : memberDone ? (
                <div className="success-card">
                  <span className="tick">✓</span>
                  <h3>You&apos;re registered</h3>
                  <p>
                    {memberDone === "zoom_registered"
                      ? "Your seat on 6 November is booked. Zoom is emailing your personal join link now, on behalf of RIDA. Check your spam folder if it is not there in a few minutes."
                      : "We're booking your seat for 6 November now. Zoom will email your personal join link within a few minutes."}
                  </p>
                  <Link className="button primary" href="/dashboard" style={{ width: "100%" }}>Back to my portal ↗</Link>
                </div>
              ) : memberPath ? (
                <>
                  <h3>Register for the summit</h3>
                  <div className="member-card">
                    <b>Signed in as {form.email}</b>
                    Your DMN membership already includes your seat at the summit. No checkout needed, just confirm a few details for Zoom.
                    <br />
                    <button type="button" className="text-link" onClick={() => void signOut()} style={{ background: "none", border: 0, padding: 0, marginTop: 8, cursor: "pointer", font: "inherit" }}>
                      Not you? Sign out
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void registerMember();
                    }}
                  >
                    {registrationFields}
                    {error && <div className="form-error">{error}</div>}
                    <button className="button primary" type="submit" disabled={!canSubmit || submitting}>
                      {submitting ? "Booking…" : "Book my seat for November 6"} <span aria-hidden="true">↗</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h3>Create your membership</h3>
                  <form
                    id="trial-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void startTrial();
                    }}
                  >
                    <div className="form-row">
                      <label>
                        First name
                        <input name="firstName" autoComplete="given-name" required placeholder="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                      </label>
                      <label>
                        Last name
                        <input name="lastName" autoComplete="family-name" required placeholder="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                      </label>
                    </div>
                    <label>
                      Email address
                      <input name="email" type="email" autoComplete="email" required placeholder="you@yourpractice.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </label>
                    {registrationFields}
                    <label className="agree">
                      <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} />
                      <span>
                        I agree to the <Link href="/agreement/member" target="_blank" rel="noopener">Member Agreement</Link> and to recurring billing of $49/month from Wednesday 6 January 2027 unless I cancel first.
                      </span>
                    </label>
                    {error && (
                      <div className="form-error">
                        {error}{" "}
                        {alreadyMember && (
                          <Link href="/member/login?next=%2Frida%2Fjoin">Sign in to register →</Link>
                        )}
                      </div>
                    )}
                    <button className="button primary" type="submit" disabled={!canSubmit || submitting}>
                      {submitting ? "One moment…" : "Continue, $0 today"} <span aria-hidden="true">↗</span>
                    </button>
                  </form>
                  <p className="form-note">Your card will not be charged today. Billing starts on Wednesday 6 January 2027, at $49 a month. Cancel any time before then and you will not be charged at all. We register you for RIDA, so your name and email are shared with the event organiser. Your Zoom link is emailed to you within a few minutes of joining.</p>
                  {!me?.signedIn && (
                    <Link className="text-link existing" href="/member/login?next=%2Frida%2Fjoin">Already a DMN member? Sign in to register</Link>
                  )}
                  {me?.signedIn && !me.paid && (
                    <p className="form-note" style={{ textAlign: "center" }}>
                      You&apos;re signed in, but your membership isn&apos;t active yet. Start above to book your seat.{" "}
                      <button type="button" className="text-link" onClick={() => void signOut()} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}>
                        Not you? Sign out
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {!isJoin && (
        <>
        <section className="membership-section" id="membership" aria-labelledby="membership-title">
          <div className="container">
            <div className="membership-heading">
              <div>
                <span className="eyebrow">YOUR DENTAL MEMBER NETWORK MEMBERSHIP</span>
                <h2 id="membership-title">
                  The summit starts the conversation.<br /><em>DMN helps you keep going.</em>
                </h2>
              </div>
              <p>Dental Member Network brings practice support, expert resources and trusted connections together. Your membership is open from today. Use the two months to explore what helps your practice, starting with the playbook from RIDA Live.</p>
            </div>
            <div className="benefit-grid">
              <article><span className="benefit-label">01 / ASK</span><h3>A real practice question. <br />A human response.</h3><p>Bring a clinical, financial, team or operational question to the Expert Hotline. Beacon answers right away from the experts&apos; own sessions, and a person follows up in writing.</p></article>
              <article><span className="benefit-label">02 / PUT INTO PRACTICE</span><h3>Expert knowledge you <br />can work with.</h3><p>Explore a growing library of Practice Playbooks, practical tools and templates, with resources such as checklists, worksheets and action guides.</p></article>
              <article><span className="benefit-label">03 / FIND SUPPORT</span><h3>Find the right expertise <br />for your next step.</h3><p>Browse the curated expert directory and vetted company directory when you need to find specialist support for your practice.</p></article>
              <article><span className="benefit-label">04 / EXPLORE</span><h3>Member offers, <br />in one place.</h3><p>Explore confirmed member offers alongside the people, resources and companies in DMN. Individual offer terms apply.</p></article>
            </div>
            <div className="library-preview">
              <div className="library-heading">
                <div>
                  <span className="eyebrow">A LOOK INSIDE THE RESOURCE LIBRARY</span>
                  <h3>Start with a challenge your practice knows.</h3>
                </div>
                <p>The playbook from RIDA Live, and a few more to explore.</p>
              </div>
              <div className="kit-grid">
                <article><Image src="/replay/playbook-stop-losing-revenue-square.jpg" width={360} height={360} sizes="(max-width: 760px) 30vw, 120px" alt="Stop Losing Revenue You Already Earned, the Practice Playbook from RIDA Live" /><div><span>FROM RIDA LIVE · ON YOUR DASHBOARD DAY ONE</span><h4>Stop Losing Revenue You Already Earned</h4><p>Kiera Dent, Ben Tuinei, Dr. Ekta Pandya, Maria Jackson, Francesca Ortepi</p></div></article>
                <article><Image src="/rida/kit-huddle.jpg" width={360} height={360} sizes="(max-width: 760px) 30vw, 120px" alt="Successful Morning Huddle Practice Playbook cover" /><div><span>TEAM ROUTINES</span><h4>Successful Morning Huddle</h4><p>Callie Ward</p></div></article>
                <article><Image src="/rida/kit-numbers.jpg" width={360} height={360} sizes="(max-width: 760px) 30vw, 120px" alt="Know Your Real Numbers Practice Playbook cover" /><div><span>PRACTICE FINANCES</span><h4>Know Your Real Numbers</h4><p>Laura Phillips, E.A.</p></div></article>
                <article><Image src="/rida/kit-process.jpg" width={360} height={360} sizes="(max-width: 760px) 30vw, 120px" alt="The Process Comes First Practice Playbook cover" /><div><span>PRACTICE SYSTEMS</span><h4>The Process Comes First</h4><p>DeVon Banks</p></div></article>
              </div>
            </div>
            <div className="membership-close">
              <p>
                <b>One summit. Two months to explore DMN.</b>
                <span>Nothing to pay until Wednesday 6 January 2027. Then $49 a month unless cancelled.</span>
              </p>
              <a className="cta" href={joinHref}>Start my two months ↗</a>
            </div>
          </div>
        </section>

        <section className="c-program section container" id="program">
          <div className="heading-row">
            <div>
              <span className="eyebrow">WHAT YOU’LL EXPLORE</span>
              <h2>One afternoon.<br />The operating system for an independent practice.</h2>
            </div>
            <p>The playbook for practices<br />feeling the squeeze</p>
          </div>
          <div className="program-grid">
            <article>
              <span className="chapter">01 / THE SPEAKERS</span>
              <h3>Nine experts.<br />Six of them in this network.</h3>
              <p>Practical strategies from the people who run, finance and grow independent practices.</p>
              <ul>
                {SPEAKERS.map((s) => (
                  <li key={s.name}><b>{s.name}</b>, {s.role}</li>
                ))}
              </ul>
            </article>
            <article>
              <span className="chapter">02 / WHAT YOU TAKE HOME</span>
              <h3>Four CE credits,<br />and the work after the day.</h3>
              <p>The summit is one afternoon. The membership is what you keep.</p>
              <ul>
                <li>4 CE credits on the day, subject to the provider’s attendance requirements</li>
                <li>The full replay, in chapters, inside the portal afterwards</li>
                <li>The Practice Playbook from RIDA Live on your dashboard from day one</li>
                <li>The Expert Hotline for the questions the day raises</li>
              </ul>
              <div className="byline">Presented by RIDA, in partnership with Ekwa Marketing</div>
            </article>
          </div>
          <p className="ce-disclosure">
            <b>CE provider:</b> Thriving Dentist Inc., an AGD PACE-approved program provider. The 4 CE credits are subject to the provider’s attendance and completion requirements. The seat is free on RIDA’s own site as well; what we add is the booking, the playbook, the library and the two months.
          </p>
        </section>

        <section className="c-next">
          <div className="container">
            <span className="eyebrow">AFTER YOU SIGN UP</span>
            <div className="c-steps">
              <article><span>01</span><h3>Open your membership</h3><p>Enter your card securely at checkout. $0 today, and your membership is open at once.</p></article>
              <article><span>02</span><h3>Your seat is booked</h3><p>You are registered automatically and Zoom emails your personal link within a few minutes.</p></article>
              <article><span>03</span><h3>Use your two months</h3><p>Start with the RIDA Live playbook and the Expert Hotline, then join the summit on 6 November.</p></article>
            </div>
            <a className="cta" href={joinHref}>Start my two months ↗</a>
            <p className="offer-terms">
              <strong>$0 today.</strong> Nothing to pay until Wednesday 6 January 2027. Then $49 a month.<br />Cancel any time before then and you will not be charged at all.
            </p>
          </div>
        </section>

        <section className="faq section container">
          <div>
            <span className="eyebrow">A FEW USEFUL ANSWERS</span>
            <h2>Before you join.</h2>
          </div>
          <div>
            <details><summary>What does DMN membership include?</summary><p>Your seat at the summit, the Practice Playbook built from RIDA Live on your dashboard from day one, the Expert Hotline, a growing Practice Playbook library, practical tools and templates, curated expert and company directories, and confirmed member offers. These continue while your subscription stays active.</p></details>
            <details><summary>When does billing start?</summary><p>On Wednesday 6 January 2027, two months after the summit, for everyone who joins through this offer, whatever day you join. From then it is $49 a month, locked for life if you join before 6 November. Cancel any time before then and you will not be charged at all. We will remind you by email seven days before the first charge.</p></details>
            <details><summary>How do I get my Zoom link?</summary><p>Once your membership is open you are registered for the live session automatically, and Zoom emails your personal join link within a few minutes. It comes from Zoom, on behalf of RIDA, so check your spam folder if it has not arrived. The link is unique to you, so please don’t forward it.</p></details>
            <details><summary>What do I need to do for CE credit?</summary><p>Attend the qualifying session and complete the CE provider’s required attendance verification and evaluation. Registration alone does not earn credit.</p></details>
            <details><summary>I’m already a DMN member. Do I pay again?</summary><p>No. Sign in with your member email and we register you for the summit at no charge. Your existing membership is not changed.</p></details>
            <details><summary>Is this event exclusive to DMN?</summary><p>No. The summit is free to attend on RIDA’s own site. What we add is the booking, the Practice Playbook from RIDA Live, the library and two months of membership on us. If you cancel before the summit, you keep your seat.</p></details>
          </div>
        </section>
        </>
        )}
      </main>

      <footer className="event-footer container">
        <Image src="/rida/dmn-logo.png" alt="Dental Member Network" width={160} height={52} sizes="160px" />
        <p>November 6, 2026 · DMN × RIDA</p>
        <nav className="site-links" aria-label="Legal and support">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/refund">Cancellation</Link>
          <Link href="/agreement/member">Member Agreement</Link>
          <a href="mailto:founding@dentalmembernetwork.com">Support</a>
        </nav>
      </footer>
    </>
  );
}
