'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
    color: string
}

const COLORS = [
    'rgba(242, 185, 13, 0.9)',  // gold
    'rgba(220, 38, 38, 0.7)',   // red ember
    'rgba(251, 146, 60, 0.8)',  // orange
    'rgba(255, 255, 255, 0.5)', // white spark
]

export default function ParticleBackground({ count = 25 }: { count?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const rafRef = useRef<number>(0)

    const createParticle = (canvas: HTMLCanvasElement): Particle => ({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.4),
        life: 0,
        maxLife: Math.random() * 200 + 100,
        size: Math.random() * 2 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        // Seed initial particles at different life stages
        for (let i = 0; i < count; i++) {
            const p = createParticle(canvas)
            p.y = Math.random() * canvas.height
            p.life = Math.random() * p.maxLife
            particlesRef.current.push(p)
        }

        const SPAWN_INTERVAL = 8
        let frame = 0

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Spawn new particles
            frame++
            if (frame % SPAWN_INTERVAL === 0 && particlesRef.current.length < count) {
                particlesRef.current.push(createParticle(canvas))
            }

            particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)

            for (const p of particlesRef.current) {
                p.life++
                p.x += p.vx
                p.y += p.vy

                const progress = p.life / p.maxLife
                const alpha = progress < 0.2
                    ? progress / 0.2
                    : progress > 0.8
                        ? 1 - (progress - 0.8) / 0.2
                        : 1

                ctx.globalAlpha = alpha * 0.6
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.globalAlpha = 1
            rafRef.current = requestAnimationFrame(animate)
        }

        animate()
        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(rafRef.current)
        }
    }, [count])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            aria-hidden="true"
        />
    )
}
