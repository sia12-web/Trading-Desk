'use client'

import { Target, Clock, TrendingUp } from 'lucide-react'
import LinkNext from 'next/link'

interface AnalysisCardProps {
    id: string
    summary: string | null
    confidence: number | null
    currentPrice: number | null
    createdAt: string
    expiresAt: string
}

export function AnalysisCard({ id, summary, confidence, currentPrice, createdAt, expiresAt }: AnalysisCardProps) {
    const isExpired = new Date(expiresAt) < new Date()
    const timeAgo = getTimeAgo(createdAt)

    const confidenceColor = confidence
        ? confidence >= 0.7 ? 'text-green-400 bg-green-400/10' :
          confidence >= 0.5 ? 'text-yellow-400 bg-yellow-400/10' :
          'text-red-400 bg-red-400/10'
        : 'text-neutral-500 bg-neutral-500/10'

    return (
        <LinkNext
            href={`/scenario-analysis/${id}`}
            className={`block p-4 rounded-xl border transition-colors hover:border-blue-500/30 ${
                isExpired
                    ? 'bg-neutral-900/30 border-neutral-800/50 opacity-60'
                    : 'bg-neutral-900/50 border-neutral-800'
            }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target size={14} className="text-blue-400" />
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo}
                    </span>
                    {isExpired && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-500 rounded-full">
                            EXPIRED
                        </span>
                    )}
                </div>
                {confidence != null && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${confidenceColor}`}>
                        {(confidence * 100).toFixed(0)}%
                    </span>
                )}
            </div>

            <p className="text-sm text-neutral-300 line-clamp-2 mb-2">
                {summary || 'No summary available.'}
            </p>

            {currentPrice && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <TrendingUp size={10} />
                    <span>Price at generation: {currentPrice.toFixed(5)}</span>
                </div>
            )}
        </LinkNext>
    )
}

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}
