-- 0071: quarterly partner price plans (Lester, 5 Oct 2026).
--
-- Two more values on the same per-invite / per-vendor switch that 0066
-- and 0068 added. Nothing about existing rows changes: their value and
-- the default stay as they are.
--
--   flat_49        $0 months 1-6, $49 a month from month 7.         (existing)
--   ladder         $0 months 1-6, $49 months 7-12, $199 a month.    (existing)
--   quarterly_49   $0 months 1-6, $49 every three months from month 7.
--   quarterly_149  $0 months 1-6, $49 every three months for months 7-12,
--                  then $149 every three months from month 13.
--
-- Read by: the admin invite dialog, /api/admin/founding-invite,
-- /api/founding/[code]/accept (Stripe schedule), /api/vendor/billing/trial/start,
-- the agreement PDF, the sign-up page, the partner billing page and the
-- confirmation email. The quarterly plans need two Stripe prices:
-- STRIPE_PRICE_PARTNER_GROWTH_QUARTERLY ($49 / 3 months) and
-- STRIPE_PRICE_PARTNER_STANDARD_QUARTERLY ($149 / 3 months).

alter table public.founding_invites
  drop constraint if exists founding_invites_pricing_plan_check;
alter table public.founding_invites
  add constraint founding_invites_pricing_plan_check
  check (pricing_plan in ('ladder', 'flat_49', 'quarterly_49', 'quarterly_149'));

alter table public.vendors
  drop constraint if exists vendors_pricing_plan_check;
alter table public.vendors
  add constraint vendors_pricing_plan_check
  check (pricing_plan in ('flat_49', 'ladder', 'quarterly_49', 'quarterly_149'));

comment on column public.founding_invites.pricing_plan is
  'flat_49 = $49/month from month 7; ladder = $49 then $199/month from month 13; quarterly_49 = $49 every 3 months from month 7; quarterly_149 = $49 then $149 every 3 months from month 13.';
comment on column public.vendors.pricing_plan is
  'flat_49 = $49/month from month 7; ladder = $49 then $199/month from month 13; quarterly_49 = $49 every 3 months from month 7; quarterly_149 = $49 then $149 every 3 months from month 13.';
