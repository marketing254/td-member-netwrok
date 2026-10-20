-- 0074: editable referral links (admin console, Oct 2026).
--
-- Admins can now rename a referral link (the vanity handle in
-- dentalmembernetwork.com/<handle>). Old handles are often printed on
-- launch kits, posters and QR codes, so they must keep working: every
-- handle a row has had before is kept in slug_aliases and still redirects
-- to the same referral code. Attribution is unaffected either way, because
-- sign-ups are stamped with the referral CODE, not the handle.

alter table public.referral_codes
  add column if not exists slug_aliases text[] not null default '{}';

create index if not exists referral_codes_slug_aliases_idx
  on public.referral_codes using gin (slug_aliases);

comment on column public.referral_codes.slug_aliases is
  'Previous vanity handles for this code. Still redirect to it after an admin renames the link.';
