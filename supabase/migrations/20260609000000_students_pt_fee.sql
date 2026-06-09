-- Add personal-trainer fee to students (sits alongside the monthly membership fee)
alter table public.students
  add column if not exists pt_fee integer not null default 0;
