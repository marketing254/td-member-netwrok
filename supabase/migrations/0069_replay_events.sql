-- 0069: replay_events, the counters for the public replay page.
--
-- The RIDA replay brief (29 Sep 2026) asks for "a play count and the
-- number of clicks on the button, visible in the admin console". GA4
-- already receives the same events; this table is what the admin
-- dashboard reads so nobody needs a GA login to see the two numbers.
--
-- One row per event. No personal data: the IP is salted-hashed only to
-- make the "unique viewers" figure honest, and the user agent is kept
-- short. Written by the public POST /api/replay/event through the
-- service role; nobody reads it except admins through the API.

create table if not exists public.replay_events (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  kind         text not null check (kind in ('view', 'play', 'clip_play', 'cta_click', 'chapter_jump')),
  utm_source   text,
  utm_campaign text,
  extra        jsonb,
  ip_hash      text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index if not exists replay_events_slug_kind_idx on public.replay_events (slug, kind, created_at desc);

alter table public.replay_events enable row level security;
revoke all on public.replay_events from anon, authenticated;

comment on table public.replay_events is 'Public replay page counters (views, plays, clip plays, join-button clicks). Service role only.';
