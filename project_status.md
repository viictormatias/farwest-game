### Estado Atual do Projeto
O projeto foi estabilizado com um sistema de **Resiliência de Inicialização**, um novo **Rastreador de Trabalho Global**, localização completa da interface para PT-BR e um motor narrativo específico para feras.

### Funcionalidades Implementadas
1. **Sistema Narrativo de Feras:** Inimigos animais (como o Coiote) agora usam textos de combate específicos: **mordidas, botes, rosnados e garras**, em vez de armas de fogo ou ações humanas.
2. **Localização de Atributos:** Termos técnicos como `hp_current` e `energy` foram traduzidos para **Vida** e **Energia** em todos os menus (Loja, Inventário, Lightbox).
3. **Diferenciação de Cores no Combate:** O log de duelo agora usa cores distintas para o jogador (Dourado) e inimigo (Laranja-Avermelhado), com visuais de **Dano Crítico** animados.
4. **Rastreador de Trabalho Persistente:** Card no `Header` mostra o progresso da missão em tempo real com notificações de aba ("✅ TRABALHO CONCLUÍDO!").
5. **Ambientação Dinâmica:** Fundo global que muda conforme a aba ativa, e fundo específico para duelos contra o Coiote.
6. **Legibilidade e Acessibilidade:** Baseline de fonte 16px e cursor interativo em todos os botões e seletores.

### Pendências Imediatas
1. Validar se novos tipos de animais precisam ser adicionados ao filtro do motor narrativo.

### Próximos Passos Sugeridos
- Implementar sistema de "Bounty Hunting" (Wanted List).
- Adicionar sons ambientais de Velho Oeste.
- Expandir o catálogo de predadores (Lobos, Ursos, Pumas).
