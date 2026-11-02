-- 0077_lock_public_reads.sql
--
-- Closes two reads that the PUBLIC anon key (shipped in the browser bundle)
-- was allowed to make, found in the 29 Oct 2026 security check:
--
--   1. public.vendors — anyone could `select *` on every approved partner:
--      contact_phone, billing_email, stripe_customer_id, card_last4,
--      agreement_ip_hash, agreement_pdf_path, ... (25 rows). The public and
--      member partner directories never use this path: they go through
--      server routes with the service role (/api/directory/partners,
--      /api/member/partners). Only the partner's own portal reads the table
--      from the browser, and only its own row.
--
--   2. public.resources — anyone could list all 604 member-library rows,
--      including every file's external_url. The landing teaser and the
--      "Just dropped" shelf read via server routes (/api/resources,
--      /api/kit-cards), so the anon policy from 0013 is no longer needed.
--
-- Safe to re-run.

-- ---------------------------------------------------------------- resources
drop policy if exists resources_public_landing_read on public.resources;
revoke select on public.resources from anon;

-- ------------------------------------------------------------------ vendors
drop policy if exists vendors_select_public on public.vendors;
revoke all on public.vendors from anon;

-- Signed-in users see only their own company (plus companies billed under
-- it), or everything if they are an admin. Members no longer read partner
-- rows directly; the directories are server-rendered from the service role.
drop policy if exists vendors_select_authed on public.vendors;
create policy vendors_select_authed
  on public.vendors
  for select
  to authenticated
  using (
    public.is_admin()
    or auth_user_id = auth.uid()
    or lower(contact_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or billing_parent_id = public.current_vendor_id()
  );
