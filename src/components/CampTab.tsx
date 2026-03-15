'use client'

import { useEffect, useState } from 'react'
import { Profile, Job, getJobs, startJobAction, claimJobAction } from '@/lib/gameActions'
import { getOptimizedAssetSrc } from '@/lib/assets'

const JOB_ICONS: Record<string, string> = {
    default: '⚔️',
    patrol: '🗡️',
    mine: '⛏️',
    farm: '🌾',
    guard: '🛡️',
    hunt: '🏹',
    craft: '🔨',
    scout: '👁️',
    gather: '🌿',
    trade: '💼',
    fort: '🏰',
    route: '🛤️',
    expedition: '🧭',
    heist: '💰',
    bank: '🏦',
    train: '🚂',
    bounty: '📜',
}

function getJobIcon(title: string): string {
    const lower = title.toLowerCase()
    if (lower.includes('trem') || lower.includes('express')) return JOB_ICONS.train
    if (lower.includes('banco') || lower.includes('assalto') || lower.includes('assalta')) return JOB_ICONS.bank
    if (lower.includes('recompensa') || lower.includes('fugitivo')) return JOB_ICONS.bounty
    for (const [key, icon] of Object.entries(JOB_ICONS)) {
        if (lower.includes(key)) return icon
    }
    return JOB_ICONS.default
}

const JOB_CARD_IMAGES: Array<{ keywords: string[]; image: string }> = [
    { keywords: ['fumo', 'fazenda'], image: '/images/jobs/farm_tobacco.webp' },
    { keywords: ['patrulha', 'fronteira'], image: '/images/jobs/frontier_patrol.webp' },
    { keywords: ['roubados', 'mercado negro', 'vender'], image: '/images/jobs/black_market.webp' },
    { keywords: ['fugitivo lendário', 'fugitivo lendario'], image: '/images/jobs/bounty_hunt_legendary.webp' },
    { keywords: ['recompensa', 'fugitivo'], image: '/images/jobs/bounty_hunt.webp' },
    { keywords: ['diligência', 'diligencia', 'escolta de diligencia'], image: '/images/jobs/stagecoach_escort.webp' },
    { keywords: ['caravana', 'sal', 'deserto'], image: '/images/jobs/salt_caravan.webp' },
    { keywords: ['trem', 'express'], image: '/images/jobs/train_heist.webp' },
    { keywords: ['banco', 'assalto', 'assalta'], image: '/images/jobs/bank_heist.webp' },
    { keywords: ['forte', 'vigilia'], image: '/images/jobs/fort_vigil.webp' },
    { keywords: ['contrabando', 'rota longa'], image: '/images/jobs/contraband_route.webp' },
    { keywords: ['expedicao', 'expedição', 'canyon'], image: '/images/jobs/forgotten_canyon.webp' },
]

function getJobCardImage(title: string): string {
    const lower = title.toLowerCase()
    const hit = JOB_CARD_IMAGES.find((entry) => entry.keywords.some((kw) => lower.includes(kw)))
    return hit?.image || '/images/jobs/frontier_patrol.webp'
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
        return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function CampTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
    const [jobs, setJobs] = useState<Job[]>([])
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [isClaiming, setIsClaiming] = useState(false)

    useEffect(() => {
        getJobs().then(setJobs)
    }, [])

    useEffect(() => {
        if (profile.job_finish_at) {
            const calculateRemaining = () => {
                return Math.max(
                    0,
                    Math.floor((new Date(profile.job_finish_at!).getTime() - Date.now()) / 1000)
                )
            }

            // Inicializa imediatamente para evitar flicker de 1s
            const initialRemaining = calculateRemaining()
            setTimeLeft(initialRemaining)

            const interval = setInterval(() => {
                const remaining = calculateRemaining()
                setTimeLeft(remaining)
                if (remaining === 0) clearInterval(interval)
            }, 1000)
            return () => clearInterval(interval)
        } else {
            setTimeLeft(0)
        }
    }, [profile.job_finish_at])

    const handleStart = async (job: Job) => {
        if (profile.energy < job.energy_cost) {
            alert('Energia insuficiente!')
            return
        }
        const success = await startJobAction(profile.id, job)
        if (success) {
            onRefresh()
        } else {
            alert('Falha ao iniciar missão. Verifique sua conexão ou se já está em uma missão.')
        }
    }

    const handleClaim = async () => {
        const job = jobs.find(j => j.id === profile.current_job_id)
        if (!job) return
        setIsClaiming(true)
        const success = await claimJobAction(profile, job)
        setIsClaiming(false)
        if (success) {
            onRefresh()
        } else {
            alert('Falha ao coletar recompensa. O trabalho pode não estar pronto no servidor ou houve um erro de conexão.')
        }
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="ornament-divider text-[10px] md:text-xs">Quadro de Missões</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {jobs.map((job, idx) => {
                    const isActive = profile.current_job_id === job.id
                    const isOtherBusy = profile.current_job_id && !isActive
                    const canStart = !profile.current_job_id && profile.energy >= job.energy_cost && profile.level >= job.min_level
                    const jobIcon = getJobIcon(job.title)
                    const jobImage = getOptimizedAssetSrc(getJobCardImage(job.title)) || getJobCardImage(job.title)
                    const progressPct = isActive
                        ? Math.min(100, ((job.duration_seconds - timeLeft) / job.duration_seconds) * 100)
                        : 0

                    return (
                        <div
                            key={job.id}
                            className={`western-border flex flex-col fade-in-up transition-all duration-300 relative overflow-hidden group
                ${isActive ? 'border-gold ring-1 ring-gold/30' : ''}
                ${isOtherBusy ? 'opacity-40 grayscale pointer-events-none' : ''}
                ${profile.level < job.min_level ? 'opacity-60 grayscale' : ''}
              `}
                            style={{
                                animationDelay: `${idx * 60}ms`,
                                boxShadow: isActive ? '0 0 25px rgba(212,175,55,0.2), inset 0 0 15px rgba(0,0,0,0.4)' : undefined,
                            }}
                        >
                            {/* IMAGEM NO TOPO */}
                            <div className="relative h-40 md:h-44 overflow-hidden border-b-2 border-[#423020] bg-[#0a0705]">
                                <img
                                    src={jobImage}
                                    alt={job.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#140d07] via-transparent to-transparent opacity-80" />

                                {/* ICON OVERLAY */}
                                <div className="absolute bottom-3 right-3 w-10 h-10 bg-[rgba(20,13,7,0.85)] border border-[#d4af37]/40 rounded-sm flex items-center justify-center text-lg shadow-lg backdrop-blur-sm">
                                    {jobIcon}
                                </div>
                            </div>

                            <div className="p-4 md:p-5 flex flex-col flex-1 gap-3">
                                <div>
                                    <h3 className="font-bold text-[#d9c5b2] text-lg md:text-xl font-serif tracking-wide mb-1 leading-tight group-hover:text-gold transition-colors">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] text-[#d4af37] font-black bg-[#1a120c] border border-[#d4af37]/20 px-2 py-0.5 rounded-sm">
                                            {formatDuration(job.duration_seconds)}
                                        </span>
                                        {profile.level < job.min_level && (
                                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-black bg-red-900/40 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-sm">
                                                Nível {job.min_level}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[11px] md:text-xs text-[#a3907c] leading-relaxed italic line-clamp-2 border-l-2 border-[#423020] pl-3 py-1">
                                    "{job.description}"
                                </p>

                                <div className="flex-1" />

                                {/* Recompensas */}
                                <div className="grid grid-cols-3 gap-1 bg-[#0a0705] p-2 rounded-sm border border-[#2b1f14] shadow-inner mt-2">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">⚡ Energia</span>
                                        <span className="text-[11px] font-black font-mono text-blue-400">-{job.energy_cost}</span>
                                    </div>
                                    <div className="flex flex-col items-center border-x border-[#2b1f14]">
                                        <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">⭐ XP</span>
                                        <span className="text-[11px] font-black font-mono text-purple-400">+{job.reward_xp}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">💰 Gold</span>
                                        <span className="text-[11px] font-black font-mono text-yellow-400">+{job.reward_gold}</span>
                                    </div>
                                </div>

                                {/* Ações / Progresso */}
                                {isActive ? (
                                    <div className="space-y-2 mt-2 pt-2 border-t border-[#2b1f14]">
                                        <div className="progress-bar-container h-2">
                                            <div
                                                className="progress-bar-fill progress-bar-shimmer"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>

                                        <div className="text-center text-[10px] font-bold">
                                            {timeLeft > 0 ? (
                                                <span className="text-gold font-mono">⏳ {formatDuration(timeLeft)}</span>
                                            ) : (
                                                <span className="text-green-400 animate-pulse">✅ Concluído!</span>
                                            )}
                                        </div>

                                        {timeLeft === 0 && profile.job_finish_at && new Date(profile.job_finish_at).getTime() <= Date.now() && (
                                            <button
                                                onClick={handleClaim}
                                                disabled={isClaiming}
                                                className="btn-western w-full text-xs py-2 mt-1"
                                                style={{ boxShadow: '0 0 16px rgba(212,175,55,0.2)' }}
                                            >
                                                {isClaiming ? '⏳...' : 'COLETAR RECOMPENSA'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleStart(job)}
                                        disabled={!!isOtherBusy || !canStart}
                                        className="btn-western find flex-1 w-full py-2.5 text-[11px] md:text-xs font-black tracking-widest mt-2"
                                    >
                                        {isOtherBusy
                                            ? 'Bloqueado'
                                            : profile.level < job.min_level
                                                ? `Nível ${job.min_level}`
                                                : !canStart
                                                    ? 'Sem Energia'
                                                    : 'Iniciar Missão'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
