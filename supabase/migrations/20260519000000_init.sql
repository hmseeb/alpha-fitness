-- Alpha Fitness initial schema
-- UUID PKs for clean offline sync, soft-delete + updated_at for LWW conflict resolution

create extension if not exists "pgcrypto";

-- Generic updated_at trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Students
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sr_no integer,
  photo_path text,
  name text not null,
  contact text default '',
  time_table text default 'Evening',
  fees integer default 0,
  month text default '',
  reg_fee_status text default 'Nill',
  entry_date date,
  next_fees_date date,
  membership text default 'Normal',
  paid_through text default '',
  remaining integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists students_owner_updated_idx on public.students (owner_id, updated_at);
create index if not exists students_owner_deleted_idx on public.students (owner_id, deleted_at);

drop trigger if exists students_touch on public.students;
create trigger students_touch
  before update on public.students
  for each row execute function public.touch_updated_at();

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount integer not null,
  paid_on date not null,
  method text default '',
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists payments_owner_updated_idx on public.payments (owner_id, updated_at);
create index if not exists payments_student_idx on public.payments (student_id);

drop trigger if exists payments_touch on public.payments;
create trigger payments_touch
  before update on public.payments
  for each row execute function public.touch_updated_at();

-- RLS: owner can only see their own data
alter table public.students enable row level security;
alter table public.payments enable row level security;

drop policy if exists "students_owner_all" on public.students;
create policy "students_owner_all"
  on public.students
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "payments_owner_all" on public.payments;
create policy "payments_owner_all"
  on public.payments
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Storage bucket for student photos (private, owner-scoped via RLS)
insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', false)
on conflict (id) do nothing;

drop policy if exists "photos_owner_read" on storage.objects;
create policy "photos_owner_read"
  on storage.objects for select
  using (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_owner_write" on storage.objects;
create policy "photos_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_owner_update" on storage.objects;
create policy "photos_owner_update"
  on storage.objects for update
  using (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "photos_owner_delete" on storage.objects;
create policy "photos_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'student-photos' and (storage.foldername(name))[1] = auth.uid()::text);
