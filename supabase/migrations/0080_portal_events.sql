-- 0080_portal_events.sql
--
-- Events inside the member portal (Lester's design pick, 5 Nov 2026:
-- spotlight + List | Month views, event page, "Your next event" card).
--
-- One row per event. The team fills rows from the DMN events sheet, either
-- by hand in the admin console (/admin/events) or automatically through
-- n8n, which posts the sheet rows to /api/events/sync. Replays: after the
-- event ends it moves to "Replays" on its own; the team adds the replay
-- link afterwards (replay_url, or replay_slug for a replay that already
-- lives at /dashboard/replays/<slug>).
--
-- Nothing here is readable by any client role: every read goes through
-- the service-role API routes (/api/member/events, /api/admin/events).
--
-- Safe to re-run.

create table if not exists public.portal_events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  -- rida | dms_live | thriving_dentist | insurance_untangled | other
  series            text not null default 'other',
  starts_at         timestamptz not null,
  duration_minutes  integer not null default 60 check (duration_minutes > 0),
  -- free text from the sheet: "Live on Zoom", "Live webinar", "Virtual summit"
  format            text,
  ce_credits        numeric(4,1) check (ce_credits is null or ce_credits >= 0),
  -- [{ "name": "", "title": "", "company": "", "expert_id": null }]
  speakers          jsonb not null default '[]'::jsonb,
  description       text,
  banner_url        text,
  register_url      text,
  zoom_webinar_id   text,
  replay_url        text,
  replay_slug       text,
  replay_runtime    text,
  is_published      boolean not null default true,
  -- admin | sheet (n8n)
  source            text not null default 'admin',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists portal_events_starts_at_idx on public.portal_events (starts_at);

create or replace function public.portal_events_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists portal_events_touch on public.portal_events;
create trigger portal_events_touch
  before update on public.portal_events
  for each row execute function public.portal_events_set_updated_at();

-- Service role only (same posture as event_registrations).
alter table public.portal_events enable row level security;
revoke all on public.portal_events from anon, authenticated;

-- ---------------------------------------------------------------- seed
-- The two real events (everything else in the mock was sample data).
insert into public.portal_events
  (slug, title, subtitle, series, starts_at, duration_minutes, format, ce_credits, speakers, description, banner_url, register_url, replay_slug, replay_runtime, source)
values
  (
    'rida-annual-summit-2026-11-06',
    'RIDA Annual Summit',
    'Built to Stay: The Independent Practice Operating System',
    'rida',
    '2026-11-06 12:00:00-05',
    270,
    'Live virtual summit',
    4,
    '[
      {"name":"DeVon Banks","title":"CEO","company":"D-TECH Billing & Claims"},
      {"name":"Kelly Fox Galvagni","title":"Founder","company":"Smile Potential"},
      {"name":"Ken Kaufman","title":"Founder","company":"Dental Finance Forum and AccruDent"},
      {"name":"Laura Phillips, E.A.","title":"Co-Founder","company":"The Phillips Group"},
      {"name":"Dr. Lorne Lavine","title":"Owner","company":"The Digital Dentist"},
      {"name":"Naren Arulrajah","title":"Founder & CEO","company":"Ekwa Marketing"},
      {"name":"Gary Takacs","title":"Founder","company":"The Thriving Dentist"},
      {"name":"Kristie Kapp, RDH","title":"CEO & Co-Founder","company":"EBITDent"},
      {"name":"Dr. Michael Sonick","title":"Periodontist and keynote speaker","company":""},
      {"name":"James DeLuca","title":"CEO","company":"Precision Dental Analytics"},
      {"name":"Dee Fischer","title":"Founder & CEO","company":"Fischer''s Professional Group"}
    ]'::jsonb,
    'A full afternoon on the independent practice operating system: the numbers, the team, the patient experience and the decisions that keep a practice independent.

Eleven experts, seven of them in this network, across four and a half hours live on Zoom. Four CE credits through RIDA.',
    '/replay/rida-annual-2026-11-06-banner.jpg',
    null,
    null,
    null,
    'admin'
  ),
  (
    'rida-live-2026-09-16',
    'Stop Losing Revenue You Already Earned',
    'The Dental Practice Team Performance and Patient Retention System',
    'rida',
    '2026-09-16 19:00:00-04',
    126,
    'Live on Zoom',
    null,
    '[
      {"name":"Kiera Dent","title":"CEO and Founder","company":"The Dental A Team"},
      {"name":"Ben Tuinei","title":"Founder and President","company":"Veritas Dental Resources"},
      {"name":"Dr. Ekta Pandya","title":"Dentist, DDS, Public Health and AI Advocate","company":""},
      {"name":"Maria Jackson","title":"CEO and Founder","company":"Dental AI Solutions"},
      {"name":"Francesca Ortepi","title":"Founder","company":"Dentech Direct, The Practice Operator"}
    ]'::jsonb,
    'RIDA Live, 16 September 2026. Five speakers on the revenue a practice has already earned and is still losing: fee schedules, team performance, patient retention and the systems that close the gap.',
    '/replay/rida-live-2026-09-16-banner.jpg',
    null,
    'rida-live-2026-09-16',
    '2 h 06 m',
    'admin'
  )
on conflict (slug) do nothing;
