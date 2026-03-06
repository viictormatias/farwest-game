import { simulateCombat, Fighter } from './combat'
import { deriveSoulsStats } from './lib/soulslike'
import { ITEMS } from './lib/items'

// Mock Profile for simulation
const createProfile = (level: number, stats: any) => ({
    id: 'test-user',
    level,
    xp: 0,
    gold: 0,
    hp_max: 100 + (stats.vigor - 5) * 10,
    hp_current: 100 + (stats.vigor - 5) * 10,
    energy: 100,
    strength: stats.strength || 5,
    defense: stats.defense || 5,
    agility: stats.agility || 5,
    accuracy: stats.accuracy || 5,
    vigor: stats.vigor || 5,
    class: 'Pistoleiro'
})

const runSim = (name: string, p1: any, p2: any, weaponId?: string) => {
    const weapon = weaponId ? ITEMS.find(it => it.id === weaponId) : null
    const equipped = weapon ? [{ ...weapon, is_equipped: true, item_id: weapon.id }] : []

    const souls1 = deriveSoulsStats(p1, equipped as any)

    const f1: Fighter = {
        name: 'Player',
        hp: p1.hp_max,
        strength: souls1.attackRating,
        minDamage: souls1.minDamage,
        maxDamage: souls1.maxDamage,
        defense: p1.defense + souls1.bonuses.defense,
        agility: p1.agility + souls1.bonuses.agility,
        accuracy: p1.accuracy + souls1.bonuses.accuracy,
        weaponName: weapon?.name || 'Punhos'
    }

    const f2: Fighter = {
        name: p2.name,
        hp: p2.hp_max,
        strength: p2.strength,
        minDamage: Math.floor(p2.strength * 0.8),
        maxDamage: Math.floor(p2.strength * 1.2),
        defense: p2.defense,
        agility: p2.agility,
        accuracy: p2.accuracy,
        weaponName: 'Garra/Arma'
    }

    const result = simulateCombat(f1, f2)
    const win = result.winner === 'Player'
    console.log(`[${name}] Result: ${win ? 'WIN' : 'LOSS'} (${result.history.length} turns)`)
    if (result.history.length > 0) {
        const last = result.history[result.history.length - 1]
        console.log(`   Final HP: Player ${f1.hp} | Enemy ${f2.hp}`)
    }
}

console.log("--- COMBAT BALANCE SIMULATION ---")

// Scenario 1: Level 1 vs Scorpion (Low level enemy)
const pLvl1 = createProfile(1, { strength: 7, defense: 6, agility: 12, accuracy: 12, vigor: 6 })
const enemyScorpion = { name: 'Escorpiao', hp_max: 45, strength: 8, defense: 3, agility: 8, accuracy: 8 }
runSim("Lvl 1 vs Scorpion (No Weapon)", pLvl1, enemyScorpion)

// Scenario 2: Level 1 vs Scorpion with Rusty Dagger
runSim("Lvl 1 vs Scorpion (Rusty Dagger)", pLvl1, enemyScorpion, 'rusty_dagger')

// Scenario 3: Level 10 vs Outlaw (Mid level)
// At level 10, player has 27 extra points (3 per level)
const pLvl10 = createProfile(10, { strength: 15, defense: 10, agility: 20, accuracy: 20, vigor: 12 })
const enemyOutlaw = { name: 'Foragido', hp_max: 180, strength: 25, defense: 15, agility: 15, accuracy: 18 }
runSim("Lvl 10 vs Outlaw (Short Revolver)", pLvl10, enemyOutlaw, 'short_revolver')

// Scenario 4: Level 20 vs Boss Character
const pLvl20 = createProfile(20, { strength: 25, defense: 20, agility: 30, accuracy: 35, vigor: 20 })
const enemyBoss = { name: 'Lenda do Mal', hp_max: 600, strength: 50, defense: 35, agility: 25, accuracy: 40 }
runSim("Lvl 20 vs Boss (Duelist Revolver)", pLvl20, enemyBoss, 'duelist_revolver')

// Scenario 5: High Strength Build vs Tank Enemy
const pStrBuild = createProfile(15, { strength: 40, defense: 15, agility: 10, accuracy: 15, vigor: 15 })
const enemyTank = { name: 'Bruto de Bar', hp_max: 400, strength: 30, defense: 40, agility: 5, accuracy: 15 }
runSim("STR Build vs Tank (Sawed Off)", pStrBuild, enemyTank, 'sawed_off')
