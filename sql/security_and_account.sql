-- Run on BOTH preview and production Supabase if missing.

-- profiles: pro flag
alter table public.profiles
  add column if not exists is_pro boolean not null default false;

alter table public.profiles
  add column if not exists avatar_url text;

-- Delete own account (scores, profile, storage objects, auth user via cascade if set)
-- Requires service role for auth.users delete OR use this RPC as security definer
-- that only cleans app data + marks deletion. Full auth delete needs Edge Function.

create or replace function public.delete_my_account()
returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.score_events where user_id = v_uid;
  delete from public.leaderboard where user_id = v_uid;

  -- storage avatars
  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = v_uid::text;

  delete from public.profiles where id = v_uid;

  -- Note: auth.users row is NOT deleted from client SQL.
  -- After this RPC, client should signOut.
  -- To fully remove auth user, use Edge Function with service_role later.

  return json_build_object('ok', true);
end;
$fn$;

grant execute on function public.delete_my_account() to authenticated;

-- RLS hardening samples (adjust if policies already exist)
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- prevent users setting is_pro themselves via client
-- (optional trigger: only service role can change is_pro)
create or replace function public.protect_is_pro()
returns trigger
language plpgsql
as $fn$
begin
  if new.is_pro is distinct from old.is_pro and auth.role() = 'authenticated' then
    new.is_pro := old.is_pro;
  end if;
  return new;
end;
$fn$;

drop trigger if exists trg_protect_is_pro on public.profiles;
create trigger trg_protect_is_pro
  before update on public.profiles
  for each row execute function public.protect_is_pro();

notify pgrst, 'reload schema';
