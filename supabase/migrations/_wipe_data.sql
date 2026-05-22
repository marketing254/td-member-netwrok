-- =====================================================================
-- DMN — DESTRUCTIVE DATA WIPE
-- Use to reset all app data to empty state. Does NOT drop tables —
-- schema stays intact. Does NOT touch auth.users (do that separately
-- via the Dashboard).
--
-- Safe to re-run. Idempotent. RLS does NOT block truncate via service
-- role / SQL Editor (postgres role bypasses everything).
--
-- Filename starts with underscore so this file is never auto-picked-up
-- as a numbered migration — it's a manual tool only.
-- =====================================================================

-- Order matters because of FK constraints. TRUNCATE ... CASCADE handles
-- any forward references but we still list children-first for clarity.

truncate table public.email_events       restart identity cascade;
truncate table public.auth_audit         restart identity cascade;
truncate table public.review_actions     restart identity cascade;
truncate table public.redemptions        restart identity cascade;
truncate table public.offer_media        restart identity cascade;
truncate table public.offers             restart identity cascade;
truncate table public.catalog_media      restart identity cascade;
truncate table public.catalog_items      restart identity cascade;
truncate table public.members            restart identity cascade;
truncate table public.vendor_applications restart identity cascade;
truncate table public.vendors            restart identity cascade;
truncate table public.waitlist_signups   restart identity cascade;

-- DON'T wipe admin_users unless you want to re-seed it (0005_admin_seed.sql)
-- truncate table public.admin_users restart identity cascade;

-- Sanity check — every row count should be 0 below
select 'waitlist_signups'    as table_name, count(*) as rows from public.waitlist_signups
union all select 'vendor_applications', count(*) from public.vendor_applications
union all select 'vendors',              count(*) from public.vendors
union all select 'catalog_items',        count(*) from public.catalog_items
union all select 'catalog_media',        count(*) from public.catalog_media
union all select 'offers',               count(*) from public.offers
union all select 'offer_media',          count(*) from public.offer_media
union all select 'members',              count(*) from public.members
union all select 'redemptions',          count(*) from public.redemptions
union all select 'review_actions',       count(*) from public.review_actions
union all select 'auth_audit',           count(*) from public.auth_audit
union all select 'email_events',         count(*) from public.email_events
union all select 'admin_users (kept)',   count(*) from public.admin_users
order by table_name;
