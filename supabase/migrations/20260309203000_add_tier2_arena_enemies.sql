-- Tier 2 da Arena: inimigos famosos do faroeste a partir do nível 20.
-- Mantém o Tier 1 intacto e substitui apenas a faixa de nível 20+.

delete from public.npc_enemies
where level >= 20;

insert into public.npc_enemies (id, name, level, hp_max, strength, agility, precision)
values
  ('b16b7e0d-8f68-4e9f-b95a-1d57553295ad', 'Billy the Kid, O Relampago', 20, 1280, 96, 92, 102),
  ('71bdf111-64cf-4b31-860e-650a42f7f13f', 'Jesse James, Sombra do Trem', 22, 1420, 108, 84, 98),
  ('7573f5da-8ad5-4e31-92a9-9a8e6dd63853', 'Doc Holliday, As de Sangue', 24, 1580, 118, 90, 112),
  ('93fe8d95-adc7-4cc4-b6aa-12df7f6eec8c', 'Annie Oakley, Mira Implacavel', 26, 1740, 116, 100, 124),
  ('c9f8a20b-6f30-418e-b4a2-6eb7e2f95f30', 'Butch Cassidy, Rei do Assalto', 28, 1920, 136, 92, 116),
  ('5e5f5d17-985f-44dc-bfe4-d58a8b05c2c4', 'Sundance Kid, Passo Fantasma', 30, 2100, 132, 112, 130),
  ('557f1808-7312-4a70-9a43-e2f4be92f684', 'Calamity Jane, Tempestade Escarlate', 32, 2320, 138, 118, 142),
  ('bf80f087-42bc-428d-a588-e33317e16e95', 'Wyatt Earp, Lei de Ferro', 35, 2680, 162, 122, 146)
on conflict (id) do update
set
  name = excluded.name,
  level = excluded.level,
  hp_max = excluded.hp_max,
  strength = excluded.strength,
  agility = excluded.agility,
  precision = excluded.precision;
