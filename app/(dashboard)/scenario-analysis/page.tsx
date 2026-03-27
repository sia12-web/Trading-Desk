'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Loader2 } from 'lucide-react'
import { GenerateAnalysisButton } from './_components/GenerateAnalysisButton'
import { AnalysisCard } from './_components/AnalysisCard'

const VALID_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/GBP', 'AUD/USD',
    'USD/CAD', 'NZD/USD', 'EUR/JPY', 'USD/CHF', 'GBP/JPY',
]

interface AnalysisSummary {
    id: string
    summary: string | null
    confidence: number | null
    current_price: number | null
    created_at: string
    expires_at: string
}

export default function ScenarioAnalysisPage() {
    const router = useRouter()
    const [selectedPair, setSelectedPair] = useState('')
    const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
    const [loading, setLoading] = useState(false)

    const loadAnalyses = useCallback(async (pair: string) => {
        if (!pair) return
        setLoading(true)
        try {
            const res = await fetch(`/api/scenario-analysis?pair=${encodeURIComponent(pair)}&limit=10`)
            if (res.ok) {
                const { analyses: data } = await res.json()
                setAnalyses(data || [])
            }
        } catch (err) {
            console.error('Failed to load analyses:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (selectedPair) loadAnalyses(selectedPair)
    }, [selectedPair, loadAnalyses])

    const handleComplete = (analysisId: string) => {
        router.push(`/scenario-analysis/${analysisId}`)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Target size={24} className="text-blue-400" />
                <div>
                    <h1 className="text-xl font-bold text-neutral-100">Scenario Analysis</h1>
                    <p className="text-xs text-neutral-500">Institutional-grade weekly preparation reports powered by tri-model AI.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-end gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <div className="flex-1">
                    <label className="text-xs font-medium text-neutral-400 mb-1.5 block">Currency Pair</label>
                    <select
                        value={selectedPair}
                        onChange={e => setSelectedPair(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                        <option value="">Select a pair...</option>
                        {VALID_PAIRS.map(pair => (
                            <option key={pair} value={pair}>{pair}</option>
                        ))}
                    </select>
                </div>
                <GenerateAnalysisButton pair={selectedPair} onComplete={handleComplete} />
            </div>

            {/* Analyses List */}
            {selectedPair && (
                <div>
                    <h2 className="text-sm font-semibold text-neutral-400 mb-3">
                        Recent Analyses — {selectedPair}
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={20} className="animate-spin text-neutral-600" />
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                            <Target size={32} className="mx-auto text-neutral-700 mb-3" />
                            <p className="text-sm text-neutral-500">No analyses yet for {selectedPair}.</p>
                            <p className="text-xs text-neutral-600 mt-1">Generate your first analysis above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {analyses.map(a => (
                                <AnalysisCard
                                    key={a.id}
                                    id={a.id}
                                    summary={a.summary}
                                    confidence={a.confidence}
                                    currentPrice={a.current_price}
                                    createdAt={a.created_at}
                                    expiresAt={a.expires_at}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!selectedPair && (
                <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                    <Target size={40} className="mx-auto text-neutral-700 mb-4" />
                    <h2 className="text-lg font-bold text-neutral-400 mb-2">Weekly Preparation Reports</h2>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                        Select a currency pair to generate an institutional-grade scenario analysis.
                        Each report includes market context, institutional scenarios, historical patterns,
                        impact factors, and actionable takeaways.
                    </p>
                </div>
            )}
        </div>
    )
}
