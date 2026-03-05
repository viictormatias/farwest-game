'use client'

import { useEffect, useState } from 'react'
import { Profile, Job, getJobs, startJobAction, claimJobAction } from '@/lib/gameActions'

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
}

function getJobIcon(title: string): string {
    const lower = title.toLowerCase()
    for (const [key, icon] of Object.entries(JOB_ICONS)) {
        if (lower.includes(key)) return icon
    }
    return JOB_ICONS.default
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
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
            const interval = setInterval(() => {
                const remaining = Math.max(
                    0,
                    Math.floor((new Date(profile.job_finish_at!).getTime() - Date.now()) / 1000)
                )
                setTimeLeft(remaining)
                if (remaining === 0) clearInterval(interval)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [profile.job_finish_at])

    const handleStart = async (job: Job) => {
        if (profile.energy < job.energy_cost) {
            alert('Energia insuficiente!')
            return
        }
        const success = await startJobAction(profile.id, job)
        if (success) onRefresh()
    }

    const handleClaim = async () => {
        const job = jobs.find(j => j.id === profile.current_job_id)
        if (!job) return
        setIsClaiming(true)
        const success = await claimJobAction(profile, job)
        setIsClaiming(false)
        if (success) onRefresh()
    }

    return (
        <div className="space-y-6">
            <div className="ornament-divider text-[10px]">Missões Disponíveis</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {jobs.map((job, idx) => {
                    const isActive = profile.current_job_id === job.id
                    const isOtherBusy = profile.current_job_id && !isActive
                    const canStart = !profile.current_job_id && profile.energy >= job.energy_cost
                    const jobIcon = getJobIcon(job.title)
                    const progressPct = isActive
                        ? Math.min(100, ((job.duration_seconds - timeLeft) / job.duration_seconds) * 100)
                        : 0

                    return (
                        <div
                            key={job.id}
                            className={`medieval-border p-5 flex flex-col gap-4 fade-in-up transition-all duration-300
                ${isActive ? 'border-gold' : ''}
                ${isOtherBusy ? 'opacity-40 grayscale pointer-events-none' : ''}
              `}
                            style={{
                                animationDelay: `${idx * 60}ms`,
                                boxShadow: isActive ? '0 0 20px rgba(242,185,13,0.15), inset 0 0 15px rgba(0,0,0,0.4)' : undefined,
                            }}
                        >
                            {/* Cabeçalho do card */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-sm flex items-center justify-center text-xl flex-shrink-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)',
                                        border: '1px solid #3a3a3a',
                                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    {jobIcon}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gold leading-tight">{job.title}</h3>
                                    <p className="text-[11px] italic text-gray-500 leading-tight mt-0.5">{job.description}</p>
                                </div>
                            </div>

                            {/* Separador dourado */}
                            <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #3a3a3a, transparent)' }} />

                            {/* Recompensas */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] uppercase text-gray-600 tracking-wider">XP</span>
                                    <span className="text-sm font-bold text-purple-400 font-mono">+{job.reward_xp}</span>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] uppercase text-gray-600 tracking-wider">Gold</span>
                                    <span className="text-sm font-bold text-yellow-400 font-mono">+{job.reward_gold}</span>
                                </div>
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-[9px] uppercase text-gray-600 tracking-wider">Duração</span>
                                    <span className="text-sm font-bold text-gray-300 font-mono">{formatDuration(job.duration_seconds)}</span>
                                </div>
                            </div>

                            {/* Custo de energia */}
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-gray-600 uppercase tracking-wider">Custo</span>
                                <span className={`font-bold font-mono ${profile.energy >= job.energy_cost ? 'text-blue-400' : 'text-red-500'}`}>
                                    ⚡ {job.energy_cost} Energia
                                </span>
                            </div>

                            {/* Ação / Progresso */}
                            {isActive ? (
                                <div className="space-y-2">
                                    <div className="progress-bar-container" style={{ height: '0.75rem' }}>
                                        <div
                                            className="progress-bar-fill progress-bar-shimmer"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                    <div className="text-center text-xs font-bold">
                                        {timeLeft > 0 ? (
                                            <span className="text-gold font-mono">⏳ {formatDuration(timeLeft)} restante</span>
                                        ) : (
                                            <span className="text-green-400 animate-pulse">✅ Missão concluída!</span>
                                        )}
                                    </div>
                                    {timeLeft === 0 && (
                                        <button
                                            onClick={handleClaim}
                                            disabled={isClaiming}
                                            className="btn-medieval w-full text-sm"
                                            style={{ boxShadow: '0 0 16px rgba(242,185,13,0.3)' }}
                                        >
                                            {isClaiming ? '⏳ Coletando...' : '🎁 Coletar Recompensa'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleStart(job)}
                                    disabled={!!isOtherBusy || !canStart}
                                    className="btn-medieval w-full text-sm"
                                >
                                    {isOtherBusy
                                        ? '🔒 Ocupado'
                                        : !canStart
                                            ? '⚡ Sem Energia'
                                            : '▶ Iniciar Missão'}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
