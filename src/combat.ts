// combat.ts - Motor narrativo de duelo no faroeste

export interface Fighter {
    name: string;
    hp: number;
    strength: number;
    defense: number;
    agility: number;
    accuracy: number;
    minDamage: number;
    maxDamage: number;
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
    { name: 'Cabeça', chance: 0.05, multiplier: 3.5, gender: 'f', plural: false },
    { name: 'Peito', chance: 0.45, multiplier: 1.4, gender: 'm', plural: false },
    { name: 'Barriga', chance: 0.10, multiplier: 1.1, gender: 'f', plural: false },
    { name: 'Braços', chance: 0.20, multiplier: 0.8, gender: 'm', plural: true },
    { name: 'Pernas', chance: 0.20, multiplier: 0.7, gender: 'f', plural: true },
];

const MAX_TURNS = 60;

const NARRATIVE_TEMPLATES = {
    firearm_miss: [
        "{attacker} dispara, mas a bala raspa o vento.",
        "{defender} mergulha na terra e escapa do tiro.",
        "O tiro de {weapon} acerta apenas a poeira.",
        "{attacker} erra o alvo; {defender} mantém a calma."
    ],
    melee_miss: [
        "{attacker} golpeia com {weapon}, mas erra por pouco.",
        "{defender} recua e a lâmina corta o ar.",
        "{attacker} avança, mas {defender} esquiva no tempo certo.",
        "O golpe de {weapon} passa no vazio."
    ],
    beast_miss: [
        "{attacker} salta, mas {defender} rola para o lado.",
        "O bote de {attacker} encontra apenas o ar.",
        "{attacker} avança soltando um rosnado, mas erra o alvo.",
        "{defender} se esquiva das garras de {attacker}."
    ],
    firearm_hit: [
        "{attacker} acerta {art_def} {bodyPart} com {weapon}.",
        "Tiro certeiro {art_prep} {bodyPart} de {defender}.",
        "{weapon} encontra {art_def} {bodyPart} de {defender}.",
        "{attacker} perfura {art_def} {bodyPart} com chumbo."
    ],
    melee_hit: [
        "Corte seco! {attacker} atinge {art_def} {bodyPart} com {weapon}.",
        "{attacker} rasga {art_def} {bodyPart} de {defender}.",
        "{weapon} corta {art_def} {bodyPart} de {defender}.",
        "{attacker} conecta um golpe {art_prep} {bodyPart}."
    ],
    beast_hit: [
        "{attacker} crava as presas {art_prep} {bodyPart} de {defender}!",
        "{attacker} dilacera {art_def} {bodyPart} de {defender} com as garras.",
        "O bote atinge {art_def} {bodyPart}! {attacker} morde com força.",
        "{attacker} atinge {art_def} {bodyPart} em um salto furioso."
    ],
    firearm_crit: [
        "NO OLHO! {attacker} acerta {art_def} {bodyPart} com precisão fatal!",
        "TIRO MORTAL! {weapon} explode {art_def} {bodyPart}!",
        "{attacker} finaliza com chumbo {art_prep} {bodyPart}!"
    ],
    melee_crit: [
        "GOLPE LETAL! {attacker} crava {weapon} {art_prep} {bodyPart}!",
        "VIOLÊNCIA PURA! O corte {art_prep} {bodyPart} é profundo!",
        "{attacker} dilacera {art_def} {bodyPart} de {defender}!"
    ],
    beast_crit: [
        "ATAQUE VISCERAL! {attacker} estraçalha {art_def} {bodyPart}!",
        "MORDIDA FATAL! {attacker} trava a mandíbula {art_prep} {bodyPart}!",
        "{attacker} derruba {defender} e ataca {art_def} {bodyPart} com fúria!"
    ]
};

function capitalize(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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

function isFirearm(weaponName: string): boolean {
    const meleeKeywords = ['faca', 'punhal', 'canivete', 'punho', 'machado', 'lâmina', 'baioneta', 'cutelo', 'adaga', 'falcão', 'espada', 'garras', 'mordida', 'presas'];
    const name = weaponName.toLowerCase();
    return !meleeKeywords.some(kw => name.includes(kw));
}

function isBeast(name: string): boolean {
    const beasts = ['coiote', 'lobo', 'urso', 'serpente', 'puma', 'jacaré', 'cão'];
    const lower = name.toLowerCase();
    return beasts.some(b => lower.includes(b));
}

export function simulateCombat(fighter1: Fighter, fighter2: Fighter): CombatResult {
    const f1IsBeast = isBeast(fighter1.name);
    const f2IsBeast = isBeast(fighter2.name);

    const f1 = {
        ...fighter1,
        name: capitalize(fighter1.name),
        weaponName: f1IsBeast ? 'garras e presas' : (fighter1.weaponName || 'revólver')
    };
    const f2 = {
        ...fighter2,
        name: capitalize(fighter2.name),
        weaponName: f2IsBeast ? 'garras e presas' : (fighter2.weaponName || 'faca')
    };

    let attacker = f1.agility >= f2.agility ? f1 : f2;
    let defender = attacker === f1 ? f2 : f1;
    const history: NarrativeTurn[] = [];
    let turn = 1;

    while (f1.hp > 0 && f2.hp > 0 && turn <= MAX_TURNS) {
        let damage = 0;
        let isMiss = false;
        let isCritical = false;
        let narrative = "";

        const attackerIsBeast = isBeast(attacker.name);

        let hitChance = 55 + (attacker.accuracy - defender.agility);
        hitChance = Math.max(20, Math.min(95, hitChance));

        const target = getRandomTarget();
        const hasGun = !attackerIsBeast && isFirearm(attacker.weaponName || '');

        // Gramática
        const artDef = target.gender === 'f' ? (target.plural ? 'as' : 'a') : (target.plural ? 'os' : 'o');
        const artPrep = target.gender === 'f' ? (target.plural ? 'nas' : 'na') : (target.plural ? 'nos' : 'no');

        const isNarrativeAction = Math.random() < 0.12;

        if (isNarrativeAction) {
            let actions;
            if (attackerIsBeast) {
                actions = [
                    "{attacker} rosna baixo, mostrando as presas.",
                    "{attacker} circula {defender}, procurando uma abertura.",
                    "{attacker} solta um uivo curto e agressivo.",
                    "{attacker} arranha o chão, preparando o bote."
                ];
            } else {
                actions = hasGun ? [
                    "{attacker} gira o tambor do revólver.",
                    "{attacker} ajusta o chapéu e foca em {defender}.",
                    "{attacker} mantém a mão firme no coldre.",
                    "{attacker} cospe de lado e encara o alvo."
                ] : [
                    "{attacker} testa o fio da lâmina.",
                    "{attacker} gira {weapon} na mão.",
                    "{attacker} respira fundo, medindo o bote.",
                    "{attacker} encara {defender} com sangue nos olhos."
                ];
            }
            const action = actions[Math.floor(Math.random() * actions.length)];
            narrative = interpolate(action, { attacker: attacker.name, defender: defender.name, weapon: attacker.weaponName });
        } else if (Math.random() * 100 > hitChance) {
            isMiss = true;
            let templates;
            if (attackerIsBeast) {
                templates = NARRATIVE_TEMPLATES.beast_miss;
            } else {
                templates = hasGun ? NARRATIVE_TEMPLATES.firearm_miss : NARRATIVE_TEMPLATES.melee_miss;
            }

            narrative = interpolate(templates[Math.floor(Math.random() * templates.length)], {
                attacker: attacker.name,
                defender: defender.name,
                weapon: attacker.weaponName,
                bodyPart: target.name.toLowerCase(),
                art_def: artDef,
                art_prep: artPrep
            });
        } else {
            const rawBase = attacker.minDamage + Math.random() * (attacker.maxDamage - attacker.minDamage);
            const defenderDefense = defender.defense * 0.15;
            let finalDamage = Math.max(5, rawBase - defenderDefense);

            const isGraze = Math.random() < 0.18;
            if (isGraze) {
                finalDamage = Math.floor(finalDamage * 0.5);
                damage = finalDamage;
                let grazeMsg;
                if (attackerIsBeast) {
                    grazeMsg = "{attacker} arranha {art_def} {bodyPart} de raspão.";
                } else {
                    grazeMsg = hasGun ? "TIRO DE RASPÃO! Pegou {art_prep} {bodyPart}." : "CORTE SUPERFICIAL! Atingiu {art_def} {bodyPart}.";
                }

                narrative = interpolate(grazeMsg, {
                    attacker: attacker.name,
                    defender: defender.name,
                    bodyPart: target.name.toLowerCase(),
                    damage: finalDamage,
                    art_def: artDef,
                    art_prep: artPrep
                });
                defender.hp = Math.max(0, defender.hp - damage);
            } else {
                damage = Math.floor(finalDamage * target.multiplier);
                isCritical = target.name === 'Cabeça';
                defender.hp = Math.max(0, defender.hp - damage);

                let templates;
                if (attackerIsBeast) {
                    templates = isCritical ? NARRATIVE_TEMPLATES.beast_crit : NARRATIVE_TEMPLATES.beast_hit;
                } else {
                    if (isCritical) {
                        templates = hasGun ? NARRATIVE_TEMPLATES.firearm_crit : NARRATIVE_TEMPLATES.melee_crit;
                    } else {
                        templates = hasGun ? NARRATIVE_TEMPLATES.firearm_hit : NARRATIVE_TEMPLATES.melee_hit;
                    }
                }

                narrative = interpolate(templates[Math.floor(Math.random() * templates.length)], {
                    attacker: attacker.name,
                    defender: defender.name,
                    weapon: attacker.weaponName,
                    bodyPart: target.name.toLowerCase(),
                    damage: damage,
                    art_def: artDef,
                    art_prep: artPrep
                });
            }
        }

        history.push({
            turn,
            attacker: attacker.name,
            defender: defender.name,
            action: narrative,
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
