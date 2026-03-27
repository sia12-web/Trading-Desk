'use client'

import { ChevronDown, ChevronRight, MapPin, Droplets, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import type { MarketContext } from '@/lib/scenario-analysis/types'

interface MarketContextSectionProps {
    data: MarketContext
}

export function MarketContextSection({ data }: MarketContextSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    const biasColor = data.current_bias === 'bullish' ? 'text-green-400'
        : data.current_bias === 'bearish' ? 'text-red-400'
        : 'text-yellow-400'

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">Market Context</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${biasColor} bg-neutral-800`}>
                        {data.current_bias.toUpperCase()}
                    </span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronRight size={16} className="text-neutral-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Structure Summary */}
                    <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                        {data.structure_summary}
                    </p>

                    {/* Key Levels */}
                    {data.key_levels.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Key Levels</h4>
                            <div className="space-y-1">
                                {data.key_levels.map((level, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-neutral-800/30 rounded-lg text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${
                                                level.type === 'resistance' ? 'bg-red-400' :
                                                level.type === 'support' ? 'bg-green-400' : 'bg-yellow-400'
                                            }`} />
                                            <span className="text-neutral-300 font-mono">{level.price.toFixed(5)}</span>
                                            <span className="text-neutral-600">({level.timeframe})</span>
                                        </div>
                                        <span className="text-neutral-500 max-w-[200px] truncate">{level.significance}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Liquidity Pools */}
                    {data.liquidity_pools.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Droplets size={12} />
                                Liquidity Pools
                            </h4>
                            <div className="space-y-1">
                                {data.liquidity_pools.map((pool, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/30 rounded-lg text-xs">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                            pool.type === 'buy_side' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                                        }`}>
                                            {pool.type === 'buy_side' ? 'BUY' : 'SELL'}
                                        </span>
                                        <span className="text-neutral-300 font-mono">{pool.price.toFixed(5)}</span>
                                        <span className="text-neutral-500">{pool.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Anomalies */}
                    {data.anomalies.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Anomalies
                            </h4>
                            <ul className="space-y-1">
                                {data.anomalies.map((a, i) => (
                                    <li key={i} className="text-xs text-yellow-400/80 pl-3 border-l-2 border-yellow-500/30">
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
