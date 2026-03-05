import { simulateCombat, Fighter } from "./combat.js";

const player: Fighter = {
    name: "Herói",
    hp: 120,
    stamina: 100,
    strength: 20,
    defense: 10,
    agility: 30, // Menos ágil
    accuracy: 60,
};

const orc: Fighter = {
    name: "Grom o Orque",
    hp: 100,
    stamina: 100,
    strength: 20,
    defense: 10,
    agility: 30, // Menos ágil
    accuracy: 60,
};

const elf: Fighter = {
    name: "Legolas o Elfo",
    hp: 80, // Menos HP
    stamina: 100,
    strength: 15, // Menos força bruta
    defense: 10,
    agility: 70, // Muito ágil, ataca primeiro
    accuracy: 90, // Alta precisão
};

async function run() {
    console.log("Iniciando Combate:");
    console.log(`Lutador 1: ${orc.name}`);
    console.log(`Lutador 2: ${elf.name}`);
    console.log("------------------------");

    const result = simulateCombat(orc, elf);
    console.log("Resultado da Batalha:");
    console.log(result.history.map(h => h.narrative).join('\n'));

    console.log("------------------------");
    console.log(`E o Vencedor foi: ${result.winner}!`);
}

run();
