'use client'

import { Profile } from '@/lib/gameActions'
import StatBar from './StatBar'
import CharacterPortrait from './CharacterPortrait'

// Derivar classe do personagem baseada no nível
function getPlayerClass(level: number): string {
    if (level < 5) return 'Recruta'
    if (level < 10) return 'Guerreiro'
    if (level < 20) return 'Veterano'
    if (level < 35) return 'Lendário'
    return 'Campeão Eterno'
}

// XP necessário para o próximo nível (fórmula simples)
function xpForNextLevel(level: number): number {
    return level * 100
}

export default function Header({ profile }: { profile: Profile }) {
    const playerClass = getPlayerClass(profile.level)
    const xpNeeded = xpForNextLevel(profile.level)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3a3a3a] shadow-2xl"
            style={{
                background: 'linear-gradient(180deg, rgba(15,12,8,0.97) 0%, rgba(26,20,10,0.95) 100%)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.8), 0 1px 0 rgba(242,185,13,0.1) inset',
            }}
        >
            {/* Linha dourada superior decorativa */}
            <div className="h-[2px]"
                style={{ background: 'linear-gradient(to right, transparent, #f2b90d, #b88a0a, #f2b90d, transparent)' }}
            />

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3">

                {/* ====== AVATAR + INFO ESQUERDA ====== */}
                <div className="flex items-center gap-4">
                    <CharacterPortrait
                        src={null}
                        fallbackEmoji="⚔️"
                        borderColor="gold"
                        size="sm"
                    />

                    <div>
                        <h1 className="text-base font-bold text-white leading-tight tracking-wide">
                            {profile.username}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                                Nível {profile.level}
                            </span>
                            <span className="text-[10px] text-gray-600">•</span>
                            <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">
                                {playerClass}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-yellow-600">◈</span>
                            <span className="text-[10px] text-yellow-400 font-bold font-mono">{profile.gold}</span>
                            <span className="text-[10px] text-gray-600 font-bold ml-1">Gold</span>
                        </div>
                    </div>
                </div>

                {/* ====== BARRAS DE STATUS DIREITA ====== */}
                <div className="flex flex-col gap-2 w-full md:w-96">
                    {/* HP */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-red-500 w-10 text-right uppercase tracking-tight flex-shrink-0">Vida</span>
                        <div className="flex-1">
                            <StatBar
                                value={profile.hp_current}
                                max={profile.hp_max}
                                type="hp"
                                label="HP"
                                showValues
                            />
                        </div>
                    </div>

                    {/* Energia */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-500 w-10 text-right uppercase tracking-tight flex-shrink-0">Ener</span>
                        <div className="flex-1">
                            <StatBar
                                value={profile.energy}
                                max={100}
                                type="energy"
                                label="Energia"
                                showValues
                            />
                        </div>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-purple-400 w-10 text-right uppercase tracking-tight flex-shrink-0">XP</span>
                        <div className="flex-1">
                            <StatBar
                                value={profile.xp % xpNeeded}
                                max={xpNeeded}
                                type="xp"
                                label="Experiência"
                                showValues={false}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 flex-shrink-0 font-mono">{profile.xp % xpNeeded}/{xpNeeded}</span>
                    </div>
                </div>
            </div>

            {/* Linha dourada inferior */}
            <div className="h-[1px]"
                style={{ background: 'linear-gradient(to right, transparent, rgba(242,185,13,0.3), transparent)' }}
            />
        </header>
    )
}
