'use client'

import { ChevronDown, ChevronRight, CheckSquare, Eye, Ban, Globe, DollarSign, Radio, Newspaper, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { Takeaways, ImpactFactors, HistoricalPatterns } from '@/lib/scenario-analysis/types'

interface TakeawaysSectionProps {
    takeaways: Takeaways
    impactFactors: ImpactFactors
    historicalPatterns: HistoricalPatterns
}

export function TakeawaysSection({ takeaways, impactFactors, historicalPatterns }: TakeawaysSectionProps) {
    return (
        <div className="space-y-3">
            <HistoricalPatternsPanel data={historicalPatterns} />
            <ImpactFactorsPanel data={impactFactors} />
            <PreparationPanel takeaways={takeaways} />
        </div>
    )
}

function HistoricalPatternsPanel({ data }: { data: HistoricalPatterns }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Radio size={16} className="text-orange-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">Historical Patterns</h3>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronRight size={16} className="text-neutral-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                    {data.weekly_behaviors.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Weekly Behaviors</h4>
                            <div className="space-y-1.5">
                                {data.weekly_behaviors.map((b, i) => (
                                    <div key={i} className="px-3 py-2 bg-neutral-800/30 rounded-lg text-xs">
                                        <span className="text-neutral-300">{b.pattern}</span>
                                        <div className="flex items-center gap-3 mt-1 text-neutral-500">
                                            <span>Frequency: {b.frequency}</span>
                                            <span>Last: {b.last_occurrence}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.conditional_patterns.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Conditional Patterns</h4>
                            <div className="space-y-1.5">
                                {data.conditional_patterns.map((p, i) => {
                                    const reliabilityColor = p.reliability === 'high' ? 'text-green-400'
                                        : p.reliability === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                    return (
                                        <div key={i} className="px-3 py-2 bg-neutral-800/30 rounded-lg text-xs">
                                            <span className="text-blue-300">IF</span>{' '}
                                            <span className="text-neutral-300">{p.condition}</span>{' '}
                                            <span className="text-purple-300">THEN</span>{' '}
                                            <span className="text-neutral-300">{p.outcome}</span>
                                            <span className={`ml-2 ${reliabilityColor}`}>({p.reliability})</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ImpactFactorsPanel({ data }: { data: ImpactFactors }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Globe size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">Impact Factors</h3>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronRight size={16} className="text-neutral-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-3">
                    {/* USD Strength */}
                    <div className="flex items-start gap-3 px-3 py-2 bg-neutral-800/30 rounded-lg">
                        <DollarSign size={14} className="text-green-400 mt-0.5 shrink-0" />
                        <div className="text-xs">
                            <span className="text-neutral-400">USD Strength:</span>{' '}
                            <span className="text-neutral-200 font-medium">{data.usd_strength.direction}</span>
                            <p className="text-neutral-500 mt-0.5">{data.usd_strength.description}</p>
                        </div>
                    </div>

                    {/* Risk Sentiment */}
                    <div className="flex items-start gap-3 px-3 py-2 bg-neutral-800/30 rounded-lg">
                        <Globe size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                        <div className="text-xs">
                            <span className="text-neutral-400">Risk Sentiment:</span>{' '}
                            <span className="text-neutral-200 font-medium">{data.risk_sentiment.level}</span>
                            <p className="text-neutral-500 mt-0.5">{data.risk_sentiment.description}</p>
                        </div>
                    </div>

                    {/* News Events */}
                    {data.news_events.length > 0 && (
                        <div>
                            <h4 className="text-xs text-neutral-500 flex items-center gap-1 mb-1.5">
                                <Newspaper size={12} />
                                News Events
                            </h4>
                            {data.news_events.map((e, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-neutral-800/30 rounded-lg text-xs mb-1">
                                    <span className="text-neutral-300">{e.event}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                            e.impact === 'high' ? 'bg-red-400/10 text-red-400' :
                                            e.impact === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                                            'bg-neutral-700 text-neutral-400'
                                        }`}>{e.impact}</span>
                                        <span className="text-neutral-500">{e.timing}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Correlated Pairs */}
                    {data.correlated_pairs.length > 0 && (
                        <div>
                            <h4 className="text-xs text-neutral-500 flex items-center gap-1 mb-1.5">
                                <Share2 size={12} />
                                Correlated Pairs
                            </h4>
                            {data.correlated_pairs.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/30 rounded-lg text-xs mb-1">
                                    <span className="text-neutral-200 font-mono">{p.pair}</span>
                                    <span className="text-neutral-500">({p.correlation})</span>
                                    <span className="text-neutral-400">{p.implication}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function PreparationPanel({ takeaways }: { takeaways: Takeaways }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-green-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">Actionable Takeaways</h3>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronRight size={16} className="text-neutral-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4">
                    {/* Preparation List */}
                    {takeaways.preparation_list.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Preparation Checklist</h4>
                            <div className="space-y-1">
                                {takeaways.preparation_list.map((item, i) => {
                                    const priorityColor = item.priority === 'high' ? 'bg-red-400/10 text-red-400'
                                        : item.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400'
                                        : 'bg-neutral-700 text-neutral-400'
                                    return (
                                        <div key={i} className="flex items-start gap-2 px-3 py-1.5 bg-neutral-800/30 rounded-lg text-xs">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 mt-0.5 ${priorityColor}`}>
                                                {item.priority.toUpperCase()}
                                            </span>
                                            <span className="text-neutral-300">{item.action}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Key Levels Watchlist */}
                    {takeaways.key_levels_watchlist.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Eye size={12} />
                                Key Levels Watchlist
                            </h4>
                            <div className="space-y-1">
                                {takeaways.key_levels_watchlist.map((level, i) => (
                                    <div key={i} className="px-3 py-2 bg-neutral-800/30 rounded-lg text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-200 font-mono font-medium">{level.price.toFixed(5)}</span>
                                            <span className="text-neutral-500">{level.label}</span>
                                        </div>
                                        <p className="text-blue-400/70 mt-0.5">{level.action_if_reached}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Avoid List */}
                    {takeaways.avoid_list.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Ban size={12} />
                                Avoid
                            </h4>
                            <ul className="space-y-1">
                                {takeaways.avoid_list.map((item, i) => (
                                    <li key={i} className="text-xs text-red-400/70 pl-3 border-l-2 border-red-500/30">
                                        {item}
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
