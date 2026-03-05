'use client'

import { useMemo, useState } from 'react'
import {
    createCharacter,
    ClassType,
    InitialStatAllocation,
    InitialStatKey,
    ONBOARDING_MAX_PER_STAT,
    ONBOARDING_STAT_POINTS
} from '@/lib/gameActions'
import CharacterPortrait from './CharacterPortrait'

interface ClassSelectionScreenProps {
    userId: string
    onCreated: () => void
}

const STAT_KEYS: InitialStatKey[] = ['strength', 'defense', 'agility', 'accuracy', 'vigor']

const PRESETS: Array<{ id: string; label: string; points: InitialStatAllocation }> = [
    { id: 'balanced', label: 'Balanceada', points: { strength: 2, defense: 2, agility: 1, accuracy: 1, vigor: 2 } },
    { id: 'forca', label: 'Forca', points: { strength: 4, defense: 2, agility: 0, accuracy: 0, vigor: 2 } },
    { id: 'destreza', label: 'Destreza', points: { strength: 1, defense: 1, agility: 3, accuracy: 2, vigor: 1 } },
    { id: 'tanque', label: 'Tanque', points: { strength: 2, defense: 3, agility: 0, accuracy: 0, vigor: 3 } },
]

const CLASSES = [
    {
        id: 'Cavaleiro' as ClassType,
        name: 'Cavaleiro',
        emoji: '🛡️',
        imageSrc: '/classes/cavaleiro.png',
        description: 'Frontliner resistente, bom para builds de forca/tanque.',
        base: { hp: 120, strength: 10, defense: 10, agility: 5, accuracy: 5, vigor: 10 },
    },
    {
        id: 'Nobre' as ClassType,
        name: 'Nobre',
        emoji: '👑',
        imageSrc: '/classes/nobre.png',
        description: 'Classe tecnica, forte em agilidade e precisao.',
        base: { hp: 100, strength: 5, defense: 5, agility: 10, accuracy: 10, vigor: 5 },
    },
    {
        id: 'Errante' as ClassType,
        name: 'Errante',
        emoji: '🗡️',
        imageSrc: '/classes/errante.png',
        description: 'Versatil e competitiva para qualquer caminho de build.',
        base: { hp: 100, strength: 7, defense: 7, agility: 7, accuracy: 7, vigor: 7 },
    }
]

const EMPTY_ALLOC: Record<InitialStatKey, number> = {
    strength: 0,
    defense: 0,
    agility: 0,
    accuracy: 0,
    vigor: 0,
}

export default function ClassSelectionScreen({ userId, onCreated }: ClassSelectionScreenProps) {
    const [selectedClass, setSelectedClass] = useState<ClassType>('Errante')
    const [username, setUsername] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [alloc, setAlloc] = useState<Record<InitialStatKey, number>>(EMPTY_ALLOC)

    const classData = useMemo(
        () => CLASSES.find(c => c.id === selectedClass) || CLASSES[2],
        [selectedClass]
    )

    const pointsUsed = useMemo(
        () => STAT_KEYS.reduce((sum, key) => sum + alloc[key], 0),
        [alloc]
    )
    const pointsLeft = ONBOARDING_STAT_POINTS - pointsUsed

    const projected = useMemo(() => {
        const vigorBonus = alloc.vigor * 10
        return {
            hp: classData.base.hp + vigorBonus,
            strength: classData.base.strength + alloc.strength,
            defense: classData.base.defense + alloc.defense,
            agility: classData.base.agility + alloc.agility,
            accuracy: classData.base.accuracy + alloc.accuracy,
            vigor: classData.base.vigor + alloc.vigor,
        }
    }, [classData, alloc])

    const applyPreset = (presetId: string) => {
        const preset = PRESETS.find(p => p.id === presetId)
        if (!preset) return
        setAlloc({
            strength: Number(preset.points.strength || 0),
            defense: Number(preset.points.defense || 0),
            agility: Number(preset.points.agility || 0),
            accuracy: Number(preset.points.accuracy || 0),
            vigor: Number(preset.points.vigor || 0),
        })
    }

    const adjust = (key: InitialStatKey, delta: 1 | -1) => {
        setAlloc(prev => {
            const next = { ...prev }
            const current = next[key]
            if (delta > 0) {
                if (pointsLeft <= 0) return prev
                if (current >= ONBOARDING_MAX_PER_STAT) return prev
                next[key] = current + 1
                return next
            }
            if (current <= 0) return prev
            next[key] = current - 1
            return next
        })
    }

    const handleCreate = async () => {
        if (!username.trim()) return
        if (pointsLeft !== 0) {
            alert(`Distribua todos os ${ONBOARDING_STAT_POINTS} pontos iniciais.`)
            return
        }
        setIsCreating(true)
        const success = await createCharacter(userId, username.trim(), selectedClass, alloc)
        if (success) onCreated()
        else {
            setIsCreating(false)
            alert('Erro ao criar personagem. Verifique nome e distribuicao.')
        }
    }

    const borderColor: 'gold' | 'red' | 'blue' = selectedClass === 'Cavaleiro' ? 'blue' : selectedClass === 'Nobre' ? 'gold' : 'red'

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d0d] z-50 relative overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
                style={{ backgroundImage: 'url("/loadingscreen.jpeg")', filter: 'grayscale(0.2) contrast(1.1)' }}
            />
            <div className="absolute inset-0 z-1" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />

            <div className="max-w-6xl w-full medieval-border p-6 md:p-8 bg-black/60 relative z-10 backdrop-blur-md"
                style={{ border: '1px solid rgba(242,185,13,0.2)', boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(242,185,13,0.1)' }}
            >
                <h1 className="text-3xl font-black text-gold title-medieval text-center mb-6 uppercase tracking-widest">
                    Forje Sua Build Inicial
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {CLASSES.map((cls) => {
                                const isActive = selectedClass === cls.id
                                return (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClass(cls.id)}
                                        className={`text-left transition-all duration-300 p-4 border-2 rounded-sm ${isActive
                                            ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(242,185,13,0.2)]'
                                            : 'bg-[#111] border-[#3a3a3a] opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <CharacterPortrait src={cls.imageSrc} fallbackEmoji={cls.emoji} size="sm" borderColor={cls.id === 'Cavaleiro' ? 'blue' : cls.id === 'Nobre' ? 'gold' : 'red'} />
                                            <div className="text-white font-bold">{cls.name}</div>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">{cls.description}</p>
                                        <div className="text-[10px] text-gray-500 uppercase grid grid-cols-2 gap-1">
                                            <span>HP {cls.base.hp}</span>
                                            <span>FOR {cls.base.strength}</span>
                                            <span>DEF {cls.base.defense}</span>
                                            <span>AGI {cls.base.agility}</span>
                                            <span>PRE {cls.base.accuracy}</span>
                                            <span>VIG {cls.base.vigor}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="medieval-border p-4 bg-black/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-gold uppercase text-xs tracking-[0.2em] font-bold">Distribuicao Inicial</h3>
                                <span className={`text-xs font-bold ${pointsLeft === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    Pontos restantes: {pointsLeft}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        onClick={() => applyPreset(preset.id)}
                                        className="px-3 py-1 text-[10px] uppercase font-bold border border-[#3a3a3a] text-gray-300 hover:border-gold hover:text-gold transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {STAT_KEYS.map((key) => (
                                    <div key={key} className="border border-[#2a2a2a] px-3 py-2 flex items-center justify-between">
                                        <div className="text-[11px] text-gray-300 uppercase">
                                            {key === 'strength' ? 'Forca' : key === 'defense' ? 'Defesa' : key === 'agility' ? 'Agilidade' : key === 'accuracy' ? 'Precisao' : 'Vigor'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => adjust(key, -1)} className="w-6 h-6 text-xs border border-[#3a3a3a] text-gray-300">-</button>
                                            <span className="w-5 text-center text-gold font-bold">{alloc[key]}</span>
                                            <button onClick={() => adjust(key, 1)} className="w-6 h-6 text-xs border border-[#3a3a3a] text-gray-300">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Regras: {ONBOARDING_STAT_POINTS} pontos totais, maximo {ONBOARDING_MAX_PER_STAT} por atributo.
                            </p>
                        </div>
                    </div>

                    <div className="medieval-border p-4 bg-black/35 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <CharacterPortrait src={classData.imageSrc} fallbackEmoji={classData.emoji} size="md" borderColor={borderColor} />
                            <div>
                                <div className="text-gold font-bold uppercase">{classData.name}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Previa final de status</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">HP</span><span className="text-red-400 font-bold">{projected.hp}</span></div>
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">FOR</span><span className="text-gold font-bold">{projected.strength}</span></div>
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">DEF</span><span className="text-gold font-bold">{projected.defense}</span></div>
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">AGI</span><span className="text-gold font-bold">{projected.agility}</span></div>
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">PRE</span><span className="text-gold font-bold">{projected.accuracy}</span></div>
                            <div className="flex justify-between border-b border-[#2a2a2a] py-1"><span className="text-gray-500">VIG</span><span className="text-gold font-bold">{projected.vigor}</span></div>
                        </div>

                        <input
                            type="text"
                            placeholder="Nome do Personagem"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#111] border border-[#3a3a3a] text-white p-3 text-center outline-none focus:border-gold transition-all"
                            maxLength={20}
                        />

                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !username.trim() || pointsLeft !== 0}
                            className="btn-medieval w-full py-4 text-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isCreating ? 'Criando...' : '🔥 INICIAR JORNADA'}
                        </button>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest text-center">
                            Complete a distribuicao para manter o inicio competitivo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
