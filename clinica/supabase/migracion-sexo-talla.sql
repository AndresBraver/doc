-- Ejecutar en Supabase > SQL Editor si YA tenias la tabla creada antes.
alter table public.pacientes add column if not exists sexo text check (sexo in ('male','female'));
alter table public.pacientes add column if not exists talla numeric(5,2);
