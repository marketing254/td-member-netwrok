-- 0072: portal tour "seen" flag (Lester, 8 Oct 2026).
--
-- The first time an expert or partner signs in, the portal shows the tour
-- video pop-up once per account and stamps this when they close it. One
-- column per portal, so someone who is both sees each portal's guide the
-- first time they open that portal.
--
-- Additive and safe on live data. The portals read this column
-- best-effort: if it is missing they simply do not show the pop-up.

alter table public.experts add column if not exists tour_seen_at timestamptz;
alter table public.vendors add column if not exists tour_seen_at timestamptz;

comment on column public.experts.tour_seen_at is 'When the expert closed the portal tour pop-up for the first time. Null = not shown yet.';
comment on column public.vendors.tour_seen_at is 'When the partner closed the portal tour pop-up for the first time. Null = not shown yet.';
