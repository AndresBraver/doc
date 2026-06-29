-- ============================================================
--  ESQUEMA SUPABASE - Clinica Recordatorios
--  Pegar TODO esto en Supabase > SQL Editor > Run
-- ============================================================

-- ---------- PERFILES DE STAFF (doctor / secretaria) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol text not null default 'doctor' check (rol in ('doctor','secretaria')),
  creado_en timestamptz default now()
);

-- Cuando se crea un usuario en auth, se crea su perfil automaticamente
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), 'doctor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- PACIENTES ----------
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_nacimiento date,
  edad int,
  sexo text check (sexo in ('male','female')),
  peso numeric(5,2),
  talla numeric(5,2),
  email text,
  telefono text,
  notas text,
  creado_por uuid references auth.users(id),
  creado_en timestamptz default now()
);

-- ---------- VACUNAS ----------
create table if not exists public.vacunas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  nombre text not null,
  fecha_aplicada date,
  proxima_dosis date,
  recordatorio_enviado boolean default false,
  creado_en timestamptz default now()
);

-- ---------- CITAS ----------
create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  fecha timestamptz not null,
  motivo text,
  recordatorio_enviado boolean default false,
  creado_en timestamptz default now()
);

-- indices utiles para el cron
create index if not exists idx_vacunas_proxima on public.vacunas(proxima_dosis) where recordatorio_enviado = false;
create index if not exists idx_citas_fecha on public.citas(fecha) where recordatorio_enviado = false;

-- ============================================================
--  ROW LEVEL SECURITY
--  (herramienta interna: cualquier staff logueado puede todo)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.pacientes enable row level security;
alter table public.vacunas   enable row level security;
alter table public.citas     enable row level security;

-- profiles: cada quien lee/edita el suyo
drop policy if exists "perfil propio" on public.profiles;
create policy "perfil propio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- pacientes / vacunas / citas: cualquier autenticado
drop policy if exists "staff total pacientes" on public.pacientes;
create policy "staff total pacientes" on public.pacientes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "staff total vacunas" on public.vacunas;
create policy "staff total vacunas" on public.vacunas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "staff total citas" on public.citas;
create policy "staff total citas" on public.citas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
