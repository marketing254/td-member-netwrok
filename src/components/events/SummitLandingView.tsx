"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { trackEvent } from "@/lib/analytics";
import { initMetaPixel, trackMeta } from "@/components/ads/metaPixel";

/**
 * DMN × RIDA summit landing page — Option 3 (compact signup), built from
 * the supplied design. Markup mirrors the reference HTML so the scoped
 * stylesheet (summit.css) applies unchanged; the inert reference form is
 * replaced with the live one.
 *
 * The live form collects exactly the Zoom registration questions plus the
 * recurring-billing agreement, then opens Stripe's EMBEDDED checkout for
 * the campaign offer ($0 today, 30-day trial, then $49/month). Nothing
 * here grants access: the server creates the registration as pending,
 * and only the verified Stripe webhook can entitle it and trigger Zoom.
 */

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

const SPEAKERS = [
  { img: "/rida/ekta.jpg", name: "Dr. Ekta Pandya", role: "Dentist, DDS · Public Health & AI Advocate" },
  { img: "/rida/benjamin.jpg", name: "Benjamin Tuinei", role: "Founder & President, Veritas Dental Resources" },
  { img: "/rida/kiera.jpg", name: "Kiera Dent", role: "CEO & Founder, The Dental A Team" },
  { img: "/rida/lester.png", name: "Lester De Alwis", role: "Marketing Manager, EKWA Marketing" },
  { img: "/rida/maria.jpg", name: "Maria Jackson", role: "MS, CRDH · CEO & Founder, Dental AI Solutions" },
  { img: "/rida/francesca.png", name: "Francesca Ortepi", role: "Founder, Dentech Direct · The Practice Operator™" },
  { img: "/rida/kevin.png", name: "Kevin Wheeler", role: "Fractional COO & Dental Business Strategist" },
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

export default function SummitLandingView() {
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
      trackEvent("begin_checkout", { currency: "USD", value: 0, items: [{ item_id: "summit_trial", item_name: "DMN 30-day trial" }] });
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
          <Image src="/rida/dmn-logo.png" alt="Dental Member Network" className="dmn-logo" width={194} height={62} priority />
        </a>
        <span className="brand-partner">
          <span className="partner-with">WITH</span>
          <Image className="rida-logo" src="/rida/rida-logo.png" alt="RIDA — Reducing Insurance Dependence Academy" width={166} height={48} priority />
        </span>
        <nav aria-label="Event navigation">
          <a href="#program">The program</a>
          <a href="#panel">Speakers</a>
          <a href="#membership">DMN membership</a>
          <a href="#join" className="small-cta">Start free trial ↗</a>
        </nav>
      </header>

      <main>
        <section className="c-hero container" id="join">
          <div className="c-overview">
            <span className="eyebrow">SEPTEMBER 16 · LIVE DENTAL PRACTICE SUMMIT</span>
            <h1>
              Stop losing revenue<br />you already <em>earned.</em>
            </h1>
            <p className="intro">Two focused hours on case acceptance, team performance and patient retention—with seven practice experts.</p>
            <div className="facts">
              <div><span>WEDNESDAY</span><b>September 16, 2026</b></div>
              <div><span>LIVE ON ZOOM</span><b>7–9 PM Eastern</b></div>
              <div><span>CONTINUING EDUCATION</span><b>2 CE credits</b></div>
            </div>
            <div className="c-checks">
              <p><span>✓</span> Two live panels and 2 CE credits</p>
              <p><span>✓</span> DMN Expert Hotline, resource kits and templates</p>
              <p><span>✓</span> Expert &amp; company directories and member offers</p>
              <p><span>✓</span> $0 today. Then $49/month unless cancelled</p>
            </div>
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

          <div className="c-form">
            <div className="signup-card">
              <span className="trial-label">DMN MEMBERSHIP · 30-DAY TRIAL</span>
              <div className="trial-price">$0 <span>today</span></div>
              <p>
                Then <strong>$49/month</strong>, billed monthly.<br />Cancel before the trial ends to avoid a charge.
              </p>
              <div className="signup-includes">
                <b>Your trial includes</b>
                <span>September 16 summit access + DMN membership</span>
                <small>Expert Hotline · resource kits &amp; templates · directories &amp; member offers</small>
              </div>
              <div className="divider" />

              {clientSecret && stripePromise ? (
                <>
                  <h3 id="pay-head">Complete your free trial</h3>
                  <p className="pay-head">
                    {form.email} · $0 today, then $49/month after 30 days.{" "}
                    <button type="button" onClick={() => setClientSecret(null)}>Edit details</button>
                  </p>
                  <div className="stripe-wrap">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                </>
              ) : memberDone ? (
                <div className="success-card">
                  <span className="tick">✓</span>
                  <h3>You&apos;re registered</h3>
                  <p>
                    {memberDone === "zoom_registered"
                      ? "Zoom has already emailed your personal join link. See you on September 16."
                      : "We're registering you for September 16 now. Zoom will email your personal join link within a few minutes."}
                  </p>
                  <Link className="button primary" href="/dashboard" style={{ width: "100%" }}>Back to my portal ↗</Link>
                </div>
              ) : memberPath ? (
                <>
                  <h3>Register for the summit</h3>
                  <div className="member-card">
                    <b>Signed in as {form.email}</b>
                    Your DMN membership already includes summit access. No checkout needed, just confirm a few details for Zoom.
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
                      {submitting ? "Registering…" : "Register me for September 16"} <span aria-hidden="true">↗</span>
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
                        I agree to the <Link href="/agreement/member" target="_blank" rel="noopener">Member Agreement</Link> and to recurring billing of $49/month after my 30-day trial unless I cancel first.
                      </span>
                    </label>
                    {error && (
                      <div className="form-error">
                        {error}{" "}
                        {alreadyMember && (
                          <Link href="/member/login?next=%2Fsummit">Sign in to register →</Link>
                        )}
                      </div>
                    )}
                    <button className="button primary" type="submit" disabled={!canSubmit || submitting}>
                      {submitting ? "One moment…" : "Continue to free trial"} <span aria-hidden="true">↗</span>
                    </button>
                  </form>
                  <p className="form-note">Card required at checkout. Your billing date and recurring terms will be shown before you confirm.</p>
                  {!me?.signedIn && (
                    <Link className="text-link existing" href="/member/login?next=%2Fsummit">Already a DMN member? Sign in to register</Link>
                  )}
                  {me?.signedIn && !me.paid && (
                    <p className="form-note" style={{ textAlign: "center" }}>You&apos;re signed in, but your membership isn&apos;t active yet. Start the trial above to register.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="membership-section" id="membership" aria-labelledby="membership-title">
          <div className="container">
            <div className="membership-heading">
              <div>
                <span className="eyebrow">YOUR DENTAL MEMBER NETWORK MEMBERSHIP</span>
                <h2 id="membership-title">
                  The summit starts the conversation.<br /><em>DMN helps you keep going.</em>
                </h2>
              </div>
              <p>Dental Member Network brings practice support, expert resources and trusted connections together. Use your 30-day trial to explore what helps your practice—starting with this summit.</p>
            </div>
            <div className="benefit-grid">
              <article><span className="benefit-label">01 / ASK</span><h3>A real practice question. <br />A human response.</h3><p>Bring a clinical, financial, team or operational question to the Expert Hotline. Get a written response within 2–3 business days.</p></article>
              <article><span className="benefit-label">02 / PUT INTO PRACTICE</span><h3>Expert knowledge you <br />can work with.</h3><p>Explore a growing library of expert kits, practical tools and templates, with resources such as checklists, worksheets and action guides.</p></article>
              <article><span className="benefit-label">03 / FIND SUPPORT</span><h3>Find the right expertise <br />for your next step.</h3><p>Browse the curated expert directory and vetted company directory when you need to find specialist support for your practice.</p></article>
              <article><span className="benefit-label">04 / EXPLORE</span><h3>Member offers, <br />in one place.</h3><p>Explore confirmed member offers alongside the people, resources and companies in DMN. Individual offer terms apply.</p></article>
            </div>
            <div className="library-preview">
              <div className="library-heading">
                <div>
                  <span className="eyebrow">A LOOK INSIDE THE RESOURCE LIBRARY</span>
                  <h3>Start with a challenge your practice knows.</h3>
                </div>
                <p>A few of the expert kits to explore.</p>
              </div>
              <div className="kit-grid">
                <article><Image src="/rida/kit-huddle.jpg" width={360} height={360} alt="Successful Morning Huddle expert kit cover" /><div><span>TEAM ROUTINES</span><h4>Successful Morning Huddle</h4><p>Callie Ward</p></div></article>
                <article><Image src="/rida/kit-numbers.jpg" width={360} height={360} alt="Know Your Real Numbers expert kit cover" /><div><span>PRACTICE FINANCES</span><h4>Know Your Real Numbers</h4><p>Laura Phillips, E.A.</p></div></article>
                <article><Image src="/rida/kit-process.jpg" width={360} height={360} alt="The Process Comes First expert kit cover" /><div><span>PRACTICE SYSTEMS</span><h4>The Process Comes First</h4><p>DeVon Banks</p></div></article>
              </div>
            </div>
            <div className="membership-close">
              <p>
                <b>One summit. A full month to explore DMN.</b>
                <span>After your trial, continue using DMN’s support and resources for $49/month unless cancelled.</span>
              </p>
              <a className="cta" href="#join">Explore DMN with a free trial ↗</a>
            </div>
          </div>
        </section>

        <section className="c-program section container" id="program">
          <div className="heading-row">
            <div>
              <span className="eyebrow">WHAT YOU’LL EXPLORE</span>
              <h2>One evening.<br />Two parts of a stronger practice.</h2>
            </div>
            <p>The Dental Practice Team Performance<br />&amp; Patient Retention System</p>
          </div>
          <div className="program-grid">
            <article>
              <span className="chapter">01 / PANEL</span>
              <h3>The Acceptance<br />Architecture</h3>
              <p>Help patients move from a treatment plan to a confident decision.</p>
              <ul>
                <li>Treatment conversations and case acceptance</li>
                <li>PPO negotiation and practice margins</li>
                <li>72-hour follow-up and AI front-desk workflows</li>
              </ul>
              <div className="byline">Dr. Ekta Pandya · Benjamin Tuinei<br />Kiera Dent · Lester De Alwis</div>
            </article>
            <article>
              <span className="chapter">02 / PANEL</span>
              <h3>Culture Is<br />Your Moat</h3>
              <p>Put people and systems together for a more consistent practice.</p>
              <ul>
                <li>Leadership and everyday accountability</li>
                <li>Team performance and patient retention</li>
                <li>Practical operating systems</li>
              </ul>
              <div className="byline">Maria Jackson · Francesca Ortepi<br />Kevin Wheeler</div>
            </article>
          </div>
          <p className="ce-disclosure">
            <b>CE provider:</b> Thriving Dentist Inc., an AGD PACE-approved program provider. The 2 CE credits are subject to the provider’s attendance and completion requirements.
          </p>
        </section>

        <section className="c-next">
          <div className="container">
            <span className="eyebrow">AFTER YOU SIGN UP</span>
            <div className="c-steps">
              <article><span>01</span><h3>Activate your trial</h3><p>Enter your card securely at checkout. Your trial starts at $0.</p></article>
              <article><span>02</span><h3>Receive event access</h3><p>Get confirmation and your personal Zoom access details by email.</p></article>
              <article><span>03</span><h3>Use your 30 days</h3><p>Join the summit and explore DMN’s expert kits, tools and Expert Hotline.</p></article>
            </div>
            <a className="cta" href="#join">Start my free trial ↗</a>
            <p className="offer-terms">
              <strong>$0 today.</strong> 30-day DMN trial. Then $49/month.<br />Card required. Cancel before the trial ends to avoid a charge.
            </p>
          </div>
        </section>

        <section className="faq section container">
          <div>
            <span className="eyebrow">A FEW USEFUL ANSWERS</span>
            <h2>Before you join.</h2>
          </div>
          <div>
            <details><summary>What does DMN membership include?</summary><p>Alongside access to this summit, your trial includes the Expert Hotline, a growing expert resource-kit library, practical tools and templates, curated expert and company directories, and confirmed member offers. These ongoing membership benefits continue while your subscription stays active.</p></details>
            <details><summary>What happens after the 30 days?</summary><p>Your DMN trial is $0 for 30 days, then $49/month unless cancelled before the trial ends. A card is required at checkout. Your exact first billing date is shown before you confirm, and you can cancel from your member portal at any time.</p></details>
            <details><summary>How do I get my summit access?</summary><p>Once your trial is active we register you for the live session and Zoom emails your personal join link, usually within a few minutes. The link is unique to you, so please don’t forward it.</p></details>
            <details><summary>What do I need to do for CE credit?</summary><p>Attend the qualifying session and complete the CE provider’s required attendance verification and evaluation. Registration alone does not earn credit.</p></details>
            <details><summary>I’m already a DMN member. Do I pay again?</summary><p>No. Sign in with your member email and we register you for the summit at no charge. Your existing membership is not changed.</p></details>
            <details><summary>Is this event exclusive to DMN?</summary><p>No. This campaign offers a DMN trial with summit access. The event is also promoted through the event team’s own channels.</p></details>
          </div>
        </section>
      </main>

      <footer className="event-footer container">
        <Image src="/rida/dmn-logo.png" alt="Dental Member Network" width={160} height={52} />
        <p>September 16, 2026 · DMN × RIDA</p>
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
