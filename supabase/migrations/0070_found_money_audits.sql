-- 0070: Found Money Audit (Lester, 30 Sep 2026; launch brief 2 Oct).
--
-- A free, public first step: an email and three documents, no card. The
-- AI reads each document (stage A), code does the maths (stage B), the AI
-- writes the findings from the facts only (stage C). The visitor sees the
-- headline total and the first finding; the rest is locked behind
-- membership. After they join, the audit attaches to their member row by
-- email, the team reviews every finding in the admin console and
-- releases the full report.
--
-- Files live in the existing PRIVATE bucket `tool-uploads` under
-- audits/<audit id>/. Rows are service-role only; the public pages read
-- through the API with the unguessable `token`.

create table if not exists public.found_money_audits (
  id               uuid primary key default gen_random_uuid(),
  token            uuid not null unique default gen_random_uuid(),
  email            text not null,
  practice_name    text,
  member_id        uuid references public.members(id) on delete set null,
  status           text not null default 'processing'
                   check (status in ('processing', 'estimated', 'failed', 'unlocked', 'released', 'deleted')),
  files            jsonb not null default '[]'::jsonb,   -- [{slot, name, path, mime, size}]
  extractions      jsonb,                                -- stage A, one per file
  facts            jsonb,                                -- stage B
  findings         jsonb,                                -- stage C, as written by the model (null when it failed the number check)
  released_findings jsonb,                               -- what the team released, after edits
  headline_total   numeric,
  error            text,
  utm              jsonb,
  ip_hash          text,
  unlocked_at      timestamptz,
  reviewed_by      uuid,
  released_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists found_money_audits_email_idx on public.found_money_audits (lower(email));
create index if not exists found_money_audits_member_idx on public.found_money_audits (member_id);
create index if not exists found_money_audits_status_idx on public.found_money_audits (status, created_at desc);

alter table public.found_money_audits enable row level security;
revoke all on public.found_money_audits from anon, authenticated;

comment on table public.found_money_audits is 'Found Money Audit runs: free public upload, AI estimate, locked report, team review and release. Service role only.';

-- Private bucket for the uploaded statements and invoices. No storage
-- policies are added, so only the service role can read or write; the
-- admin console serves files through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tool-uploads', 'tool-uploads', false, 15728640, array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
