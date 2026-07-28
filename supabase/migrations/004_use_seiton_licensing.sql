-- DIY Calc Pro by Seiton Home
-- Activation codes are now validated against Seiton Home's shared licensing
-- system (managed in Seiton admin), not this app's own activation_codes
-- table. New users are created with a 'demo' license; the app immediately
-- upgrades it to 'active' via /api/activate-license right after signup
-- once the code is confirmed valid on Seiton's side.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  insert into public.user_preferences (user_id)
  values (new.id);
  insert into public.licenses (user_id, status, plan)
  values (new.id, 'demo', 'free');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
