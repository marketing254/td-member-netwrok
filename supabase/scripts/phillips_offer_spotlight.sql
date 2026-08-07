-- =====================================================================
-- One-off: The Phillips Group member offer → profile spotlight
-- RUN AFTER migrations up to 0050_spotlight_dual_owner.sql.
--
-- Creates ONE published "feature" spotlight carrying the approved
-- member offer (Andrew, Jul 14) and attaches it to BOTH the partner
-- (The Phillips Group) and the expert (Laura Phillips) profiles via the
-- dual-owner support from 0050. Idempotent — safe to re-run.
--
-- Note: inserting via SQL does NOT post a feed nudge. If you want the
-- "take a look at their profile" post in the network feed, open
-- /admin/spotlights afterwards and click Unpublish → Publish on this
-- row — the publish action posts the nudge once.
-- =====================================================================

do $$
declare
  v_vendor uuid;
  v_expert uuid;
begin
  -- Partner: The Phillips Group
  select id into v_vendor
  from public.vendors
  where (company_name ilike '%phillips%' or display_name ilike '%phillips%')
  order by created_at asc
  limit 1;

  if v_vendor is null then
    raise exception 'No vendor matching "Phillips" found — check the company name.';
  end if;

  -- Expert: Laura Phillips (optional — spotlight still created without her)
  select id into v_expert
  from public.experts
  where (full_name ilike '%laura%phillips%' or display_name ilike '%laura%phillips%')
    and status not in ('archived', 'suspended')
  order by created_at asc
  limit 1;

  if exists (
    select 1 from public.profile_spotlights
    where vendor_id = v_vendor
      and title = '3 member-exclusive savings from The Phillips Group'
  ) then
    raise notice 'Spotlight already exists — nothing inserted.';
    return;
  end if;

  insert into public.profile_spotlights
    (expert_id, vendor_id, kind, title, body, link_url, link_label,
     is_published, published_at, posted_to_feed)
  values
    (v_expert,          -- shows on Laura''s expert profile too (null-safe)
     v_vendor,
     'feature',
     '3 member-exclusive savings from The Phillips Group',
     'DMN members get three exclusive savings from The Phillips Group — the healthcare-focused accounting, tax, and advisory firm behind expert Laura Phillips, E.A.:'
       || E'\n\n'
       || E'• One free 30-minute consultation with Laura Phillips, E.A. every year\n'
       || E'• 15% off all new monthly plan services\n'
       || E'• $500 off a Financial Due Diligence (normally $2,500)'
       || E'\n\nBook through Laura''s scheduling link below, or redeem from The Phillips Group''s partner profile.',
     'https://form.typeform.com/to/Nia92ZWB',
     'Book with Laura',
     true,
     now(),
     false);

  raise notice 'Spotlight created. Vendor: % · Expert: %', v_vendor, coalesce(v_expert::text, '(not linked — no Laura Phillips expert row found)');
end $$;
