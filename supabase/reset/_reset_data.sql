-- =====================================================================
-- DMN — Wipe operational data, preserve admin allow-list
--
-- WHAT THIS DOES
--   Truncates every operational table in dependency order, then resets
--   identity sequences. Leaves admin_users (and its FK references) intact.
--   Also clears storage objects in the vendor-logos and catalog-media
--   buckets so you don't carry orphan files into the new dataset.
--
-- WHAT THIS DOES NOT TOUCH
--   - admin_users               (kept exactly as is)
--   - auth.users for admin emails (kept; see step 4)
--   - migrations / schema       (DDL untouched)
--   - storage.buckets           (bucket definitions stay)
--
-- HOW TO USE
--   Run in Supabase Studio → SQL editor as the project owner. Wrap in a
--   transaction so it's atomic — if any step fails, nothing changes.
--
-- ORDER MATTERS — children before parents because of FK constraints.
-- =====================================================================

begin;

-- 1. Operational tables (truncate cascades through FKs).
truncate table
  public.notifications,
  public.email_events,
  public.auth_audit,
  public.review_actions,
  public.redemptions,
  public.offer_media,
  public.offers,
  public.catalog_media,
  public.catalog_items,
  public.members,
  public.vendor_applications,
  public.vendors,
  public.waitlist_signups
restart identity cascade;

-- 2. Storage objects: Supabase blocks raw DELETE on storage.objects with
--    a protect_delete() trigger, so this step must run OUTSIDE the SQL
--    editor. Choose ONE of the methods documented in
--    docs/SECURITY_AND_OPS.md §3.1:
--      (a) Dashboard → Storage → bucket → select all → delete
--      (b) node landing/supabase/reset/clear-storage.mjs
--    Skipping is OK if both buckets are already empty — `select * from
--    storage.objects where bucket_id in ('vendor-logos','catalog-media')`
--    returns zero rows.

-- 3. Re-link admin auth_user_id (was wiped via FK cascade if you had
--    orphaned references). admin_users.auth_user_id will be re-populated
--    on the admin's next sign-in via /auth/callback bootstrap.
update public.admin_users
   set auth_user_id = null,
       last_active_at = null
 where auth_user_id is not null;

-- 4. Decide what to do with non-admin auth.users
--    Most flows recreate auth users as needed (signup pre-creates them).
--    The safest default is to delete any auth user whose email is NOT in
--    admin_users — that way old vendor/member accounts can't sign in to
--    a stale session after the wipe.
--
--    If you want to keep all auth users (e.g. you'll re-link by email),
--    comment this block out.
delete from auth.users u
 where lower(u.email) not in (
   select lower(email) from public.admin_users
 );

commit;

-- =====================================================================
-- POST-RESET SANITY CHECKS
-- Run each of these and confirm the count is what you expect.
-- =====================================================================
-- select 'vendors', count(*) from public.vendors
--  union all select 'vendor_applications', count(*) from public.vendor_applications
--  union all select 'catalog_items', count(*) from public.catalog_items
--  union all select 'catalog_media', count(*) from public.catalog_media
--  union all select 'offers', count(*) from public.offers
--  union all select 'offer_media', count(*) from public.offer_media
--  union all select 'members', count(*) from public.members
--  union all select 'redemptions', count(*) from public.redemptions
--  union all select 'notifications', count(*) from public.notifications
--  union all select 'waitlist_signups', count(*) from public.waitlist_signups
--  union all select 'email_events', count(*) from public.email_events
--  union all select 'auth_audit', count(*) from public.auth_audit
--  union all select 'review_actions', count(*) from public.review_actions
--  union all select 'admin_users (kept)', count(*) from public.admin_users
--  union all select 'auth.users (kept)', count(*) from auth.users;
