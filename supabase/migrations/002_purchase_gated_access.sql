-- DIY Calc Pro by Seiton Home
-- Purchase-gated access: registration requires a valid activation code

-- ============================================================
-- CHECK ACTIVATION CODE (read-only, callable before signup)
-- ============================================================
create or replace function public.check_activation_code(p_code text)
returns boolean as $$
declare
  v_row public.activation_codes%rowtype;
begin
  select * into v_row
  from public.activation_codes
  where code = upper(trim(p_code));

  if not found then
    return false;
  end if;

  if v_row.status <> 'unused' then
    return false;
  end if;

  if v_row.expires_at is not null and v_row.expires_at < now() then
    return false;
  end if;

  return true;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.check_activation_code(text) to anon, authenticated;

-- ============================================================
-- REDEEM ACTIVATION CODE + CREATE LICENSE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_code text;
  v_row public.activation_codes%rowtype;
begin
  insert into public.users_profile (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  insert into public.user_preferences (user_id)
  values (new.id);

  v_code := new.raw_user_meta_data->>'activation_code';

  if v_code is not null then
    select * into v_row
    from public.activation_codes
    where code = upper(trim(v_code))
      and status = 'unused'
      and (expires_at is null or expires_at >= now())
    for update;
  end if;

  if v_row.id is not null then
    update public.activation_codes
    set status = 'used', used_by = new.id, used_at = now()
    where id = v_row.id;

    insert into public.licenses (user_id, activation_code_id, status, plan, activated_at)
    values (new.id, v_row.id, 'active', 'premium', now());
  else
    insert into public.licenses (user_id, status, plan)
    values (new.id, 'demo', 'free');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
