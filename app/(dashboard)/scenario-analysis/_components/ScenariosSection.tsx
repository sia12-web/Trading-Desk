'use client'

import { ChevronDown, ChevronRight, Crosshair, TrendingUp, TrendingDown, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { InstitutionalScenario } from '@/lib/scenario-analysis/types'

interface ScenariosSectionProps {
    scenarios: InstitutionalScenario[]
}

export function ScenariosSection({ scenarios }: ScenariosSectionProps) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Crosshair size={16} className="text-purple-400" />
                    <h3 className="text-sm font-semibold text-neutral-200">Institutional Scenarios</h3>
                    <span className="text-xs text-neutral-500">({scenarios.length})</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-neutral-500" /> : <ChevronRight size={16} className="text-neutral-500" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-3">
                    {scenarios.map((scenario) => (
                        <ScenarioCard key={scenario.id} scenario={scenario} />
                    ))}
                </div>
            )}
        </div>
    )
}

function ScenarioCard({ scenario }: { scenario: InstitutionalScenario }) {
    const [expanded, setExpanded] = useState(false)
    const isBullish = scenario.direction === 'bullish'

    const probColor = scenario.probability >= 0.4 ? 'text-green-400 bg-green-400/10'
        : scenario.probability >= 0.2 ? 'text-yellow-400 bg-yellow-400/10'
        : 'text-neutral-400 bg-neutral-400/10'

    return (
        <div className={`p-3 rounded-xl border ${
            isBullish ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
        }`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isBullish
                        ? <TrendingUp size={14} className="text-green-400" />
                        : <TrendingDown size={14} className="text-red-400" />
                    }
                    <h4 className="text-sm font-medium text-neutral-200">{scenario.title}</h4>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${probColor}`}>
                    {(scenario.probability * 100).toFixed(0)}%
                </span>
            </div>

            {/* Trigger & Invalidation */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="px-2.5 py-1.5 bg-neutral-800/40 rounded-lg">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Trigger</div>
                    <div className="text-xs text-neutral-300 font-mono">{scenario.trigger.level.toFixed(5)}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{scenario.trigger.description}</div>
                </div>
                <div className="px-2.5 py-1.5 bg-neutral-800/40 rounded-lg">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <XCircle size={8} />
                        Invalidation
                    </div>
                    <div className="text-xs text-neutral-300 font-mono">{scenario.invalidation.level.toFixed(5)}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{scenario.invalidation.description}</div>
                </div>
            </div>

            {/* Targets */}
            {scenario.targets.length > 0 && (
                <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="text-neutral-500">Targets:</span>
                    {scenario.targets.map((t, i) => (
                        <span key={i} className="font-mono text-neutral-300 px-1.5 py-0.5 bg-neutral-800/50 rounded">
                            {t.toFixed(5)}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mb-2">
                <span>Timeframe: {scenario.timeframe}</span>
            </div>

            {/* Expandable narrative */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
                {expanded ? 'Hide narrative' : 'Show institutional narrative'}
            </button>
            {expanded && (
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed whitespace-pre-line">
                    {scenario.narrative}
                </p>
            )}
        </div>
    )
}
