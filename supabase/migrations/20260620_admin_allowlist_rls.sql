-- Admin allowlist + tightened RLS.
--
-- Before this migration, every authenticated Supabase user was treated as an
-- admin (policies used `to authenticated ... using (true)`). That meant anyone
-- who could sign up could read private submissions and edit/publish content.
--
-- This migration introduces an explicit admin allowlist and rewrites every
-- privileged policy to require membership in that allowlist via is_admin().

create extension if not exists pgcrypto;

-- 1. Allowlist table -------------------------------------------------------

create table if not exists public.admin_allowlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text,
  note text not null default '',
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Store emails lower-cased so matching is reliable.
create or replace function public.normalize_admin_allowlist_email()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email = lower(trim(new.email));
    if new.email = '' then
      new.email = null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists normalize_admin_allowlist_email on public.admin_allowlist;
create trigger normalize_admin_allowlist_email
before insert or update on public.admin_allowlist
for each row
execute function public.normalize_admin_allowlist_email();

create unique index if not exists admin_allowlist_email_key
on public.admin_allowlist (email)
where email is not null;

create unique index if not exists admin_allowlist_user_id_key
on public.admin_allowlist (user_id)
where user_id is not null;

-- 2. is_admin() helper -----------------------------------------------------
-- SECURITY DEFINER so it can read the allowlist regardless of the caller's
-- RLS context. It only ever returns a boolean about the *current* caller.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist a
    where (a.user_id is not null and a.user_id = auth.uid())
       or (a.email is not null and a.email = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Allowlist RLS ---------------------------------------------------------
-- Admins may read the allowlist (e.g. to confirm their own access). Writes are
-- intentionally left with no policy, so only the service role / SQL editor can
-- add or remove admins.

alter table public.admin_allowlist enable row level security;

drop policy if exists "admins read allowlist" on public.admin_allowlist;
create policy "admins read allowlist"
on public.admin_allowlist
for select
to authenticated
using (public.is_admin());

-- 4. Site content ----------------------------------------------------------

drop policy if exists "public read published site content" on public.site_content_versions;
create policy "public read published site content"
on public.site_content_versions
for select
to anon, authenticated
using (status = 'published' or public.is_admin());

drop policy if exists "authenticated manage site content" on public.site_content_versions;
drop policy if exists "admins manage site content" on public.site_content_versions;
create policy "admins manage site content"
on public.site_content_versions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 5. Contact submissions ---------------------------------------------------

drop policy if exists "anon submit contact forms" on public.contact_submissions;
create policy "anon submit contact forms"
on public.contact_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read and update contact submissions" on public.contact_submissions;
drop policy if exists "admins read and update contact submissions" on public.contact_submissions;
create policy "admins read and update contact submissions"
on public.contact_submissions
for select
to authenticated
using (public.is_admin());

create policy "admins update contact submissions"
on public.contact_submissions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins delete contact submissions"
on public.contact_submissions
for delete
to authenticated
using (public.is_admin());

-- 6. Prayer submissions ----------------------------------------------------

drop policy if exists "anon submit prayer forms" on public.prayer_submissions;
create policy "anon submit prayer forms"
on public.prayer_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "authenticated read and update prayer submissions" on public.prayer_submissions;
drop policy if exists "admins read and update prayer submissions" on public.prayer_submissions;
create policy "admins read and update prayer submissions"
on public.prayer_submissions
for select
to authenticated
using (public.is_admin());

create policy "admins update prayer submissions"
on public.prayer_submissions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins delete prayer submissions"
on public.prayer_submissions
for delete
to authenticated
using (public.is_admin());

-- 7. Sermon extraction jobs ------------------------------------------------

do $$
begin
  if to_regclass('public.sermon_extraction_jobs') is not null then
    execute 'alter table public.sermon_extraction_jobs enable row level security';

    execute 'drop policy if exists "authenticated read sermon extraction jobs" on public.sermon_extraction_jobs';
    execute 'drop policy if exists "admins read sermon extraction jobs" on public.sermon_extraction_jobs';
    execute $policy$
      create policy "admins read sermon extraction jobs"
      on public.sermon_extraction_jobs
      for select
      to authenticated
      using (public.is_admin())
    $policy$;

    execute 'drop policy if exists "authenticated insert sermon extraction jobs" on public.sermon_extraction_jobs';
    execute 'drop policy if exists "admins insert sermon extraction jobs" on public.sermon_extraction_jobs';
    execute $policy$
      create policy "admins insert sermon extraction jobs"
      on public.sermon_extraction_jobs
      for insert
      to authenticated
      with check (public.is_admin())
    $policy$;

    execute 'drop policy if exists "authenticated update sermon extraction jobs" on public.sermon_extraction_jobs';
    execute 'drop policy if exists "admins update sermon extraction jobs" on public.sermon_extraction_jobs';
    execute $policy$
      create policy "admins update sermon extraction jobs"
      on public.sermon_extraction_jobs
      for update
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
    $policy$;
  end if;
end
$$;

-- 8. Storage object policies ----------------------------------------------
-- Public read stays open (the bucket serves public site media). Writes now
-- require an allow-listed admin instead of any authenticated user.

drop policy if exists "public read site media" on storage.objects;
create policy "public read site media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "authenticated upload site media" on storage.objects;
drop policy if exists "admins upload site media" on storage.objects;
create policy "admins upload site media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "authenticated update site media" on storage.objects;
drop policy if exists "admins update site media" on storage.objects;
create policy "admins update site media"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-media' and public.is_admin())
with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "authenticated delete site media" on storage.objects;
drop policy if exists "admins delete site media" on storage.objects;
create policy "admins delete site media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-media' and public.is_admin());

-- 9. Seed the first admin (optional) --------------------------------------
-- Edit the email below and uncomment to add your shared admin account. You can
-- also do this from the Supabase SQL editor / Table editor at any time.
--
-- insert into public.admin_allowlist (email, note)
-- values ('admin@dundee-elim.org.uk', 'Shared church admin')
-- on conflict do nothing;
