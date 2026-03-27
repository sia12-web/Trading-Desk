'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Target, ArrowLeft, Loader2, Clock, TrendingUp } from 'lucide-react'
import LinkNext from 'next/link'
import { MarketContextSection } from '../_components/MarketContextSection'
import { ScenariosSection } from '../_components/ScenariosSection'
import { TakeawaysSection } from '../_components/TakeawaysSection'
import type { ScenarioAnalysisRow } from '@/lib/scenario-analysis/types'

export default function ScenarioAnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [analysis, setAnalysis] = useState<ScenarioAnalysisRow | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/scenario-analysis/${id}`)
                if (!res.ok) {
                    setError(res.status === 404 ? 'Analysis not found.' : 'Failed to load analysis.')
                    return
                }
                const { analysis: data } = await res.json()
                setAnalysis(data)
            } catch {
                setError('Failed to load analysis.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-neutral-600" />
            </div>
        )
    }

    if (error || !analysis) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <p className="text-neutral-400">{error || 'Analysis not found.'}</p>
                <LinkNext href="/scenario-analysis" className="text-sm text-blue-400 mt-4 inline-block">
                    Back to Scenario Analysis
                </LinkNext>
            </div>
        )
    }

    const isExpired = new Date(analysis.expires_at) < new Date()
    const createdDate = new Date(analysis.created_at).toLocaleString()

    return (
        <div className="max-w-4xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={16} className="text-neutral-400" />
                </button>
                <Target size={20} className="text-blue-400" />
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-neutral-100">{analysis.pair} Scenario Analysis</h1>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {createdDate}
                        </span>
                        {analysis.current_price && (
                            <span className="flex items-center gap-1">
                                <TrendingUp size={10} />
                                {analysis.current_price.toFixed(5)}
                            </span>
                        )}
                        {isExpired && (
                            <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-500 rounded text-[10px]">EXPIRED</span>
                        )}
                    </div>
                </div>
                {analysis.confidence != null && (
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                        analysis.confidence >= 0.7 ? 'text-green-400 bg-green-400/10' :
                        analysis.confidence >= 0.5 ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-red-400 bg-red-400/10'
                    }`}>
                        {(analysis.confidence * 100).toFixed(0)}% confidence
                    </div>
                )}
            </div>

            {/* Executive Summary */}
            {analysis.summary && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-neutral-300 leading-relaxed">{analysis.summary}</p>
                </div>
            )}

            {/* 5 Sections */}
            <MarketContextSection data={analysis.market_context} />
            <ScenariosSection scenarios={analysis.scenarios} />
            <TakeawaysSection
                takeaways={analysis.takeaways}
                impactFactors={analysis.impact_factors}
                historicalPatterns={analysis.historical_patterns}
            />
        </div>
    )
}
