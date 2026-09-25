-- 0068: per-partner price plan on the vendors row.
--
-- Background. The partner ladder ($0 months 1-6, $49 months 7-12, $199 from
-- month 13) was switched off on 2026-09-15 and the agreement text on the
-- site was changed to "$49 from month 7, locked" (shipped 2026-09-22).
-- Apex Payment Solutions applied through the public form on 2026-09-16,
-- while production still showed the ladder wording, so the agreement
-- they accepted (v1.0) carries the $199 phase. Founding invites already
-- have a per-invite pricing_plan (0066); this brings the same switch to
-- self-serve partners so one row can stay on the terms it signed while
-- everyone else keeps the flat $49.
--
--   flat_49  (default)  $0 months 1-6, $49 from month 7, no increase.
--   ladder              $0 months 1-6, $49 months 7-12, $199 from month 13.
--
-- Read by: /api/vendor/billing/trial/start (builds a phased Stripe
-- subscription schedule for "ladder"), the partner portal account and
-- agreement pages, the agreement PDF and the join-confirmation email.

alter table public.vendors
  add column if not exists pricing_plan text not null default 'flat_49'
  check (pricing_plan in ('flat_49', 'ladder'));

comment on column public.vendors.pricing_plan is
  'flat_49 = $49 from month 7 with no increase; ladder = $49 months 7-12 then $199 from month 13 (only partners who accepted the ladder wording).';

-- Apex Payment Solutions: accepted v1.0 with the ladder on 2026-09-16.
update public.vendors
   set pricing_plan = 'ladder'
 where id = '222933bc-b3b6-4bc0-8a3e-d275b9e67546'
   and company_name = 'Apex Payment Solutions';
