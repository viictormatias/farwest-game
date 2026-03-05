'use client'

import { useEffect, useState } from 'react'

interface CharacterPortraitProps {
    src?: string | null
    fallbackEmoji: string
    borderColor?: 'gold' | 'red' | 'blue'
    size?: 'sm' | 'md' | 'lg'
    name?: string
    isHit?: 'normal' | 'critical' | false
}

const SIZE_MAP = {
    sm: { container: 'w-16 h-16', emoji: 'text-2xl', ring: 'w-20 h-20' },
    md: { container: 'w-24 h-24', emoji: 'text-4xl', ring: 'w-28 h-28' },
    lg: { container: 'w-36 h-36', emoji: 'text-6xl', ring: 'w-40 h-40' },
}

const BORDER_MAP = {
    gold: 'border-gold',
    red: 'border-red',
    blue: 'border-blue',
}

export default function CharacterPortrait({
    src,
    fallbackEmoji,
    borderColor = 'gold',
    size = 'lg',
    name,
    isHit = false,
}: CharacterPortraitProps) {
    const [showImage, setShowImage] = useState(Boolean(src))

    useEffect(() => {
        setShowImage(Boolean(src))
    }, [src])

    const sz = SIZE_MAP[size]
    const border = BORDER_MAP[borderColor]

    let hitClass = '';
    if (isHit === 'normal') hitClass = 'is-hit';
    if (isHit === 'critical') hitClass = 'arena-shake';

    return (
        <div className={`flex flex-col items-center gap-2 ${hitClass}`}>
            {/* Anel externo decorativo */}
            <div className="relative">
                {/* Glow ring */}
                <div
                    className={`${sz.ring} rounded-lg absolute -inset-2 opacity-20 blur-md`}
                    style={{
                        background: borderColor === 'gold'
                            ? 'radial-gradient(circle, #f2b90d, transparent)'
                            : borderColor === 'red'
                                ? 'radial-gradient(circle, #dc2626, transparent)'
                                : 'radial-gradient(circle, #2563eb, transparent)',
                    }}
                />

                {/* Portrait container */}
                <div
                    className={`character-portrait ${sz.container} rounded-lg ${border} relative`}
                    style={{
                        background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)',
                    }}
                >
                    {src && showImage ? (
                        <img
                            src={src}
                            alt={name || 'Personagem'}
                            className="w-full h-full object-cover rounded-md"
                            onError={() => setShowImage(false)}
                        />
                    ) : (
                        <span className={`${sz.emoji} select-none`} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>
                            {fallbackEmoji}
                        </span>
                    )}

                    {/* Corner ornaments */}
                    <span className="absolute top-0.5 left-0.5 text-[8px] opacity-40"
                        style={{ color: borderColor === 'gold' ? '#f2b90d' : borderColor === 'red' ? '#dc2626' : '#2563eb' }}>
                        ◆
                    </span>
                    <span className="absolute top-0.5 right-0.5 text-[8px] opacity-40"
                        style={{ color: borderColor === 'gold' ? '#f2b90d' : borderColor === 'red' ? '#dc2626' : '#2563eb' }}>
                        ◆
                    </span>
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] opacity-40"
                        style={{ color: borderColor === 'gold' ? '#f2b90d' : borderColor === 'red' ? '#dc2626' : '#2563eb' }}>
                        ◆
                    </span>
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] opacity-40"
                        style={{ color: borderColor === 'gold' ? '#f2b90d' : borderColor === 'red' ? '#dc2626' : '#2563eb' }}>
                        ◆
                    </span>
                </div>
            </div>

            {name && (
                <span
                    className="text-xs font-bold uppercase tracking-wider text-center"
                    style={{
                        color: borderColor === 'gold' ? '#f2b90d'
                            : borderColor === 'red' ? '#ef4444'
                                : '#60a5fa',
                        textShadow: '0 1px 4px rgba(0,0,0,0.8)'
                    }}
                >
                    {name}
                </span>
            )}
        </div>
    )
}
