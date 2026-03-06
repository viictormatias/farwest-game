'use client'

import { useEffect, useState } from 'react'
import { Profile, getUserInventory } from '@/lib/gameActions'
import { supabase } from '@/lib/supabase'
import { ITEMS } from '@/lib/items'
import { deriveSoulsStats } from '@/lib/soulslike'
import CharacterPortrait from './CharacterPortrait'

interface StatusTabProps {
    profile: Profile
    onRefresh: () => void
}

const CLASS_PORTRAITS: Record<string, string> = {
    'Xerife': '/images/xerife.jpeg',
    'Pistoleiro': '/images/pistoleiro.jpeg',
    'Forasteiro': '/images/forasteiro.jpeg',
    'Pregador': '/images/pregador.jpeg',
    'Nativo': '/images/nativo.jpeg',
    'Vendedor': '/images/mercador.jpeg',
    'CacadorDeRecompensas': '/images/cacador-de-recompensas.jpeg'
}

/* ─── Atributos "base" do personagem ─── */
const ATTRIBUTES = [
    { key: 'strength', label: 'Força', icon: 'F', color: '#ef4444', desc: 'Aumenta o dano causado nos seus disparos.' },
    { key: 'defense', label: 'Defesa', icon: 'D', color: '#60a5fa', desc: 'Sua resistência a ferimentos.' },
    { key: 'agility', label: 'Agilidade', icon: 'A', color: '#4ade80', desc: 'Sua destreza e chance de esquiva.' },
    { key: 'accuracy', label: 'Pontaria', icon: 'P', color: '#f97316', desc: 'Precisão crucial para acertar o alvo.' },
    { key: 'vigor', label: 'Vigor', icon: 'V', color: '#a855f7', desc: 'Sua constituição física e vitalidade total.' },
] as const

function buildTrend(p: Profile): { label: string; color: string } {
    const stats = [
        { label: 'Força', val: p.strength, color: '#ef4444' },
        { label: 'Agilidade', val: p.agility, color: '#4ade80' },
        { label: 'Defesa', val: p.defense, color: '#60a5fa' },
        { label: 'Vigor', val: p.vigor, color: '#a855f7' },
        { label: 'Pontaria', val: p.accuracy, color: '#f97316' },
    ]
    const highest = [...stats].sort((a, b) => b.val - a.val)[0]
    const avg = stats.reduce((acc, s) => acc + s.val, 0) / stats.length

    if (highest.val > avg + 5) return { label: `Especialista em ${highest.label}`, color: highest.color }
    if (highest.val > avg + 3) return { label: `Tendência: ${highest.label}`, color: highest.color }
    return { label: 'Pistoleiro Equilibrado', color: '#f2b90d' }
}

/* ─── Mini barra de progresso ─── */
function Bar({ value, max, color, height = 8 }: { value: number; max: number; color: string; height?: number }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
        <div style={{ height, background: '#111', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
            <div style={{
                height: '100%', width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}88, ${color})`,
                borderRadius: 4, transition: 'width 0.4s ease'
            }} />
        </div>
    )
}

/* ─── Stat row no painel de combate ─── */
function StatRow({ label, value, positive }: { label: string; value: string | number; positive?: boolean }) {
    const isNum = typeof value === 'number'
    const color = positive === undefined ? '#c9a84c'
        : isNum && (value as number) >= 0 ? '#4ade80' : '#f87171'
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #1a1a1a', paddingBottom: 8, marginBottom: 8
        }}>
            <span style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b7280', fontWeight: 900 }}>{label}</span>
            <span style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 900, color }}>{value}</span>
        </div>
    )
}

export default function StatusTab({ profile, onRefresh }: StatusTabProps) {
    const [spending, setSpending] = useState(false)
    const [souls, setSouls] = useState<ReturnType<typeof deriveSoulsStats> | null>(null)

    const loadSouls = async () => {
        const inventory = await getUserInventory(profile.id)
        const equipped = (inventory || [])
            .filter((inv: any) => inv.is_equipped)
            .map((inv: any) => ITEMS.find(it => it.id === inv.item_id))
            .filter(Boolean)
        setSouls(deriveSoulsStats(profile, equipped as any))
    }

    useEffect(() => { loadSouls() }, [
        profile.id, profile.vigor, profile.strength, profile.agility, profile.accuracy, profile.defense
    ])

    const spendPoint = async (attr: 'strength' | 'defense' | 'agility' | 'accuracy' | 'vigor') => {
        if (profile.stat_points_available <= 0 || spending) return
        setSpending(true)
        const updates: any = {
            [attr]: (profile[attr] ?? 5) + 1,
            stat_points_available: profile.stat_points_available - 1
        }
        if (attr === 'vigor') {
            updates.hp_max = profile.hp_max + 10
            updates.hp_current = profile.hp_current + 10
        }
        await supabase.from('profiles').update(updates).eq('id', profile.id)
        await onRefresh()
        setSpending(false)
    }

    const xpToNext = profile.level * 100
    const trend = buildTrend(profile)

    return (
        <div className="flex flex-col gap-5 md:gap-6 max-w-[820px] mx-auto">

            {/* ─── CABEÇALHO DO PERSONAGEM ─── */}
            <div className="western-border p-4 md:p-5 flex items-center gap-4 md:gap-5 bg-gradient-to-br from-[#1f140c] to-[#140d07]">
                <div className="flex-1 flex flex-col gap-2 md:gap-3">
                    <div className="flex flex-col md:flex-row justify-between md:items-baseline gap-1">
                        <h2 className="title-western m-0 text-xl md:text-2xl text-[#d9c5b2]">
                            {profile.username ?? 'Pistoleiro'}
                        </h2>
                        <span className="text-[10px] md:text-xs color-gold-dark uppercase tracking-[0.15em] font-bold">
                            Nível {profile.level} · {trend.label}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[11px] md:text-sm text-[#9ca3af] uppercase tracking-[0.2em] font-black">
                            <span>Vida</span>
                            <span className="text-[#f87171] font-mono font-bold">{profile.hp_current} / {profile.hp_max}</span>
                        </div>
                        <Bar value={profile.hp_current} max={profile.hp_max} color="#ef4444" height={8} />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-[11px] md:text-sm text-[#9ca3af] uppercase tracking-[0.2em] font-black">
                            <span>Experiência</span>
                            <span className="text-[#a855f7] font-mono font-bold">{profile.xp} / {xpToNext} XP</span>
                        </div>
                        <Bar value={profile.xp} max={xpToNext} color="#a855f7" height={8} />
                    </div>
                </div>
            </div>

            {profile.stat_points_available > 0 && (
                <div className="p-3 md:p-4 text-center rounded-sm border-2 border-dashed border-gold/40 bg-gold/5 text-[10px] md:text-xs font-bold text-gold uppercase tracking-[0.15em] shadow-lg animate-pulse">
                    ✨ {profile.stat_points_available} ponto(s) de atributo disponível(is)
                </div>
            )}

            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_260px] gap-5 items-start">
                {/* Painel Lateral de Stats - Versão "Wanted Card" (MOVED UP FOR MOBILE) */}
                <div className="w-full lg:w-auto order-first lg:order-last">
                    <div className="western-border p-4 bg-gradient-to-b from-[#1a120c] to-[#0d0906] border-gold shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        {/* Portrait Container */}
                        <div className="w-full aspect-square mb-6 relative border-2 border-gold-dark p-1 bg-black">
                            <CharacterPortrait
                                src={profile.image_url || CLASS_PORTRAITS[profile.class] || null}
                                fallbackEmoji="🤠"
                                size="full"
                                borderColor="transparent"
                                name={profile.username}
                            />
                            {/* Decorative banner */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gold text-black px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-black uppercase whitespace-nowrap tracking-[0.15em] rounded-sm shadow-xl border-2 border-black">
                                {profile.username}
                            </div>
                        </div>

                        <div className="text-[10px] md:text-[11px] uppercase text-[#c9a84c] mb-3 font-extrabold text-center tracking-[0.2em] border-b border-[#c9a84c33] pb-1">
                            Dados de Duelo
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <StatRow label="HP Máximo" value={profile.hp_max} />
                            <StatRow label="Energia" value={`${profile.energy} / 100`} />
                            <StatRow label="Pontaria" value={profile.accuracy + (souls?.bonuses.accuracy || 0)} />
                            <StatRow label="Defesa" value={profile.defense + (souls?.bonuses.defense || 0)} />
                        </div>

                        {/* Summary of combat stats */}
                        <div className="mt-3 pt-3 border-top border-[#c9a84c33]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-[#6b7280] uppercase">Dano Estimado</span>
                                <span className="text-xs text-white font-bold font-mono">
                                    {souls?.minDamage || 5}-{souls?.maxDamage || 10}
                                </span>
                            </div>
                            <div className="text-[8px] text-[#4b5563] text-center italic leading-tight">
                                "Justiça se faz com chumbo."
                            </div>
                        </div>
                    </div>
                </div>

                {/* Atributos */}
                <div className="w-full flex flex-col gap-3 md:gap-4 order-last lg:order-first">
                    {ATTRIBUTES.map(({ key, label, icon, color, desc }) => {
                        const value = profile[key] ?? 5
                        return (
                            <div key={key} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-black/45 border border-[#2b1f14] rounded-lg transition-all duration-300 group hover:border-gold/30">
                                <span className="text-xl md:text-2xl flex-shrink-0 w-8 text-center">{icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-base md:text-lg font-black uppercase text-[#e5e7eb] tracking-[0.1em]">{label}</span>
                                        <span className="text-2xl md:text-3xl font-black font-mono" style={{ color, textShadow: `0 0 10px ${color}44` }}>{value}</span>
                                    </div>
                                    <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-2.5 overflow-hidden">
                                        {Array(20).fill(null).map((_, i) => (
                                            <div key={i} className="flex-1 h-3 md:h-4 rounded-xs transition-all duration-300" style={{
                                                background: i < value ? color : '#1a1a1a',
                                                border: `1px solid ${i < value ? color + '66' : '#222'}`,
                                            }} />
                                        ))}
                                    </div>
                                    <span className="text-[11px] md:text-sm text-[#9ca3af] italic leading-relaxed block">{desc}</span>
                                </div>
                                {profile.stat_points_available > 0 && (
                                    <button onClick={() => spendPoint(key)} disabled={spending} className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-current/15 border border-current font-black text-lg md:text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95" style={{ color }}>+</button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
