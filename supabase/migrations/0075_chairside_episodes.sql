-- 0075: Chairside episodes in the member library (Lester, Oct 2026).
--
-- Chairside is the DMN podcast. Each episode is listed in the member
-- library next to the Practice Playbooks: one topic_slug, with the full
-- episode video (members only), its captions, the audio-only file and
-- "The Monday page" PDF. The public website only ever shows the short
-- YouTube cut, so the full hour lives here like a playbook training video.
--
-- 1) kit_type gains 'chairside' so the library grid can give the card a
--    gold CHAIRSIDE tag and the episode page its own layout.
-- 2) episode_payload holds what a playbook row does not need:
--      { episode: 1, guest: { name, role }, host, minutes,
--        chapters: [{ time: "0:00", label: "Cold open" }, ...],
--        captions_url: "https://.../captions.vtt" | null }
-- 3) resource_kind gains 'captions' (the .vtt track for the player).
--    'audio' already exists from 0011.

alter table public.resources
  drop constraint if exists resources_kit_type_check;

alter table public.resources
  add constraint resources_kit_type_check
  check (kit_type in ('standard', 'book_club', 'chairside'));

alter table public.resources
  add column if not exists episode_payload jsonb;

comment on column public.resources.episode_payload is
  'Chairside only: episode number, guest, host, minutes, chapters and the captions URL for the player.';

-- ALTER TYPE ... ADD VALUE must run outside a transaction. Supabase
-- Studio's SQL Editor runs each statement individually, so this is fine.
alter type resource_kind add value if not exists 'captions';

notify pgrst, 'reload schema';
