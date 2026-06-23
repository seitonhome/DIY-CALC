-- DIY Calc Pro by Seiton Home
-- Initial database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS PROFILE
-- ============================================================
create table public.users_profile (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  preferred_language text not null default 'es' check (preferred_language in ('es', 'en')),
  preferred_currency text not null default 'USD',
  preferred_units text not null default 'metric' check (preferred_units in ('metric', 'imperial')),
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ACTIVATION CODES
-- ============================================================
create table public.activation_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  status text not null default 'unused' check (status in ('unused', 'used', 'blocked', 'expired')),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- LICENSES
-- ============================================================
create table public.licenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  activation_code_id uuid references public.activation_codes(id) on delete set null,
  status text not null default 'demo' check (status in ('active', 'expired', 'blocked', 'demo')),
  plan text not null default 'free' check (plan in ('free', 'premium', 'admin')),
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MATERIALS
-- ============================================================
create table public.materials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  purchase_unit text not null default 'kg',
  purchase_qty numeric not null default 1,
  price_paid numeric not null default 0,
  supplier text,
  purchase_date date,
  cost_per_gram numeric generated always as (
    case when purchase_qty > 0 then price_paid / (purchase_qty * 1000) else 0 end
  ) stored,
  cost_per_ml numeric,
  cost_per_unit numeric,
  stock_qty numeric default 0,
  waste_pct numeric default 0,
  notes text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MOLDS
-- ============================================================
create table public.molds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  shape text,
  dimensions jsonb default '{}',
  volume_ml numeric,
  capacity text,
  mold_material text,
  cavities integer default 1,
  mold_cost numeric default 0,
  estimated_uses integer default 100,
  amortized_cost_per_use numeric generated always as (
    case when estimated_uses > 0 then mold_cost / estimated_uses else 0 end
  ) stored,
  notes text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FORMULAS
-- ============================================================
create table public.formulas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  version text default '1.0',
  description text,
  notes text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- FORMULA MATERIALS
-- ============================================================
create table public.formula_materials (
  id uuid primary key default uuid_generate_v4(),
  formula_id uuid references public.formulas(id) on delete cascade not null,
  material_id uuid references public.materials(id) on delete set null,
  material_name text not null,
  amount numeric not null default 0,
  unit text not null default 'g',
  percentage numeric,
  cost numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- CALCULATIONS
-- ============================================================
create table public.calculations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  formula_id uuid references public.formulas(id) on delete set null,
  product_name text,
  category text not null,
  units integer default 1,
  batch_size integer default 1,
  input_data jsonb default '{}',
  results jsonb default '{}',
  locale text default 'es',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CALCULATION ITEMS
-- ============================================================
create table public.calculation_items (
  id uuid primary key default uuid_generate_v4(),
  calculation_id uuid references public.calculations(id) on delete cascade not null,
  item_type text not null,
  name text not null,
  amount numeric default 0,
  unit text default 'g',
  cost_per_unit numeric default 0,
  total_cost numeric default 0,
  percentage_of_total numeric,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text,
  formula_id uuid references public.formulas(id) on delete set null,
  cost_per_unit numeric default 0,
  suggested_price numeric default 0,
  wholesale_price numeric default 0,
  gross_margin numeric default 0,
  net_margin numeric default 0,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EXPORTS
-- ============================================================
create table public.exports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  calculation_id uuid references public.calculations(id) on delete set null,
  export_type text not null check (export_type in ('pdf', 'csv', 'excel')),
  filename text,
  locale text default 'es',
  created_at timestamptz default now()
);

-- ============================================================
-- APP SETTINGS (global)
-- ============================================================
create table public.app_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  description text,
  updated_at timestamptz default now()
);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
create table public.admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_materials_user on public.materials(user_id);
create index idx_materials_category on public.materials(category);
create index idx_molds_user on public.molds(user_id);
create index idx_formulas_user on public.formulas(user_id);
create index idx_formulas_category on public.formulas(category);
create index idx_calculations_user on public.calculations(user_id);
create index idx_calculations_category on public.calculations(category);
create index idx_products_user on public.products(user_id);
create index idx_activation_codes_code on public.activation_codes(code);
create index idx_activation_codes_status on public.activation_codes(status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users_profile enable row level security;
alter table public.user_preferences enable row level security;
alter table public.licenses enable row level security;
alter table public.activation_codes enable row level security;
alter table public.materials enable row level security;
alter table public.molds enable row level security;
alter table public.formulas enable row level security;
alter table public.formula_materials enable row level security;
alter table public.calculations enable row level security;
alter table public.calculation_items enable row level security;
alter table public.products enable row level security;
alter table public.exports enable row level security;
alter table public.admin_logs enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- users_profile: users see own, admins see all
create policy "users_profile_select" on public.users_profile
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.users_profile up where up.user_id = auth.uid() and up.role = 'admin')
  );
create policy "users_profile_insert" on public.users_profile
  for insert with check (auth.uid() = user_id);
create policy "users_profile_update" on public.users_profile
  for update using (auth.uid() = user_id);

-- user_preferences: own only
create policy "user_preferences_own" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- licenses: own only (admins see all)
create policy "licenses_select" on public.licenses
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.users_profile up where up.user_id = auth.uid() and up.role = 'admin')
  );
create policy "licenses_insert" on public.licenses
  for insert with check (auth.uid() = user_id);
create policy "licenses_update" on public.licenses
  for update using (auth.uid() = user_id);

-- activation_codes: admins manage, any authenticated user can read to validate
create policy "activation_codes_read" on public.activation_codes
  for select using (auth.uid() is not null);
create policy "activation_codes_admin" on public.activation_codes
  for all using (
    exists (select 1 from public.users_profile up where up.user_id = auth.uid() and up.role = 'admin')
  );

-- materials: own only
create policy "materials_own" on public.materials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- molds: own only
create policy "molds_own" on public.molds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- formulas: own or public
create policy "formulas_select" on public.formulas
  for select using (auth.uid() = user_id or is_public = true);
create policy "formulas_write" on public.formulas
  for insert with check (auth.uid() = user_id);
create policy "formulas_update" on public.formulas
  for update using (auth.uid() = user_id);
create policy "formulas_delete" on public.formulas
  for delete using (auth.uid() = user_id);

-- formula_materials: via formula ownership
create policy "formula_materials_own" on public.formula_materials
  for all using (
    exists (select 1 from public.formulas f where f.id = formula_id and f.user_id = auth.uid())
  );

-- calculations: own only
create policy "calculations_own" on public.calculations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- calculation_items: via calculation ownership
create policy "calculation_items_own" on public.calculation_items
  for all using (
    exists (select 1 from public.calculations c where c.id = calculation_id and c.user_id = auth.uid())
  );

-- products: own only
create policy "products_own" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- exports: own only
create policy "exports_own" on public.exports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- admin_logs: admin only
create policy "admin_logs_admin" on public.admin_logs
  for all using (
    exists (select 1 from public.users_profile up where up.user_id = auth.uid() and up.role = 'admin')
  );

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger t_users_profile_updated_at before update on public.users_profile for each row execute function public.handle_updated_at();
create trigger t_user_preferences_updated_at before update on public.user_preferences for each row execute function public.handle_updated_at();
create trigger t_licenses_updated_at before update on public.licenses for each row execute function public.handle_updated_at();
create trigger t_materials_updated_at before update on public.materials for each row execute function public.handle_updated_at();
create trigger t_molds_updated_at before update on public.molds for each row execute function public.handle_updated_at();
create trigger t_formulas_updated_at before update on public.formulas for each row execute function public.handle_updated_at();
create trigger t_calculations_updated_at before update on public.calculations for each row execute function public.handle_updated_at();
create trigger t_products_updated_at before update on public.products for each row execute function public.handle_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile + license on signup
-- ============================================================
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
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DEFAULT APP SETTINGS
-- ============================================================
insert into public.app_settings (key, value, description) values
  ('min_recommended_margin', '20', 'Minimum recommended net margin percentage'),
  ('max_fragrance_soy', '12', 'Max fragrance load % for soy wax'),
  ('max_fragrance_paraffin', '10', 'Max fragrance load % for paraffin'),
  ('max_fragrance_coconut', '10', 'Max fragrance load % for coconut wax'),
  ('max_fragrance_beeswax', '6', 'Max fragrance load % for beeswax'),
  ('soy_density', '0.86', 'Soy wax density g/ml'),
  ('paraffin_density', '0.93', 'Paraffin density g/ml'),
  ('resin_density', '1.1', 'Epoxy resin density g/ml'),
  ('water_density', '1.0', 'Water density g/ml'),
  ('demo_max_calculations', '3', 'Max calculations allowed in demo mode');
