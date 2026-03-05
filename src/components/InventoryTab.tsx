'use client'

const ITEMS = [
    { id: 1, name: 'Espada de Ferro', icon: '⚔️', attr: '+5 Dano', type: 'Arma', equipped: true, rarity: 'common' },
    { id: 2, name: 'Escudo de Madeira', icon: '🛡️', attr: '+3 Defesa', type: 'Defesa', equipped: true, rarity: 'common' },
    { id: 3, name: 'Poção de Vida', icon: '🧪', attr: '+20 HP', type: 'Consumível', equipped: false, rarity: 'uncommon' },
    { id: 4, name: 'Capacete de Couro', icon: '🪖', attr: '+2 Resistência', type: 'Armadura', equipped: false, rarity: 'common' },
]

const RARITY_COLORS: Record<string, { border: string; glow: string; label: string; textColor: string }> = {
    common: { border: '#3a3a3a', glow: 'transparent', label: 'Comum', textColor: '#9ca3af' },
    uncommon: { border: '#22c55e', glow: 'rgba(34,197,94,0.3)', label: 'Incomum', textColor: '#4ade80' },
    rare: { border: '#3b82f6', glow: 'rgba(59,130,246,0.3)', label: 'Raro', textColor: '#60a5fa' },
    epic: { border: '#a855f7', glow: 'rgba(168,85,247,0.4)', label: 'Épico', textColor: '#c084fc' },
    legendary: { border: '#f2b90d', glow: 'rgba(242,185,13,0.4)', label: 'Lendário', textColor: '#f2b90d' },
}

export default function InventoryTab() {
    const GRID_SIZE = 20
    const grid = Array(GRID_SIZE).fill(null).map((_, i) => ITEMS[i] || null)

    const equipped = ITEMS.filter(i => i.equipped)

    return (
        <div className="space-y-6">
            <div className="ornament-divider text-[10px]">Equipamentos Ativos</div>

            {/* Zona de Equipados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipped.map(item => {
                    const rc = RARITY_COLORS[item.rarity]
                    return (
                        <div
                            key={item.id}
                            className="medieval-border p-3 flex flex-col items-center gap-2 text-center group relative cursor-pointer transition-all hover:scale-105"
                            style={{ border: `2px solid ${rc.border}`, boxShadow: `0 0 12px ${rc.glow}` }}
                        >
                            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.2))' }}>
                                {item.icon}
                            </span>
                            <div className="text-[10px] font-bold text-gold leading-tight">{item.name}</div>
                            <div className="text-[9px]" style={{ color: rc.textColor }}>{item.attr}</div>
                            <div className="text-[8px] uppercase tracking-widest text-gray-600">{item.type}</div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-3 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(135deg, #1a1208, #0d0d0d)',
                                    border: `1px solid ${rc.border}`,
                                    boxShadow: `0 0 20px rgba(0,0,0,0.8), 0 0 10px ${rc.glow}`,
                                }}
                            >
                                <div className="text-[10px] font-bold text-gold mb-1">{item.name}</div>
                                <div className="text-[9px] mb-1" style={{ color: rc.textColor }}>{rc.label}</div>
                                <div className="h-px mb-1" style={{ background: `linear-gradient(to right, transparent, ${rc.border}, transparent)` }} />
                                <div className="text-[9px] text-gray-400">{item.attr}</div>
                                <div className="text-[9px] text-blue-400 mt-1 font-bold uppercase">✓ Equipado</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="ornament-divider text-[10px]">Inventário ({ITEMS.length}/{GRID_SIZE} slots)</div>

            {/* Grade de Inventário */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {grid.map((item, i) => {
                    const rc = item ? RARITY_COLORS[item.rarity] : RARITY_COLORS.common
                    return (
                        <div
                            key={i}
                            className={`aspect-square flex items-center justify-center text-xl group relative cursor-pointer transition-all
                ${item ? 'hover:scale-110' : 'opacity-20'}
              `}
                            style={{
                                background: item ? 'linear-gradient(135deg, #1a1a1a, #0d0d0d)' : 'rgba(0,0,0,0.3)',
                                border: item ? `1px solid ${rc.border}` : '1px dashed #2a2a2a',
                                borderRadius: '3px',
                                boxShadow: item?.equipped ? `0 0 8px ${rc.glow}` : undefined,
                            }}
                        >
                            {item ? (
                                <>
                                    <span style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }}>
                                        {item.icon}
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-32 p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none"
                                        style={{
                                            background: '#0d0d0d',
                                            border: `1px solid ${rc.border}`,
                                            boxShadow: '0 0 16px rgba(0,0,0,0.9)',
                                        }}
                                    >
                                        <div className="text-[9px] font-bold text-gold">{item.name}</div>
                                        <div className="text-[8px] mt-0.5" style={{ color: rc.textColor }}>{item.attr}</div>
                                        {item.equipped && <div className="text-[8px] text-blue-400 font-bold mt-0.5">EQUIPADO</div>}
                                    </div>
                                </>
                            ) : (
                                <span className="text-[8px] text-gray-700 font-mono">{i + 1}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
