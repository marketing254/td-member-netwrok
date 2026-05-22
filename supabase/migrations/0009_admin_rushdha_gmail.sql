-- =====================================================================
-- DMN — Add Rushdha's personal gmail to admin allow-list
-- Run this after 0008_catalog_documents.sql.
--
-- The production seed (0005) used rushdha@dentalmembernetwork.com — a
-- workspace mailbox that isn't provisioned yet during testing. Add the
-- personal gmail as a second active admin row so Rushdha can sign in
-- to the console during the build phase. Keep BOTH rows: the workspace
-- one becomes the long-term identity once it's live.
--
-- After running this in the SQL editor:
--   1. Open Supabase Dashboard → Authentication → Users → "Add user"
--   2. Email: fathimarushdhaakbar28@gmail.com
--      Check "Auto Confirm User"  (or set email_confirm = true)
--      Leave password blank — magic link only.
--   3. Go to /admin/login, enter the gmail, click the link.
-- =====================================================================

insert into public.admin_users (email, full_name, role, active)
values
  ('fathimarushdhaakbar28@gmail.com', 'Rushdha', 'admin', true)
on conflict (email) do update
  set active = true,
      role   = excluded.role,
      full_name = excluded.full_name;

-- Confirm:
--   select email, full_name, role, active, auth_user_id
--   from public.admin_users
--   order by created_at;

notify pgrst, 'reload schema';
