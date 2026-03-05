// combat.ts — Fase 2: Motor Narrativo de Storytelling

export interface Fighter {
    name: string;
    hp: number;
    stamina: number;
    strength: number;
    defense: number;
    agility: number;
    accuracy: number;
    weaponName?: string;
}

export interface NarrativeTurn {
    turn: number;
    attacker: string;
    defender: string;
    action: string;
    narrative: string;
    damage: number;
    resultHp: number;
    isCritical: boolean;
    isMiss: boolean;
}

export interface CombatResult {
    winner: string;
    history: NarrativeTurn[];
}

const TARGETS = [
    { name: 'Cabeça', chance: 0.08, multiplier: 5.0 },
    { name: 'Peito', chance: 0.55, multiplier: 1.8 },
    { name: 'Barriga', chance: 0.22, multiplier: 1.3 },
    { name: 'Membros', chance: 0.15, multiplier: 0.8 },
];

const STAMINA_COST_ATTACK = 18;
const MAX_TURNS = 60;

const NARRATIVE_TEMPLATES = {
    miss: [
        "{attacker} desfere um golpe lateral pesado, mas {defender} salta para trás no último segundo. A {weapon} corta apenas o vento gélido da arena.",
        "{attacker} avança bruscamente, porém seus passos são previsíveis. {defender} esquiva e observa a lâmina passar a centímetros de seu rosto.",
        "Um estrondo de aço! A {weapon} de {attacker} raspa contra a armadura de {defender}, soltando um feixe de faíscas, contudo não encontra carne.",
        "Com a poeira subindo sob seus pés, {attacker} ataca com fúria. {defender} antecipa o movimento e desvia agilmente para o flanco cego.",
        "A lâmina traidora de {attacker} assobia pelo ar, mas o puro instinto de {defender} evita que a investida machuque."
    ],
    hit: [
        "{attacker} avança em uma investida rápida e perfura o {bodyPart} de {defender}. Um filete de sangue escuro logo mancha a cota de malha (-{damage} HP).",
        "O som do metal cortando a carne ecoa! A {weapon} rasga levemente o {bodyPart} de {defender}, arrancando um grito rouco (-{damage} HP).",
        "{attacker} encontra uma brecha na defesa vacilante de {defender} e golpeia sem piedade o {bodyPart} (-{damage} HP).",
        "O impacto faz {defender} cambalear grosseiramente para trás. A {weapon} deixou um feio rastro de dor e sangue em seu {bodyPart} (-{damage} HP)."
    ],
    critical: [
        "UM GOLPE DEVASTADOR! A {weapon} de {attacker} esmaga implacavelmente contra o {bodyPart} de {defender} com um estalo brutal. A arena inteira prende a respiração! (-{damage} HP CRÍTICO!)",
        "CARNIFICINA ABSOLUTA! {attacker} atinge com maestria letal o {bodyPart} de {defender}. Um jorro carmesim escurece a terra batida e a dor é inimaginável! (-{damage} HP CRÍTICO!)",
        "PERFEIÇÃO E MORTE! O golpe fende o ar e rasga o {bodyPart} de {defender}, ignorando qualquer armadura e quebrando ossos. Um ataque para os pergaminhos! (-{damage} HP CRÍTICO!)"
    ],
    rest: [
        "Apoiando o peso de seu corpo num dos joelhos, {attacker} respira pesadamente, limpando o suor e o sangue que escorrem de sua testa.",
        "O peito de {attacker} sobe e desce rápido; uma pausa tática é tomada. O vento frio beija a arena enquanto o fôlego é recuperado.",
        "Cada músculo queimando, {attacker} engole em seco e afasta o peso do cansaço, adotando uma guarda conservadora."
    ]
};

function interpolate(template: string, vars: any) {
    return template.replace(/{(\w+)}/g, (match, key) => vars[key] || match);
}

function getRandomTarget() {
    const random = Math.random();
    let cumulative = 0;
    for (const target of TARGETS) {
        cumulative += target.chance;
        if (random <= cumulative) return target;
    }
    return TARGETS[TARGETS.length - 1];
}

function getRandomTemplate(type: keyof typeof NARRATIVE_TEMPLATES) {
    const templates = NARRATIVE_TEMPLATES[type];
    return templates[Math.floor(Math.random() * templates.length)];
}

export function simulateCombat(fighter1: Fighter, fighter2: Fighter): CombatResult {
    const f1 = { ...fighter1, stamina: 100, weaponName: fighter1.weaponName || 'lâmina' };
    const f2 = { ...fighter2, stamina: 90, weaponName: fighter2.weaponName || 'arma' };

    let attacker = f1.agility >= f2.agility ? f1 : f2;
    let defender = attacker === f1 ? f2 : f1;
    const history: NarrativeTurn[] = [];
    let turn = 1;

    while (f1.hp > 0 && f2.hp > 0 && turn <= MAX_TURNS) {
        let damage = 0;
        let isMiss = false;
        let isCritical = false;
        let narrative = "";

        if (attacker.stamina < 20) {
            attacker.stamina += 40;
            narrative = interpolate(getRandomTemplate('rest'), { attacker: attacker.name });
        } else {
            let hitChance = 55 + (attacker.accuracy - defender.agility);
            hitChance = Math.max(20, Math.min(95, hitChance));

            attacker.stamina -= STAMINA_COST_ATTACK;
            const target = getRandomTarget();

            if (Math.random() * 100 > hitChance) {
                isMiss = true;
                narrative = interpolate(getRandomTemplate('miss'), {
                    attacker: attacker.name,
                    defender: defender.name,
                    weapon: attacker.weaponName,
                    bodyPart: target.name.toLowerCase()
                });
            } else {
                const rawBase = attacker.strength * 2.2 - defender.defense * 1.1;
                const baseDamage = Math.max(5, rawBase + (Math.random() * 6 - 3));
                damage = Math.floor(baseDamage * target.multiplier);
                isCritical = target.name === 'Cabeça';

                defender.hp = Math.max(0, defender.hp - damage);

                const templateType = isCritical ? 'critical' : 'hit';
                narrative = interpolate(getRandomTemplate(templateType), {
                    attacker: attacker.name,
                    defender: defender.name,
                    weapon: attacker.weaponName,
                    bodyPart: target.name.toLowerCase(),
                    damage: damage
                });
            }
        }

        history.push({
            turn,
            attacker: attacker.name,
            defender: defender.name,
            action: narrative, // backward compatibility
            narrative,
            damage,
            resultHp: defender.hp,
            isCritical,
            isMiss
        });

        if (defender.hp <= 0) break;

        [attacker, defender] = [defender, attacker];
        turn++;
    }

    return {
        winner: f1.hp > 0 ? f1.name : (f2.hp > 0 ? f2.name : 'Empate'),
        history
    };
}
