-- 0073: RIDA sign-up form, two more questions (Amani via Lester, 13 Oct 2026).
--
-- job_title: one of four tap buttons on the form
--   practice_owner | office_manager | team_member | other
-- country already exists (ISO 3166-1 alpha-2) and is now filled from the
-- form's country dropdown, pre-selected from the visitor's location.
--
-- Both are saved with the lead the moment name and email are entered, and
-- appear in the registrants sheet and the admin exports.

alter table public.event_registrations
  add column if not exists job_title text
  check (job_title is null or job_title in ('practice_owner', 'office_manager', 'team_member', 'other'));

comment on column public.event_registrations.job_title is
  'From the sign-up form: practice_owner | office_manager | team_member | other.';
