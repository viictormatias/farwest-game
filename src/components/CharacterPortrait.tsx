'use client'

import { useEffect, useState } from 'react'
import Lightbox from './Lightbox'

interface CharacterPortraitProps {
    src?: string | null
    fallbackEmoji: string
    borderColor?: 'gold' | 'red' | 'blue' | 'transparent'
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'full'
    name?: string
    isHit?: 'normal' | 'critical' | false
    className?: string
}


const SIZE_MAP = {
    xs: { container: 'w-10 h-10', emoji: 'text-xl', ring: 'w-12 h-12' },
    sm: { container: 'w-16 h-16', emoji: 'text-2xl', ring: 'w-20 h-20' },
    md: { container: 'w-24 h-24', emoji: 'text-4xl', ring: 'w-28 h-28' },
    lg: { container: 'w-36 h-36', emoji: 'text-6xl', ring: 'w-40 h-40' },
    full: { container: 'w-full h-full', emoji: 'text-6xl', ring: 'w-full h-full' },
}

const BORDER_MAP: Record<string, string> = {
    gold: 'border-gold',
    red: 'border-red',
    blue: 'border-blue',
    transparent: 'border-transparent',
}

export default function CharacterPortrait({
    src,
    fallbackEmoji,
    borderColor = 'gold',
    size = 'lg',
    name,
    isHit = false,
    className = ''
}: CharacterPortraitProps) {
    const [showImage, setShowImage] = useState(Boolean(src))
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    useEffect(() => {
        setShowImage(Boolean(src))
    }, [src])

    const sz = SIZE_MAP[size] || SIZE_MAP.lg
    const border = BORDER_MAP[borderColor] || ''

    let hitClass = '';
    if (isHit === 'normal') hitClass = 'is-hit';
    if (isHit === 'critical') hitClass = 'arena-shake';

    return (
        <div className={`flex flex-col items-center gap-2 ${hitClass} ${size === 'full' ? 'w-full h-full' : ''} ${className}`}>

            {/* Anel externo decorativo */}
            <div className={`relative ${size === 'full' ? 'w-full h-full' : ''}`}>
                {/* Glow ring */}
                {borderColor !== 'transparent' && (
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
                )}

                {/* Portrait container */}
                <div
                    className={`character-portrait ${sz.container} rounded-lg ${border} relative cursor-pointer hover:scale-105 transition-all duration-200 active:scale-95 group overflow-hidden`}
                    style={{
                        background: 'linear-gradient(135deg, #1a1a1a, #0d0d0d)',
                        borderWidth: borderColor === 'transparent' ? 0 : 2
                    }}
                    onClick={() => src && showImage && setIsLightboxOpen(true)}
                >
                    {src && showImage ? (
                        <img
                            src={src}
                            alt={name || 'Personagem'}
                            className="w-full h-full object-cover rounded-md group-hover:brightness-125 transition-all"
                            onError={() => setShowImage(false)}
                        />
                    ) : (
                        <span className={`${sz.emoji} select-none`} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}>
                            {fallbackEmoji}
                        </span>
                    )}

                    {/* Corner ornaments */}
                    {borderColor !== 'transparent' && (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {name && size !== 'full' && (
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

            <Lightbox
                src={src as string | null}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                alt={name}
            />

        </div>
    )
}
