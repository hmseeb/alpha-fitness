-- Staff (trainers, cleaners, managers, etc.)

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text default '',
  photo_path text,
  contact text default '',
  cnic text default '',
  address text default '',
  monthly_salary integer default 0,
  joined_date date,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists staff_owner_updated_idx on public.staff (owner_id, updated_at);

drop trigger if exists staff_touch on public.staff;
create trigger staff_touch
  before update on public.staff
  for each row execute function public.touch_updated_at();

-- Payments to staff (salary, advances, bonuses)
create table if not exists public.staff_payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  amount integer not null,
  paid_on date not null,
  kind text default 'advance', -- 'advance' | 'salary' | 'bonus'
  method text default '',
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists staff_payments_owner_updated_idx on public.staff_payments (owner_id, updated_at);
create index if not exists staff_payments_staff_idx on public.staff_payments (staff_id);

drop trigger if exists staff_payments_touch on public.staff_payments;
create trigger staff_payments_touch
  before update on public.staff_payments
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.staff enable row level security;
alter table public.staff_payments enable row level security;

drop policy if exists "staff_owner_all" on public.staff;
create policy "staff_owner_all"
  on public.staff for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "staff_payments_owner_all" on public.staff_payments;
create policy "staff_payments_owner_all"
  on public.staff_payments for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
