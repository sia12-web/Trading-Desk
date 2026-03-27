'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface CharacterData {
    strength: string
    momentum: string
    narrative: string
}

interface CharacterPanelProps {
    buyers: CharacterData
    sellers: CharacterData
}

const STRENGTH_COLORS: Record<string, string> = {
    dominant: 'text-green-400',
    strong: 'text-green-300',
    balanced: 'text-yellow-400',
    weak: 'text-orange-400',
    exhausted: 'text-red-400',
}

const STRENGTH_BAR: Record<string, number> = {
    dominant: 100,
    strong: 80,
    balanced: 50,
    weak: 30,
    exhausted: 10,
}

export function CharacterPanel({ buyers, sellers }: CharacterPanelProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyers */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-green-400" />
                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider">Buyers</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Strength</span>
                        <span className={`text-xs font-bold uppercase ${STRENGTH_COLORS[buyers.strength] || 'text-neutral-400'}`}>
                            {buyers.strength}
                        </span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${STRENGTH_BAR[buyers.strength] || 50}%` }}
                        />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{buyers.momentum}</p>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-2">{buyers.narrative}</p>
                </div>
            </div>

            {/* Sellers */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={16} className="text-red-400" />
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Sellers</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">Strength</span>
                        <span className={`text-xs font-bold uppercase ${STRENGTH_COLORS[sellers.strength] || 'text-neutral-400'}`}>
                            {sellers.strength}
                        </span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{ width: `${STRENGTH_BAR[sellers.strength] || 50}%` }}
                        />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{sellers.momentum}</p>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-2">{sellers.narrative}</p>
                </div>
            </div>
        </div>
    )
}
