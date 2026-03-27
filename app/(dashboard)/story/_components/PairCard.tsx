'use client'

import { ChevronRight, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { AMDPhaseBadge } from './AMDPhaseBadge'

interface PairCardProps {
    pair: string
    latestEpisode?: {
        title: string
        current_phase: string
        episode_number: number
        created_at: string
    } | null
    activeScenarios: number
}

export function PairCard({ pair, latestEpisode, activeScenarios }: PairCardProps) {
    return (
        <Link
            href={`/story/${encodeURIComponent(pair.replace('/', '_'))}`}
            className="group block bg-neutral-900/50 border border-neutral-800 hover:border-neutral-600 rounded-xl p-5 transition-all hover:bg-neutral-900/80"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-lg font-bold text-neutral-100 group-hover:text-white transition-colors">
                        {pair}
                    </h3>
                    {latestEpisode && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Episode {latestEpisode.episode_number}
                        </p>
                    )}
                </div>
                <ChevronRight size={18} className="text-neutral-600 group-hover:text-neutral-400 transition-colors mt-1" />
            </div>

            {latestEpisode ? (
                <>
                    <p className="text-sm text-neutral-300 mb-3 line-clamp-1">{latestEpisode.title}</p>
                    <div className="flex items-center gap-3">
                        <AMDPhaseBadge phase={latestEpisode.current_phase} size="sm" />
                        {activeScenarios > 0 && (
                            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-medium">
                                {activeScenarios} active scenario{activeScenarios !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-2 text-neutral-500">
                    <Clapperboard size={14} />
                    <span className="text-xs">No episodes yet — write your first story</span>
                </div>
            )}
        </Link>
    )
}
