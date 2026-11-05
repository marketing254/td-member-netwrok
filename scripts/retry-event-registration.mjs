#!/usr/bin/env node
/**
 * retry-event-registration.mjs — push an entitled portal-event registration
 * to the registrants sheet again (after fixing the sheet / Apps Script).
 * Safe to repeat: the sheet skips rows it already has and only re-calls n8n
 * for rows still Pending.
 *
 * From landing/:  node scripts/retry-event-registration.mjs <registration id> [...more ids]
 *                 node scripts/retry-event-registration.mjs --all-failed
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const landing = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(landing, ".env.local"), quiet: true });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const url = process.env.SUMMIT_SHEET_WEBHOOK_URL;
const secret = process.env.SUMMIT_SHEET_SECRET;
if (!url || !secret) { console.error("SUMMIT_SHEET_WEBHOOK_URL / SUMMIT_SHEET_SECRET missing in .env.local"); process.exit(1); }

const JOB = { practice_owner: "Practice owner or dentist", office_manager: "Office manager", team_member: "Team member", other: "Other" };
const args = process.argv.slice(2);
let ids = args.filter((a) => !a.startsWith("--"));
if (args.includes("--all-failed")) {
  const { data } = await sb.from("event_registrations").select("id").eq("status", "entitled").is("sheet_synced_at", null).not("zoom_error", "is", null);
  ids = (data ?? []).map((r) => r.id);
}
if (!ids.length) { console.log("nothing to retry"); process.exit(0); }

for (const id of ids) {
  const { data: reg } = await sb.from("event_registrations").select("*").eq("id", id).maybeSingle();
  if (!reg) { console.log(id, "not found"); continue; }
  const { data: ev } = await sb.from("portal_events").select("event_key").eq("slug", reg.event_id).maybeSingle();
  if (!ev?.event_key) { console.log(id, "no event_key for", reg.event_id, "(RIDA rows are not retried here)"); continue; }
  const row = {
    event_key: ev.event_key, registration_id: reg.id, member_id: reg.member_id ?? "", member_email: reg.utm?.member_email ?? "",
    first_name: reg.first_name, last_name: reg.last_name, email: reg.email, phone: reg.phone ?? "",
    job_title: JOB[reg.job_title] ?? "", practice_name: reg.practice_website_name ?? "", country: reg.country ?? "",
    questions: reg.speaker_question ?? "", member_interest: reg.rida_member_interest ?? "", source_id: "", source_name: "DMN Member Portal",
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "event_registration", secret, row }), redirect: "follow" });
  const text = (await res.text()).trim();
  const ok = res.ok && /^ok/i.test(text);
  console.log(id, reg.email, "→", res.status, text.slice(0, 160));
  if (ok) {
    const now = new Date().toISOString();
    await sb.from("event_registrations").update({ status: "zoom_requested", sheet_synced_at: now, zoom_requested_at: now, zoom_error: null }).eq("id", id);
  }
}
