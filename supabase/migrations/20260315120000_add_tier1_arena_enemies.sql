-- Tier 1 da Arena: inimigos sem retrato, cobrindo niveis 1-19 para conectar com o Tier 2.
-- Substitui apenas a faixa de nivel < 20.

delete from public.npc_enemies
where level < 20;

insert into public.npc_enemies (id, name, level, hp_max, strength, agility, precision)
values
  ('11075d02-9862-4474-961a-a6ff02afcd76', 'Batedor de Saloon', 1, 170, 12, 11, 11),
  ('ebe2c05e-06e5-4cfd-8f1a-c2667a5fefeb', 'Contrabandista do Vale', 3, 260, 18, 16, 17),
  ('fecb0585-d5d1-47f3-9ff5-7fc51d28d39b', 'Bandido da Ravina', 5, 360, 25, 22, 23),
  ('dd625288-512c-470c-b77b-3ca935428669', 'Esporo do Deserto', 7, 480, 32, 29, 30),
  ('6b7e0d26-1fae-4366-8a2a-459104ad81b9', 'Atirador da Poeira', 9, 620, 40, 36, 38),
  ('cadf1ae1-226f-420f-af5c-4ab4a9837932', 'Pistoleiro de Fronteira', 11, 780, 50, 45, 48),
  ('81b31d93-5067-4bdc-8144-b5e3eb1a133d', 'Foragido das Montanhas', 13, 940, 60, 54, 58),
  ('d543360c-a73c-4fc9-8371-a0524659c80f', 'Carrasco da Estrada', 15, 1100, 70, 63, 68),
  ('cd6fd196-e431-4789-9f9f-c5d30041fec0', 'Cacador de Recompensas Sombrio', 17, 1200, 82, 76, 84),
  ('e4223936-fc17-4f23-ba9e-801adc347e93', 'Tenente do Abismo', 19, 1240, 90, 84, 94)
on conflict (id) do update
set
  name = excluded.name,
  level = excluded.level,
  hp_max = excluded.hp_max,
  strength = excluded.strength,
  agility = excluded.agility,
  precision = excluded.precision;
