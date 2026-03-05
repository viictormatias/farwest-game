# Project Status - Velmora

## 1. Estado Atual
Projeto em fase avancada com UI dark medieval e mecanicas centrais no estilo Souls-like ja integradas.

O game agora combina:
- onboarding com planejamento de build
- sistema de equipamentos multi-slot
- combate com calculos de carga, requisitos e escalonamento
- base pronta para retratos de classe gerados por IA

## 2. Funcionalidades Implementadas

### Core Souls-like
- Motor de calculo em `src/lib/soulslike.ts` com:
  - `equip load` maximo e atual
  - tiers de mobilidade (`light`, `medium`, `heavy`, `overloaded`)
  - bonus de esquiva e penalidade de stamina por tier
  - `attack rating` por scaling de arma
  - penalidade por requisito nao atendido

### Combate
- `ArenaTab` atualizado para consumir estatisticas derivadas do sistema Souls-like.
- Painel de combate agora exibe estado da carga e alertas de requisito faltando.

### Inventario e Equipamentos
- Paperdoll ampliado para:
  - arma
  - escudo
  - capacete
  - peitoral
  - luvas
  - calcas
  - botas
- Equipar respeita tipo de slot e requisitos do item.

### Itens e Loja
- Catalogo de itens expandido com:
  - `weight`
  - `requirements`
  - `scaling`
  - novos tipos de item
- Loja com filtros por todos os slots e informacoes detalhadas de build.
- Itens adicionados:
  - 5 `helmet`
  - 5 `gloves`
  - 5 `legs`
  - 5 `boots`
  - peitorais existentes convertidos para tipo `chest`

### Onboarding de Personagem
- Criacao de personagem com distribuicao inicial de status.
- Regras:
  - 8 pontos totais obrigatorios
  - maximo 4 por atributo
  - validacao dupla (frontend/backend)
- Presets competitivos:
  - Balanceada
  - Forca
  - Destreza
  - Tanque

### Google AI / Nano Banana
- API key validada e modelos disponiveis consultados.
- Script de geracao de retratos criado (`scripts/generate-class-images.mjs`).
- Integracao visual pronta na tela de classes (`/classes/*.png`).
- Fallback de imagem implementado em `CharacterPortrait`.

## 3. Bloqueios Conhecidos
- Geracao de imagem via Gemini/Nano Banana bloqueada por quota:
  - `HTTP 429 RESOURCE_EXHAUSTED`
  - limite free tier atual em `0` para modelos de imagem
- Para desbloquear: habilitar billing/quota no Google AI Studio/Cloud.

## 4. Qualidade Tecnica
- `npx tsc --noEmit` passando para as alteracoes recentes.
- Existem warnings/erros de lint preexistentes no projeto em arquivos antigos.

## 5. Proximos Passos Sugeridos
1. Ativar quota de imagem no Google AI e rodar `node scripts/generate-class-images.mjs`.
2. Balancear curva de progressao por classe (soft caps e custo por level).
3. Persistir no banco metricas de build derivadas (ex.: attack rating e equip tier) para analytics.
4. Revisar lint legacy para reduzir ruido tecnico nas proximas sprints.
