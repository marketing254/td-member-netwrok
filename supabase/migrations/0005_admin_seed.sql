-- =====================================================================
-- DMN — Admin user seed (Phase 3)
-- Run this AFTER 0002, 0003, 0004.
--
-- Pre-creates the founding admin team in `admin_users`. The `auth_user_id`
-- starts NULL and gets linked automatically the first time the admin
-- signs in via magic link (see /auth/callback in the app).
--
-- IMPORTANT — emails must match exactly what the admin will type at
-- /admin/login. They're case-insensitive (citext) so casing doesn't
-- matter, but typos do.
--
-- To add more admins later, just run another upsert below — this is
-- idempotent (uses ON CONFLICT DO NOTHING).
-- =====================================================================

insert into public.admin_users (email, full_name, role, active)
values
  ('lester@dentalmembernetwork.com',  'Lester',  'owner',    true),
  ('reshani@dentalmembernetwork.com', 'Reshani', 'admin',    true),
  ('rushdha@dentalmembernetwork.com', 'Rushdha', 'admin',    true)
on conflict (email) do nothing;

-- Confirm with:
--   select email, full_name, role, active, auth_user_id, last_active_at
--   from public.admin_users order by created_at;
