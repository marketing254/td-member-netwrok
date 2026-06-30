-- =====================================================================
-- _pre_launch_cleanup.sql
--
-- PRE-LAUNCH RESET — clears all testing data while preserving:
--   1. ALL admin_users (you NEVER lose admin access)
--   2. Real published `resources` rows (the kits we just imported)
--   3. ONE designated test member, ONE test partner, ONE test expert
--      (set TEAM_TEST_* placeholders below before running)
--
-- ⚠️ DO NOT RUN ON A PRODUCTION DB WITHOUT FIRST TAKING A BACKUP.
--    Supabase: Project Settings → Database → Daily backups → Restore point.
--
-- Run order: paste the whole file into Supabase SQL Editor and execute.
-- The DO block at the top fixes the keep-list before anything is deleted.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 0. SET YOUR KEEP-LIST. Replace the three placeholders below with the
--    actual emails of the team's test accounts you want preserved.
--    All three are case-insensitive.
-- ─────────────────────────────────────────────────────────────────────
do $$
declare
  test_member_email  text := lower('rushdhaakbar82@gmail.com');
  test_partner_email text := lower('rushdha@ekwa.com');
  test_expert_email  text := lower('rushdhaakbar82@gmail.com');
begin
  create temporary table if not exists _keep_accounts (
    email text primary key
  ) on commit preserve rows;
  truncate table _keep_accounts;
  -- ON CONFLICT DO NOTHING so the same email used for two roles
  -- (e.g. member + expert sharing rushdhaakbar82@gmail.com) collapses
  -- to a single keep-list entry instead of throwing a PK violation.
  -- The members / experts / vendors tables themselves are independent,
  -- so one shared email still preserves all matching role rows.
  insert into _keep_accounts(email) values
    (test_member_email),
    (test_partner_email),
    (test_expert_email)
  on conflict (email) do nothing;
end$$;

-- ─────────────────────────────────────────────────────────────────────
-- 1. Resource analytics + UX state — none of this should survive into
--    production. Members start clean.
-- ─────────────────────────────────────────────────────────────────────
truncate table public.resource_feedback              cascade;
truncate table public.resource_views                 cascade;
truncate table public.resource_inquiry_replies       cascade;
truncate table public.resource_inquiries             cascade;
truncate table public.member_resource_progress       cascade;
truncate table public.member_assistant_messages      cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Network feed + chatbot — wipe expert posts, reactions, comments,
--    any conversation history. Experts post fresh after launch.
-- ─────────────────────────────────────────────────────────────────────
truncate table public.post_comments                  cascade;
truncate table public.post_reactions                 cascade;
truncate table public.expert_posts                   cascade;
truncate table public.chatbot_messages               cascade;
truncate table public.chatbot_conversations          cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Referral tracking — keep the codes table empty so first real
--    expert/partner sign-in generates fresh attributable codes.
-- ─────────────────────────────────────────────────────────────────────
truncate table public.referral_signups               cascade;
truncate table public.referral_codes                 cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Operational logs — clear so the launch metrics dashboard starts
--    from a clean slate.
-- ─────────────────────────────────────────────────────────────────────
truncate table public.notifications                  cascade;
truncate table public.email_events                   cascade;
truncate table public.auth_audit                     cascade;
truncate table public.review_actions                 cascade;
truncate table public.stripe_events                  cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 5. Vendor offer testing data — keep approved live offers, drop drafts
--    and any rejected catalog noise.
-- ─────────────────────────────────────────────────────────────────────
delete from public.offer_media
  where offer_id in (
    select id from public.offers where review_status <> 'approved'
  );
delete from public.offers
  where review_status <> 'approved';

delete from public.catalog_media
  where catalog_item_id in (
    select id from public.catalog_items where review_status <> 'approved'
  );
delete from public.catalog_items
  where review_status <> 'approved';

-- Redemptions: clear all — they were test purchases.
truncate table public.redemptions                    cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 6. Members — delete everyone except admin allow-list + the one test
--    member you named above. Adjust the email if you want a different
--    real seed in production.
-- ─────────────────────────────────────────────────────────────────────
delete from public.members
  where lower(email) not in (select email from _keep_accounts);

-- Waitlist: clear (we go live with self-serve signup).
truncate table public.waitlist_signups               cascade;

-- ─────────────────────────────────────────────────────────────────────
-- 7. Experts — keep the test expert. Anyone else gets dropped along
--    with their applications.
-- ─────────────────────────────────────────────────────────────────────
delete from public.experts
  where lower(email) not in (select email from _keep_accounts);

delete from public.expert_applications
  where lower(email) not in (select email from _keep_accounts)
    and not exists (
      select 1 from public.experts e
      where lower(e.email) = lower(public.expert_applications.email)
    );

-- ─────────────────────────────────────────────────────────────────────
-- 8. Vendors (partners) — keep the test partner only.
-- ─────────────────────────────────────────────────────────────────────
delete from public.vendors
  where lower(contact_email) not in (select email from _keep_accounts);

-- ─────────────────────────────────────────────────────────────────────
-- 9. Stripe subscription state on the surviving test member — reset so
--    the test account can rerun the full payment flow from scratch.
--    If your test member already has a live $49 sub you DON'T want to
--    wipe, comment this block out.
-- ─────────────────────────────────────────────────────────────────────
update public.members
   set stripe_customer_id      = null,
       stripe_subscription_id  = null,
       stripe_price_id         = null,
       subscription_status     = null,
       subscription_interval   = null,
       current_period_end      = null,
       cancel_at_period_end    = false,
       canceled_at             = null,
       card_brand              = null,
       card_last4              = null,
       founding_member_locked  = false,
       early_member_locked     = false,
       tier                    = 'founding'
 where lower(email) in (select email from _keep_accounts);

-- ─────────────────────────────────────────────────────────────────────
-- 10. Supabase Auth users — delete the auth rows that are no longer
--     referenced by any role. We DO NOT touch admin auth users; their
--     emails are in `admin_users` which we never modify.
--
--     This runs through the storage-bypassing service-role auth schema.
-- ─────────────────────────────────────────────────────────────────────
delete from auth.users u
  where lower(u.email) not in (select email from _keep_accounts)
    and lower(u.email) not in (
      select lower(email) from public.admin_users where active = true
    );

-- ─────────────────────────────────────────────────────────────────────
-- 11. Sanity check — verify the keep-list survived.
-- ─────────────────────────────────────────────────────────────────────
do $$
declare
  member_kept int;
  expert_kept int;
  vendor_kept int;
  admin_kept  int;
begin
  select count(*) into member_kept from public.members;
  select count(*) into expert_kept from public.experts;
  select count(*) into vendor_kept from public.vendors;
  select count(*) into admin_kept  from public.admin_users where active = true;
  raise notice '----- Pre-launch reset complete -----';
  raise notice 'Active admins kept : %', admin_kept;
  raise notice 'Members remaining  : %', member_kept;
  raise notice 'Experts remaining  : %', expert_kept;
  raise notice 'Partners remaining : %', vendor_kept;
  raise notice '-------------------------------------';
end$$;

drop table if exists _keep_accounts;
