-- 0076: expert introductions opt-in on the member join form (Lester, Oct 2026).
--
-- Members can ask the team to introduce them to experts who can help with
-- the thing they joined for (the "biggest challenge" they picked on the
-- form). The team sends the introductions by hand; the site only records
-- the answer and reports it. Unticked by default, and the box itself stays
-- off the live form until NEXT_PUBLIC_EXPERT_INTROS_ENABLED=true (after the
-- privacy wording is live).
--
--   expert_intro_opt_in       yes / no (default no)
--   expert_intro_opt_in_at    when they last switched it on
--   expert_intro_help_area    the help area they picked (biggest_challenge at the time)
--   expert_intro_notified_at  when the daily report to Lester included them
--                             (null = still to be reported)

alter table public.members
  add column if not exists expert_intro_opt_in boolean not null default false,
  add column if not exists expert_intro_opt_in_at timestamptz,
  add column if not exists expert_intro_help_area text,
  add column if not exists expert_intro_notified_at timestamptz;

create index if not exists members_expert_intro_opt_in_idx
  on public.members (expert_intro_opt_in_at)
  where expert_intro_opt_in = true;

comment on column public.members.expert_intro_opt_in is
  'Member asked to be introduced to experts who can help with their chosen help area. Default false.';
comment on column public.members.expert_intro_opt_in_at is
  'When the member last switched expert introductions on.';
comment on column public.members.expert_intro_help_area is
  'The help area (biggest_challenge) the member picked when they opted in.';
comment on column public.members.expert_intro_notified_at is
  'When the daily expert-introductions report included this member. Null until reported.';

notify pgrst, 'reload schema';
