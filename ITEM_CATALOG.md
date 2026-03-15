# 📖 Guia de Itens e Conhecimento: Far West

Este documento é a referência definitiva para o sistema de itens, imagens e progressão no mundo de Far West. Ele deve ser utilizado por desenvolvedores e agentes de IA para entender o contexto do jogo.

---

## 🤠 1. Arquétipos e Armas
A classificação de armas é baseada no arquétipo do conjunto de itens.

| Arquétipo | Tipo de Arma | Imagem Associada | Foco de Atributos |
| :--- | :--- | :--- | :--- |
| **Agile** | Revólver | Revólveres / Pistolas | Agilidade & Precisão |
| **Tank** | Escopeta | Escopetas / Cano Serrado | Força & Vigor |
| **Lawman** | Carabina | Rifles / Carabinas | Equilíbrio Central |

---

## ✨ 2. Sistema de Imagens (Regras de Unicidade)
Implementamos um sistema de **Unicidade Visual Absoluta**:
- **Nenhuma imagem se repete**: Cada arquivo em `public/images/items` possui um Hash MD5 único.
- **Tipagem Rígida**: Uma imagem de arma nunca será usada para uma bota, e vice-versa.
- **Qualidade sobre Quantidade**: Se não houver uma imagem visualmente única e de alta qualidade disponível para um slot específico, o item permanecerá sem imagem para ser preenchido manualmente, garantindo a integridade visual do jogo.

---

## 🛡️ 3. Conjuntos Épicos e Lendários
Os conjuntos foram desenhados para refletir a lore do deserto.

### 🔴 Duelista Carmesim (Épico)
- **Arquétipo**: Agile
- **Arma**: Revólver Curto (Manual Override)
- **Lore**: Mestres de duelo ao amanhecer, famosos por golpes críticos rápidos.

### ⭐ Xerife Lendário (Lendário)
- **Arquétipo**: Lawman
- **Arma**: Rifle de Precisão (Manual Override)
- **Lore**: Relíquias do último Alto Xerife, símbolo supremo de autoridade.

### 🐺 Lobo da Tempestade (Lendário)
- **Arquétipo**: Tank
- **Arma**: Escopeta de Sal (Manual Override)
- **Lore**: Armaduras forjadas nas tormentas de sal para guerras de atrito.

---

## 📊 4. Atributos e Progressão
Os itens escalam com o nível do jogador e raridade.
- **Strength**: Dano de Tank e Requisito de Armadura Pesada.
- **Agility**: Dano de Agile e Esquiva.
- **Accuracy**: Dano de Lawman e Chance Crítica.
- **Vigor**: Pontos de Vida (HP) Totais.
- **Máscaras**: Slot de rosto (tapa-olhos e lenços). Substitui os antigos shields/bracadeiras.

---

## 🎒 5. Itens Especiais
- **Relíquias**: Proporcionam bônus passivos de Ouro e Drop (ex: Moeda do Diabo, Pepita de Sangue).
- **Consumíveis**: Recuperação instantânea de HP e Energia.

---
*Documento gerado automaticamente para garantir a consistência do projeto.*
