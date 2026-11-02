-- 0078_lock_public_offers.sql
--
-- Follow-up to 0077 (29 Oct 2026 security check). The public anon key could
-- still read approved offers and catalog items, and three approved offers
-- carry a member-only promo code. Every public and member page that shows
-- offers reads through server routes with the service role
-- (/partners/[id], /api/member/partners/[id], the assistant), and the
-- partner portal reads its own rows as an authenticated user, so the
-- anonymous role needs no access at all.
--
-- Safe to re-run.

drop policy if exists offers_select_public on public.offers;
revoke all on public.offers from anon;

drop policy if exists catalog_select_public on public.catalog_items;
revoke all on public.catalog_items from anon;
