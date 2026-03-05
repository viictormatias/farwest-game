'use client'

interface StatBarProps {
    value: number
    max: number
    type: 'hp' | 'energy' | 'xp' | 'gold'
    label: string
    showValues?: boolean
    compact?: boolean
}

const TYPE_CONFIG = {
    hp: {
        color: 'text-red-400',
        fillClass: 'hp',
        icon: '❤️',
        glyph: '♥',
    },
    energy: {
        color: 'text-blue-400',
        fillClass: 'energy',
        icon: '⚡',
        glyph: '⚡',
    },
    xp: {
        color: 'text-purple-400',
        fillClass: 'xp',
        icon: '✨',
        glyph: '★',
    },
    gold: {
        color: 'text-yellow-400',
        fillClass: 'gold',
        icon: '💰',
        glyph: '◈',
    },
}

export default function StatBar({ value, max, type, label, showValues = true, compact = false }: StatBarProps) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    const cfg = TYPE_CONFIG[type]
    const isLow = type === 'hp' && percent < 30

    const fillClass = isLow
        ? 'hp-low'
        : type === 'gold'
            ? 'progress-bar-shimmer'
            : cfg.fillClass

    return (
        <div className={`flex items-center gap-2 ${compact ? '' : 'w-full'}`}>
            <span
                className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-tight w-6 text-center flex-shrink-0`}
                style={{ color: isLow ? '#ef4444' : undefined }}
                title={label}
            >
                {cfg.glyph}
            </span>

            <div className="progress-bar-container flex-1" style={{ height: compact ? '0.6rem' : '1rem' }}>
                <div
                    className={`progress-bar-fill ${fillClass}`}
                    style={{ width: `${percent}%` }}
                />
                {showValues && !compact && (
                    <span
                        className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                    >
                        {value} / {max}
                    </span>
                )}
            </div>

            {showValues && compact && (
                <span className="text-[10px] text-gray-400 flex-shrink-0 font-mono">
                    {value}/{max}
                </span>
            )}
        </div>
    )
}
