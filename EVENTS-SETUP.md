# Portal Events: setup, registration chain and the switch

Built 5 Nov 2026 from Lester's design pick (F and G, one page with List | Month,
plus the event page D and the phone view E). Registration flow per Rushdha,
5 Nov 2026.

## Hidden until you say

Nothing under Events is visible to members until `NEXT_PUBLIC_EVENTS_ENABLED`
is `true` in Vercel. While it is unset or `false`:

- the sidebar shows the old "Event Replays" link, not "Events";
- the Overview card does not render;
- `/api/member/events` answers 404 for members, so the pages show
  "Events are not open yet." Admin sessions still get the data, so you can
  check the pages on the live site before switching it on.

Locally `.env.local` has it on, so you can test.

## What was built

| Where | What |
|---|---|
| `/dashboard/events` | Next event spotlight with countdown, Register and Add to calendar; "Coming up" as List or Month (List only on phones); "Missed one? Watch the replay"; a Replays tab. |
| `/dashboard/events/<slug>` | One event: banner, about, speakers with photos (DMN experts link to their profile), countdown, Eastern time plus the member's own, Register, Google / Outlook / Apple calendar. After the event the page turns into the replay. |
| Overview page | "Your next event" card under the metric strip. |
| Sidebar | "Events" with a NEW tag until 15 Dec 2026 (replaces the Event Replays link; replay pages still open from Events). |
| `/admin/events` | Add, edit, hide or delete events. |
| `POST /api/events/sync` | Optional n8n hand-off from a DMN events sheet (bearer `EVENTS_SYNC_SECRET`). |
| `/api/member/events/<slug>/register` | In-portal registration. |

Data: `portal_events` table, migrations `0080_portal_events.sql` and
`0081_portal_events_registration.sql`. The seed holds the two real events
(RIDA Annual Summit 6 Nov, RIDA Live 16 Sep replay). Nothing is readable by
the anon key.

## How a member registers

Members never leave the portal. Register opens a small form with their name,
email, phone and practice already filled from their member record. They can
change the email (where Zoom sends the join link), confirm phone and practice,
answer the event's questions, click Register and see "You're registered. Zoom
is emailing your join link." Whatever email they use, the seat is recorded
under their membership: `member_id` and `member_email` (the account email)
go on the registration row and on the sheet row, so you always know which
member booked. Each member can hold one seat per event.

Two chains, both on the **DMN x RIDA Zoom Registrants** spreadsheet and its
Apps Script:

| Event | Questions asked | Where the row goes | Who registers in Zoom |
|---|---|---|---|
| RIDA summit | phone, practice website and name, role, country, optional question | tab **Registrants** (unchanged) | the existing "DMN x RIDA Summit" n8n workflow, Naren's account |
| Any event with an **event key** | phone, role, practice name and website, country (incl. Australia), a question (required), and on DMS webinars "Would you like to become a DMS member?" | the tab named in **Events Config** (e.g. "DMS - Events", "TD - Events") | the new "DMN - Events - Zoom registrations" n8n workflow (webhook-triggered, Marketing Zoom account only) |

The two chains share nothing: RIDA is a sheet trigger with a fixed webinar id on Naren's account; events are a webhook call with the webinar id from Events Config on the Marketing account.

An event with no event key falls back to its registration link (new tab).

## One-time steps, in order

1. **Supabase**: run `0080_portal_events.sql` (if not yet) then
   `0081_portal_events_registration.sql`.
2. **Registrants spreadsheet**: add a tab called `Events Config` with these
   headers in row 1:

   | event_key | sheet_name | webinar_id | zoom_account | event_title | event_date | active |
   |---|---|---|---|---|---|---|
   | dms-2026-11-10 | DMS - Events | 83448917659 | CREATE IN MARKETING ZOOM | The Leaky Funnel | 2026-11-10 | TRUE |
   | td-2026-11-17 | TD - Events | 86560075938 | CREATE IN MARKETING ZOOM | The Independent Dental Practice | 2026-11-17 | TRUE |
   | td-2026-12-08 | TD - Events | 85814600160 | CREATE IN MARKETING ZOOM | Three Decisions to Make in January (Not March) | 2026-12-08 | TRUE |
   | dms-2026-12-10 | DMS - Events | 89903175011 | CREATE IN MARKETING ZOOM | Attract the Right Patients | 2026-12-10 | TRUE |

   Webinar ids without spaces. `zoom_account` is informational; the events
   workflow always uses the Marketing Zoom account. If you keep a RIDA row in
   this tab for reference, set its `active` to FALSE (the script also refuses
   to write event rows into the Registrants tab). The event tabs ("DMS - Events", "TD - Events")
   are created by the script on first use with these columns: timestamp,
   event_key, first_name, last_name, email, phone, job_title, practice_name,
   country, questions, member_interest, source_id, source_name, webinar_id,
   zoom_account, zoom_status, zoom_registrant_id, zoom_error,
   registration_id, member_id, member_email. You do not need to make them.
3. **Apps Script** on that sheet: paste the updated
   `DMN-Summit-Registrants-AppsScript.gs`, set `EVENTS_N8N_WEBHOOK` (step 4),
   then Deploy → Manage deployments → edit → New version. The `/exec` URL
   stays the same, so nothing changes in Vercel. The summit path in the
   script is untouched.
4. **n8n**: import `n8n/DMN-Events-Zoom-Registration.json` as a NEW
   workflow (do not edit the RIDA one). On the Google Sheets node replace
   `REPLACE_WITH_DMN_REGISTRANTS_SHEET_ID` with the spreadsheet id; the
   Marketing Zoom credential is pre-selected. Activate, copy the production
   webhook URL into the Apps Script (step 3).
5. **Portal**: the four Nov/Dec events are already loaded by
   `scripts/load-portal-events-nov-dec-2026.mjs` (banners in
   `public/events/`). Run it once more after step 1 so their event keys are
   set (the column comes with 0081). Later events: `/admin/events` with the
   **event key** equal to the Events Config row. Deploy.
6. **Switch on** when ready: `NEXT_PUBLIC_EVENTS_ENABLED=true` in Vercel and
   redeploy.

## Zoom questions on the webinars

Nothing to configure. Before registering, the events workflow reads the
webinar's own registration questions from Zoom and answers each one by its
title: mobile/phone → phone, job title → role, practice → practice name and
website, country → the matching radio answer ("US", "U.S.", "U.S " all
work), member → the membership answer, question/panel → the member's
question. Trailing spaces and wording differences between webinars do not
matter. A required question it cannot recognise gets "-" (or the last radio
answer), so Zoom never rejects a registration for a missing answer. If the
Zoom standard field `job_title` is required (the 8 Dec webinar), it is sent
too.

The four webinars (all Marketing Zoom):

| Event | Zoom id | ET | Asks |
|---|---|---|---|
| The Leaky Funnel (DMS) | 834 4891 7659 | Tue 10 Nov, 8:00 PM | mobile, job title, practice, country, panel question, DMS membership |
| The Independent Dental Practice (TD) | 865 6007 5938 | Tue 17 Nov, 7:00 PM | mobile, job title, practice, country, question |
| Three Decisions to Make in January (TD) | 858 1460 0160 | Tue 8 Dec, 8:00 PM | mobile, practice, country, question + standard job title |
| Attract the Right Patients (DMS) | 899 0317 5011 | Thu 10 Dec, 9:00 PM | mobile, job title, practice, country, panel question, DMS membership |

## Sheet columns the optional events sync reads

One row per event; names matched loosely. Times are Eastern.

| Column | Required | Notes |
|---|---|---|
| Title | yes | |
| Subtitle (or Topic) | | |
| Series | | RIDA, DMS Live, Thriving Dentist, Insurance Untangled |
| Date | yes | `2026-11-18` |
| Time | yes | `12:00 PM` (Eastern) |
| Length | | minutes, default 60 |
| Format | | Live on Zoom, Live webinar, Virtual summit |
| CE | | number, blank for none |
| Speakers | | one per line: `Name, Title, Company, https://photo-link`. A DMN expert is matched by name and gets their profile photo and link. |
| Description | | two or three short paragraphs |
| Banner | | Drive link (shared as "Anyone with the link") or image URL |
| Event key | | the Events Config key; with it, members register in the portal |
| Register | | fallback link, used only when there is no event key |
| Replay | | after the event: YouTube or Vimeo plays inside the portal |
| Published | | blank or `yes` shows it; `no` hides it |

n8n: Google Sheets trigger → get rows → HTTP POST to
`https://www.dentalmembernetwork.com/api/events/sync` with header
`Authorization: Bearer <EVENTS_SYNC_SECRET>` and body `{ "events": <rows> }`.
Never deletes; `Published = no` hides an event.
