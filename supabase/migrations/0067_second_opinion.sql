-- 0067: Second Opinion (member tool) + the anonymous vendor pool.
--
-- Two tables and one private bucket.
--
--   tool_runs        One row per run of a reading tool (Second Opinion now,
--                    Found Money next). Holds the member's uploaded file
--                    path, the extracted text length, and the model's
--                    result as JSON. The member can delete a run, which
--                    removes the file and the row.
--
--   tool_vendor_pool The five-column anonymous table from the Found Money
--                    brief: vendor, category, price band, practice size
--                    band, date. NEVER a member id, name or practice. Built
--                    from day one so no run's data is lost. Written only
--                    when the member left the pool tick box on.
--
-- Both tables are service-role only: RLS on, no policies, no grants to
-- anon/authenticated. Every read and write goes through /api/member/tools/*
-- with the member guard, exactly like job applications.

create table if not exists public.tool_runs (
  id               uuid primary key default gen_random_uuid(),
  member_id        uuid not null references public.members(id) on delete cascade,
  tool             text not null check (tool in ('second_opinion', 'found_money')),
  status           text not null default 'processing'
                   check (status in ('processing', 'done', 'failed')),
  file_name        text not null check (char_length(file_name) between 1 and 255),
  file_path        text not null,
  file_mime        text not null,
  file_size_bytes  integer not null check (file_size_bytes > 0),
  extracted_chars  integer,
  result           jsonb,
  error            text,
  model            text,
  share_to_pool    boolean not null default true,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create index if not exists tool_runs_member_created_idx
  on public.tool_runs (member_id, created_at desc);

alter table public.tool_runs enable row level security;
revoke all on public.tool_runs from anon, authenticated;

comment on table public.tool_runs is
  'One row per Second Opinion / Found Money run. Service-role only; the member API enforces ownership.';

-- ── The anonymous vendor pool ─────────────────────────────────────────

create table if not exists public.tool_vendor_pool (
  id                  uuid primary key default gen_random_uuid(),
  tool                text not null check (tool in ('second_opinion', 'found_money')),
  vendor              text not null check (char_length(vendor) between 1 and 160),
  category            text not null check (category in (
                        'supplies', 'lab', 'software', 'marketing', 'card_processing',
                        'insurance_verification', 'payroll', 'equipment', 'other')),
  price_band          text not null,
  practice_size_band  text not null,
  run_date            date not null default current_date
);

create index if not exists tool_vendor_pool_cat_idx
  on public.tool_vendor_pool (category, run_date desc);

alter table public.tool_vendor_pool enable row level security;
revoke all on public.tool_vendor_pool from anon, authenticated;

comment on table public.tool_vendor_pool is
  'Anonymous price bands from every reading-tool run. Five columns, no member identity, by design.';

-- ── Private bucket for uploaded documents ─────────────────────────────
-- Path: {member_id}/{run_id}/{safe-filename}. Read and written only with
-- the service role; there is no storage.objects policy for this bucket and
-- there must never be one.

insert into storage.buckets (id, name, public)
values ('tool-uploads', 'tool-uploads', false)
on conflict (id) do nothing;
