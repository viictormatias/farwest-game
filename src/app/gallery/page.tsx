'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getOptimizedAssetSrc } from '@/lib/assets'
import { ITEMS, Item } from '@/lib/items'
import Lightbox from '@/components/Lightbox'

const CLASS_PORTRAITS: Record<string, string> = {
    'Xerife': '/images/xerife.webp',
    'Pistoleiro': '/images/pistoleiro.webp',
    'Forasteiro': '/images/forasteiro.webp',
    'Pregador': '/images/pregador.webp',
    'Nativo': '/images/nativo.webp',
    'Vendedor': '/images/mercador.webp',
    'CacadorDeRecompensas': '/images/cacador-de-recompensas.webp'
}

export default function GalleryPage() {
    const [filter, setFilter] = useState<string>('all')
    const [lightboxItem, setLightboxItem] = useState<Item | null>(null)

    const itemTypes = ['weapon', 'helmet', 'chest', 'gloves', 'legs', 'boots', 'mask', 'consumable', 'relic']
    
    const filteredItems = filter === 'all' 
        ? ITEMS 
        : filter === 'character' 
            ? [] 
            : ITEMS.filter((item: Item) => item.type === filter)

    return (
        <div className="min-h-screen bg-[#0d0807] text-[#e5e5e5] p-4 md:p-8 font-serif"
             style={{
                 backgroundImage: `linear-gradient(rgba(13, 8, 7, 0.95), rgba(13, 8, 7, 0.95)), url('${getOptimizedAssetSrc('/images/duelo4.webp')}')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed'
             }}>
            
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#5a3a1a] pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#f2b90d] uppercase tracking-widest mb-2 shadow-sm italic">
                            Galeria de Itens
                        </h1>
                        <p className="text-[#a18262] italic text-lg tracking-wide font-serif">
                            Catálogo completo de equipamentos, armas e lendas da fronteira.
                        </p>
                    </div>
                    <Link href="/" className="px-8 py-3 bg-[#423020] hover:bg-[#5a3a1a] text-[#f2b90d] border-2 border-[#f2b90d]/30 rounded-sm transition-all uppercase font-bold tracking-tighter shadow-lg hover:shadow-[#f2b90d]/10">
                        Voltar ao Jogo
                    </Link>
                </header>

                <nav className="mb-12 flex flex-wrap gap-3 justify-center">
                    <button onClick={() => setFilter('all')} className={`px-5 py-2 rounded-sm border transition-all ${filter === 'all' ? 'bg-[#f2b90d] text-black border-[#f2b90d]' : 'bg-transparent border-[#5a3a1a] hover:border-[#f2b90d]/50 text-[#a18262]'}`}>
                        Todos
                    </button>
                    <button onClick={() => setFilter('character')} className={`px-5 py-2 rounded-sm border transition-all ${filter === 'character' ? 'bg-[#f2b90d] text-black border-[#f2b90d]' : 'bg-transparent border-[#5a3a1a] hover:border-[#f2b90d]/50 text-[#a18262]'}`}>
                        Personagens
                    </button>
                    {itemTypes.map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)} 
                            className={`px-5 py-2 rounded-sm border transition-all capitalize ${filter === type ? 'bg-[#f2b90d] text-black border-[#f2b90d]' : 'bg-transparent border-[#5a3a1a] hover:border-[#f2b90d]/50 text-[#a18262]'}`}
                        >
                            {type === 'weapon' ? 'Armas' : 
                             type === 'helmet' ? 'Chapéus' : 
                             type === 'chest' ? 'Casacos' : 
                             type === 'gloves' ? 'Luvas' : 
                             type === 'legs' ? 'Perneiras' : 
                             type === 'boots' ? 'Botas' : 
                             type === 'mask' ? 'Máscaras' : 
                             type === 'consumable' ? 'Consumíveis' : 'Relíquias'}
                        </button>
                    ))}
                </nav>

                {/* Personagens Section */}
                {(filter === 'all' || filter === 'character') && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-[#f2b90d] uppercase mb-8 border-l-4 border-[#f2b90d] pl-4 tracking-tighter">Classes & Lendas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {Object.entries(CLASS_PORTRAITS).map(([className, portrait]) => (
                                <div key={className} className="bg-[#1a1008] border-2 border-[#3a2a1a] p-4 rounded-sm flex flex-col items-center group hover:border-[#f2b90d]/50 transition-all shadow-xl">
                                    <div className="w-full aspect-square mb-4 overflow-hidden rounded-sm bg-black/40 border border-[#423020]">
                                        <img 
                                            src={getOptimizedAssetSrc(portrait) ?? undefined} 
                                            alt={className}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#f2b90d] uppercase tracking-wide">{className}</h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Itens Grid */}
                {filter !== 'character' && (
                    <section>
                        {filter === 'all' ? (
                            <h2 className="text-2xl font-bold text-[#f2b90d] uppercase mb-8 border-l-4 border-[#f2b90d] pl-4 tracking-tighter">Arsenal & Inventário</h2>
                        ) : (
                            <h2 className="text-2xl font-bold text-[#f2b90d] uppercase mb-8 border-l-4 border-[#f2b90d] pl-4 tracking-tighter capitalize">{filter}s</h2>
                        )}
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {filteredItems.map((item: Item) => (
                                <ItemCard 
                                    key={item.id} 
                                    item={item} 
                                    onOpen={() => setLightboxItem(item)} 
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Lightbox 
                src={lightboxItem?.image_url || null}
                isOpen={!!lightboxItem}
                onClose={() => setLightboxItem(null)}
                alt={lightboxItem?.name}
                stats={lightboxItem?.stats}
                requirements={lightboxItem?.requirements}
                minDamage={lightboxItem?.min_damage}
                maxDamage={lightboxItem?.max_damage}
                icon={lightboxItem?.icon}
            />

            <footer className="mt-20 py-12 border-t border-[#5a3a1a] text-center text-[#5a3a1a]">
                <p className="font-serif italic italic font-bold">Far West Game - Galeria de Ativos</p>
                <p className="text-xs uppercase tracking-widest mt-2">v1.2 - Design & Código</p>
            </footer>
        </div>
    )
}

function ItemCard({ item, onOpen }: { item: Item, onOpen: () => void }) {
    const rarityColors = {
        common: '#ccc',
        uncommon: '#22c55e',
        rare: '#3b82f6',
        epic: '#a855f7',
        legendary: '#f2b90d'
    }

    return (
        <div 
            className="bg-[#1a1008]/80 border-2 border-[#3a2a1a] p-3 rounded-sm flex flex-col items-center group transition-all shadow-lg hover:-translate-y-1 cursor-pointer hover:border-[#f2b90d]/40"
            onClick={() => onOpen()}
        >
            <div className="w-full aspect-square mb-3 relative overflow-hidden bg-black/50 border border-[#3a2a1a]/50 rounded-sm flex items-center justify-center">
                {item.image_url ? (
                    <img 
                        src={getOptimizedAssetSrc(item.image_url) ?? undefined} 
                        alt={item.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-125 transition-transform duration-700"
                    />
                ) : (
                    <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{item.icon}</span>
                )}
                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                     style={{ backgroundColor: rarityColors[item.rarity], color: '#000' }}>
                    {item.rarity}
                </div>
            </div>
            <h4 className="text-sm font-bold text-[#f2b90d] text-center uppercase tracking-tighter leading-tight h-10 flex items-center">{item.name}</h4>
            <div className="mt-2 text-[10px] text-[#a18262] uppercase font-mono tracking-widest opacity-60">
                {item.type}
            </div>
        </div>
    )
}
