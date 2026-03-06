-- Adiciona controle server-driven de regeneração de energia.
alter table if exists public.profiles
add column if not exists energy_last_regen_at timestamptz;

-- Inicializa para perfis já existentes.
update public.profiles
set energy_last_regen_at = coalesce(energy_last_regen_at, now())
where energy_last_regen_at is null;

-- Garante valor padrão para novos registros.
alter table if exists public.profiles
alter column energy_last_regen_at set default now();
