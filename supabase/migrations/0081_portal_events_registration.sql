-- 0081_portal_events_registration.sql
--
-- Portal events, part 2 (Rushdha, 5 Nov 2026):
--   * event_key — the key of the matching row in the "Events Config" tab of
--     the DMN x RIDA registrants spreadsheet. With a key, a member's
--     Register goes: portal → Apps Script on that sheet → the event's tab
--     ("DMS - Events" / "TD - Events") → n8n → Zoom (Marketing or Naren's
--     account, from the config row). The RIDA summit keeps its own path.
--   * speakers may now carry "photo_url" (shown instead of initials; DMN
--     experts use their profile headshot automatically). No schema change
--     for that: speakers is jsonb.
--
-- Safe to re-run.

alter table public.portal_events add column if not exists event_key text;
create unique index if not exists portal_events_event_key_uidx on public.portal_events (event_key) where event_key is not null;

-- The summit registers through its own chain, not a link.
update public.portal_events set register_url = null where slug = 'rida-annual-summit-2026-11-06' and register_url = '/rida/join';
