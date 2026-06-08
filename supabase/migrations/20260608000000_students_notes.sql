-- Add free-form notes to students (mirrors staff.notes)
alter table public.students
  add column if not exists notes text default '';
