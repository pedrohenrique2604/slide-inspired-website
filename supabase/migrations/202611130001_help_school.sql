-- Help School: schema inicial Supabase/PostgreSQL
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  class_year smallint check (class_year between 5 and 9),
  created_at timestamptz not null default now()
);
create table if not exists public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('student','teacher','director'))
);
create table if not exists public.school_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text generated always as (lower(trim(name))) stored unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.school_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('meal','exam','event','lost','video_staff','video_student')),
  title text not null,
  description text,
  class_year smallint check (class_year between 5 and 9),
  event_date date,
  category text,
  image_url text,
  youtube_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.class_tasks (
  id uuid primary key default gen_random_uuid(),
  class_year smallint not null check (class_year between 5 and 9),
  subject text not null,
  deadline date not null,
  description text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.school_grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_year smallint not null check (class_year between 5 and 9),
  subject text not null,
  score numeric(4,2) not null check (score between 0 and 10),
  period_type text not null,
  period_number smallint not null check (period_number between 1 and 24),
  active_year smallint not null default extract(year from now())::smallint,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.school_grading_settings (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('Bimestre','Trimestre','Semestre','Mensal','Anual','Personalizado')),
  total_periods smallint not null check (total_periods between 1 and 24),
  active_year smallint not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create or replace function public.has_school_role(allowed text[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = any(allowed)) $$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.school_subjects enable row level security;
alter table public.school_entries enable row level security;
alter table public.class_tasks enable row level security;
alter table public.school_grades enable row level security;
alter table public.school_grading_settings enable row level security;

-- Profile: students can read/update only their own profile; staff can read school profiles.
create policy "profile self read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_school_role(array['teacher','director']));
create policy "profile self update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "staff create profiles" on public.profiles for insert to authenticated with check (public.has_school_role(array['director','teacher']));
create policy "roles self or staff read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_school_role(array['teacher','director']));
create policy "director manage roles" on public.user_roles for all to authenticated using (public.has_school_role(array['director'])) with check (public.has_school_role(array['director']));

-- Public read is limited to public-facing school content.
create policy "public read school entries" on public.school_entries for select to anon, authenticated using (kind in ('meal','exam','event','lost','video_staff','video_student'));
create policy "community create lost and student videos" on public.school_entries for insert to anon, authenticated with check (kind in ('lost','video_student'));
create policy "staff manage school entries" on public.school_entries for all to authenticated using (public.has_school_role(array['teacher','director'])) with check (public.has_school_role(array['teacher','director']));
create policy "public read class tasks" on public.class_tasks for select to anon, authenticated using (true);
create policy "staff manage class tasks" on public.class_tasks for all to authenticated using (public.has_school_role(array['teacher','director'])) with check (public.has_school_role(array['teacher','director']));

-- A student sees only their own grades. Staff can manage all grades.
create policy "student own grades read" on public.school_grades for select to authenticated using (student_id = auth.uid() or public.has_school_role(array['teacher','director']));
create policy "staff manage grades" on public.school_grades for all to authenticated using (public.has_school_role(array['teacher','director'])) with check (public.has_school_role(array['teacher','director']));

create policy "authenticated read subjects" on public.school_subjects for select to authenticated using (true);
create policy "staff manage subjects" on public.school_subjects for all to authenticated using (public.has_school_role(array['teacher','director'])) with check (public.has_school_role(array['teacher','director']));
create policy "authenticated read grading settings" on public.school_grading_settings for select to authenticated using (true);
create policy "director manage grading settings" on public.school_grading_settings for all to authenticated using (public.has_school_role(array['director'])) with check (public.has_school_role(array['director']));

create index if not exists school_grades_student_year_idx on public.school_grades(student_id, active_year);
create index if not exists school_entries_kind_date_idx on public.school_entries(kind, event_date);
create index if not exists class_tasks_year_deadline_idx on public.class_tasks(class_year, deadline);

insert into public.school_subjects(name) values
 ('Português'),('Matemática'),('Ciências'),('História'),('Geografia'),('Inglês'),('Educação Física'),('Arte')
on conflict do nothing;

-- IMPORTANTE: usuários e senhas de demonstração não são criados por SQL.
-- Crie Auth users por Edge Function com service_role e depois insira profiles/user_roles.
