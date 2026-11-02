-- 0079_portal_seats.sql
--
-- Team seats: extra people who sign in with their OWN email and land in a
-- partner's portal and/or an expert's portal (Cameron Bolden for Arise
-- Solutions and David Bolden, Lester 2 Nov 2026). Seats are managed only in
-- the admin console; owners cannot add or remove them.
--
-- What a seat can do: everything day-to-day in that portal (profile,
-- catalog, offers, inquiries, resources, posts). Billing, the agreement and
-- the card stay owner-only (enforced in the API routes + hidden in the UI).
--
-- How it plugs in with no change to existing rows:
--   * current_vendor_id() — used by every vendor-side policy — now falls
--     back to the signed-in email's seat when the user owns no vendor row.
--   * current_expert_id() (new) does the same for experts, and the expert-
--     side policies that used "experts where auth_user_id = auth.uid()"
--     inline now call it.
--   * vendors / experts self-read and self-update policies accept the seat.
-- Existing logins keep working exactly as before: the owner path is checked
-- first, the seat path only when it finds nothing.
--
-- Safe to re-run.

-- ---------------------------------------------------------------- table
create table if not exists public.portal_seats (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  name        text,
  vendor_id   uuid references public.vendors (id) on delete cascade,
  expert_id   uuid references public.experts (id) on delete cascade,
  added_by    uuid,
  created_at  timestamptz not null default now(),
  constraint portal_seats_one_target check (
    (vendor_id is not null and expert_id is null) or (vendor_id is null and expert_id is not null)
  ),
  constraint portal_seats_email_lower check (email = lower(email))
);
create unique index if not exists portal_seats_vendor_email_uidx on public.portal_seats (vendor_id, email) where vendor_id is not null;
create unique index if not exists portal_seats_expert_email_uidx on public.portal_seats (expert_id, email) where expert_id is not null;
create index if not exists portal_seats_email_idx on public.portal_seats (email);

alter table public.portal_seats enable row level security;
revoke all on public.portal_seats from anon, authenticated;
grant all on public.portal_seats to service_role;
-- A signed-in person may see only the seat rows for their own email (the
-- portal uses this to find which company / expert they belong to).
grant select on public.portal_seats to authenticated;
drop policy if exists portal_seats_self_select on public.portal_seats;
create policy portal_seats_self_select
  on public.portal_seats
  for select
  to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ------------------------------------------------------------ functions
-- Vendor: own row first (as before), else the seat for this email.
create or replace function public.current_vendor_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select id from public.vendors
       where auth_user_id = auth.uid() and status = 'approved'
       order by created_at asc limit 1),
    (select s.vendor_id from public.portal_seats s
       join public.vendors v on v.id = s.vendor_id
       where s.email = lower(coalesce(auth.jwt() ->> 'email', ''))
         and s.vendor_id is not null
         and v.status = 'approved'
       order by s.created_at asc limit 1)
  );
$$;

-- Expert: own row first, else the seat for this email.
create or replace function public.current_expert_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select id from public.experts
       where auth_user_id = auth.uid()
         and status not in ('suspended', 'archived')
       order by created_at asc limit 1),
    (select s.expert_id from public.portal_seats s
       join public.experts e on e.id = s.expert_id
       where s.email = lower(coalesce(auth.jwt() ->> 'email', ''))
         and s.expert_id is not null
         and e.status not in ('suspended', 'archived')
       order by s.created_at asc limit 1)
  );
$$;
revoke all on function public.current_expert_id from public;
grant execute on function public.current_expert_id to authenticated;

-- -------------------------------------------------------------- vendors
drop policy if exists vendors_select_authed on public.vendors;
create policy vendors_select_authed
  on public.vendors
  for select
  to authenticated
  using (
    public.is_admin()
    or auth_user_id = auth.uid()
    or lower(contact_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or id = public.current_vendor_id()
    or billing_parent_id = public.current_vendor_id()
  );

drop policy if exists vendors_update_self on public.vendors;
create policy vendors_update_self
  on public.vendors
  for update
  to authenticated
  using (auth_user_id = auth.uid() or id = public.current_vendor_id())
  with check (auth_user_id = auth.uid() or id = public.current_vendor_id());

-- -------------------------------------------------------------- experts
drop policy if exists "experts_self_select" on public.experts;
create policy "experts_self_select"
  on public.experts
  for select
  using (auth.uid() = auth_user_id or id = public.current_expert_id());

drop policy if exists "experts_self_update" on public.experts;
create policy "experts_self_update"
  on public.experts
  for update
  using (auth.uid() = auth_user_id or id = public.current_expert_id())
  with check (auth.uid() = auth_user_id or id = public.current_expert_id());

-- expert_resources (0020)
drop policy if exists "expert_resources_self_select" on public.expert_resources;
create policy "expert_resources_self_select" on public.expert_resources
  for select using (expert_id = public.current_expert_id());
drop policy if exists "expert_resources_self_insert" on public.expert_resources;
create policy "expert_resources_self_insert" on public.expert_resources
  for insert with check (expert_id = public.current_expert_id());
drop policy if exists "expert_resources_self_update" on public.expert_resources;
create policy "expert_resources_self_update" on public.expert_resources
  for update using (expert_id = public.current_expert_id()) with check (expert_id = public.current_expert_id());
drop policy if exists "expert_resources_self_delete" on public.expert_resources;
create policy "expert_resources_self_delete" on public.expert_resources
  for delete using (expert_id = public.current_expert_id());

-- expert-resources storage bucket (0020)
drop policy if exists "expert_resources_storage_select" on storage.objects;
create policy "expert_resources_storage_select" on storage.objects
  for select using (bucket_id = 'expert-resources' and split_part(name, '/', 1)::uuid = public.current_expert_id());
drop policy if exists "expert_resources_storage_insert" on storage.objects;
create policy "expert_resources_storage_insert" on storage.objects
  for insert with check (bucket_id = 'expert-resources' and split_part(name, '/', 1)::uuid = public.current_expert_id());
drop policy if exists "expert_resources_storage_update" on storage.objects;
create policy "expert_resources_storage_update" on storage.objects
  for update using (bucket_id = 'expert-resources' and split_part(name, '/', 1)::uuid = public.current_expert_id());
drop policy if exists "expert_resources_storage_delete" on storage.objects;
create policy "expert_resources_storage_delete" on storage.objects
  for delete using (bucket_id = 'expert-resources' and split_part(name, '/', 1)::uuid = public.current_expert_id());

-- expert_posts (0021)
drop policy if exists "expert_posts_self_modify" on public.expert_posts;
create policy "expert_posts_self_modify" on public.expert_posts
  for all using (expert_id = public.current_expert_id()) with check (expert_id = public.current_expert_id());

-- chatbot (0022)
drop policy if exists "chatbot_conversations_participants" on public.chatbot_conversations;
create policy "chatbot_conversations_participants" on public.chatbot_conversations
  for select using (member_auth_user_id = auth.uid() or expert_id = public.current_expert_id());
drop policy if exists "chatbot_messages_participants" on public.chatbot_messages;
create policy "chatbot_messages_participants" on public.chatbot_messages
  for select using (
    conversation_id in (
      select id from public.chatbot_conversations
      where member_auth_user_id = auth.uid() or expert_id = public.current_expert_id()
    )
  );

-- ------------------------------------------------- Cameron Bolden's seats
-- Arise Solutions (partner) and David Bolden (expert). Idempotent.
insert into public.portal_seats (email, name, vendor_id)
select 'cameron@ariseconsulting.io', 'Cameron Bolden', 'e42f96f1-fc1e-4e7c-9b1a-f631a79a46c5'
where not exists (
  select 1 from public.portal_seats where email = 'cameron@ariseconsulting.io' and vendor_id = 'e42f96f1-fc1e-4e7c-9b1a-f631a79a46c5'
);
insert into public.portal_seats (email, name, expert_id)
select 'cameron@ariseconsulting.io', 'Cameron Bolden', 'caa52e4d-e583-44c2-be32-594071b55800'
where not exists (
  select 1 from public.portal_seats where email = 'cameron@ariseconsulting.io' and expert_id = 'caa52e4d-e583-44c2-be32-594071b55800'
);
