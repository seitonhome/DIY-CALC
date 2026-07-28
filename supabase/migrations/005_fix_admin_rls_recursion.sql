-- DIY Calc Pro by Seiton Home
-- Fix "infinite recursion detected in policy for relation users_profile" (42P17)
--
-- The original admin-check policies did:
--   exists (select 1 from public.users_profile up where up.user_id = auth.uid() and up.role = 'admin')
-- inside policies defined ON public.users_profile itself (and on other tables that
-- then select from users_profile), which makes Postgres re-evaluate the same RLS
-- policy while evaluating it -- infinite recursion. This surfaces any time a normal
-- (non-service-role) session triggers evaluation of the licenses_select or
-- users_profile_select policies, e.g. updating your own license.
--
-- Fix: move the admin check into a SECURITY DEFINER function, which runs with the
-- function owner's privileges and therefore bypasses RLS on its internal query,
-- breaking the recursion.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users_profile
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Replace the recursive policies with ones that call is_admin() instead.

drop policy if exists "users_profile_select" on public.users_profile;
create policy "users_profile_select" on public.users_profile
  for select using (
    auth.uid() = user_id or public.is_admin()
  );

drop policy if exists "licenses_select" on public.licenses;
create policy "licenses_select" on public.licenses
  for select using (
    auth.uid() = user_id or public.is_admin()
  );

drop policy if exists "activation_codes_admin" on public.activation_codes;
create policy "activation_codes_admin" on public.activation_codes
  for all using (public.is_admin());

drop policy if exists "admin_logs_admin" on public.admin_logs;
create policy "admin_logs_admin" on public.admin_logs
  for all using (public.is_admin());
