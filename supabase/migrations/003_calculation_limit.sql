-- DIY Calc Pro by Seiton Home
-- Enforce a 10 saved-calculation cap per user (rolling window: oldest drops off)

create or replace function public.enforce_calculation_limit()
returns trigger as $$
begin
  delete from public.calculations
  where user_id = new.user_id
    and id not in (
      select id from public.calculations
      where user_id = new.user_id
      order by created_at desc
      limit 10
    );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

create trigger t_calculations_enforce_limit
  after insert on public.calculations
  for each row execute function public.enforce_calculation_limit();
