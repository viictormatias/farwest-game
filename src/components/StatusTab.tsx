'use client'

import { useState } from 'react'
import { Profile } from '@/lib/gameActions'
import { supabase } from '@/lib/supabase'

interface StatusTabProps {
    profile: Profile
    onRefresh: () => void
}

const ATTRIBUTES = [
    { key: 'strength', label: 'Força', icon: '⚔️', desc: 'Aumenta o dano de cada golpe' },
    { key: 'defense', label: 'Defesa', icon: '🛡️', desc: 'Reduz o dano recebido' },
    { key: 'agility', label: 'Agilidade', icon: '💨', desc: 'Aumenta iniciativa e esquiva' },
    { key: 'accuracy', label: 'Precisão', icon: '🎯', desc: 'Aumenta a chance de acertar' },
    { key: 'vigor', label: 'Vigor', icon: '🩸', desc: 'Aumenta sua vida máxima (+10 HP)' },
] as const

export default function StatusTab({ profile, onRefresh }: StatusTabProps) {
    const [spending, setSpending] = useState(false)

    const spendPoint = async (attr: 'strength' | 'defense' | 'agility' | 'accuracy' | 'vigor') => {
        if (profile.stat_points_available <= 0 || spending) return
        setSpending(true)

        const current = profile[attr] ?? 5
        const updates: any = {
            [attr]: current + 1,
            stat_points_available: profile.stat_points_available - 1
        }

        // Se for Vigor, aumenta o HP Máximo também
        if (attr === 'vigor') {
            updates.hp_max = profile.hp_max + 10
            updates.hp_current = profile.id === profile.id ? profile.hp_current + 10 : profile.hp_current
        }

        await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profile.id)

        await onRefresh()
        setSpending(false)
    }

    const xpToNextLevel = profile.level * 100
    const xpPct = Math.min(100, (profile.xp / xpToNextLevel) * 100)

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">

            {/* Identity */}
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 border-2 border-gold rounded-full flex items-center justify-center text-4xl bg-black/40"
                    style={{ boxShadow: '0 0 20px rgba(242,185,13,0.2)' }}>
                    ⚔️
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Ficha de Personagem</h2>
                    <div className="text-gold text-sm uppercase tracking-widest">Nível {profile.level} · {profile.gold} Gold</div>
                    <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Experiência</span>
                            <span>{profile.xp} / {xpToNextLevel} XP</span>
                        </div>
                        <div className="h-2 bg-black/50 border border-white/10 rounded-full overflow-hidden w-48">
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${xpPct}%`, background: 'linear-gradient(to right, #7c3aed, #a855f7)' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* stat_points_available Banner */}
            {profile.stat_points_available > 0 && (
                <div className="border border-yellow-500/50 bg-yellow-500/5 p-4 text-center rounded animate-pulse"
                    style={{ boxShadow: '0 0 15px rgba(242,185,13,0.1)' }}>
                    <span className="text-yellow-400 font-bold uppercase tracking-[0.2em] text-xs">
                        ⭐ {profile.stat_points_available} Ponto{profile.stat_points_available > 1 ? 's' : ''} de Atributo disponível{profile.stat_points_available > 1 ? 'is' : ''}!
                    </span>
                </div>
            )}

            {/* Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ATTRIBUTES.map(({ key, label, icon, desc }) => {
                    const value = profile[key] ?? 5
                    return (
                        <div key={key} className="medieval-border p-4 flex items-center gap-4 bg-black/20">
                            <div className="text-3xl">{icon}</div>
                            <div className="flex-1">
                                <div className="text-white font-bold text-xs uppercase tracking-wider">{label}</div>
                                <div className="text-gray-500 text-[10px] italic">{desc}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex gap-[2px]">
                                        {Array(10).fill(null).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-2.5 h-3.5 rounded-sm"
                                                style={{
                                                    background: i < value ? (key === 'vigor' ? '#ef4444' : '#f2b90d') : '#1a1a1a',
                                                    border: '1px solid #333',
                                                    boxShadow: i < value ? `0 0 5px ${key === 'vigor' ? '#ef444444' : '#f2b90d44'}` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white font-black text-sm ml-1">{value}</span>
                                </div>
                            </div>
                            {profile.stat_points_available > 0 && (
                                <button
                                    onClick={() => spendPoint(key)}
                                    disabled={spending}
                                    className="btn-medieval px-3 py-1 text-lg font-black"
                                    title="Gastar 1 ponto"
                                >
                                    +
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Vital Stats */}
            <div className="medieval-border p-4 grid grid-cols-3 gap-4 text-sm bg-black/40">
                <h3 className="col-span-3 text-gold uppercase text-[10px] tracking-[0.3em] font-bold border-b border-[#3a3a3a] pb-2 mb-1">
                    Estatísticas Vitais
                </h3>
                <div className="flex flex-col">
                    <span className="text-gray-600 text-[9px] uppercase tracking-widest">Vida Máxima</span>
                    <span className="text-red-500 font-bold text-lg">{profile.hp_max}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-600 text-[9px] uppercase tracking-widest">Energia</span>
                    <span className="text-blue-500 font-bold text-lg">{profile.energy}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-600 text-[9px] uppercase tracking-widest">Tesouro</span>
                    <span className="text-gold font-bold text-lg">{profile.gold}</span>
                </div>
            </div>

        </div>
    )
}
