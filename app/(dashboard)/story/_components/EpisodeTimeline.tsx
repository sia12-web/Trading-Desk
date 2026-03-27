'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Clock, Layers } from 'lucide-react'
import { AMDPhaseBadge } from './AMDPhaseBadge'

interface Episode {
    id: string
    episode_number: number
    season_number?: number | null
    title: string
    current_phase: string
    confidence: number | null
    next_episode_preview: string | null
    created_at: string
}

interface EpisodeTimelineProps {
    episodes: Episode[]
    currentEpisodeId?: string
    onSelect: (episodeId: string) => void
}

interface SeasonGroup {
    seasonNumber: number
    episodes: Episode[]
}

export function EpisodeTimeline({ episodes, currentEpisodeId, onSelect }: EpisodeTimelineProps) {
    // Group episodes by season
    const seasonGroups = useMemo(() => {
        const groups: Record<number, Episode[]> = {}
        for (const ep of episodes) {
            const season = ep.season_number ?? Math.ceil(ep.episode_number / 20)
            if (!groups[season]) groups[season] = []
            groups[season].push(ep)
        }
        return Object.entries(groups)
            .map(([num, eps]): SeasonGroup => ({
                seasonNumber: parseInt(num),
                episodes: eps.sort((a, b) => b.episode_number - a.episode_number),
            }))
            .sort((a, b) => b.seasonNumber - a.seasonNumber)
    }, [episodes])

    // Expand newest season by default
    const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(() => {
        const newest = seasonGroups[0]?.seasonNumber
        return newest != null ? new Set([newest]) : new Set()
    })

    if (episodes.length === 0) {
        return (
            <div className="text-center py-6 text-neutral-500 text-sm">
                No episodes yet. Generate your first one!
            </div>
        )
    }

    // If only one season, render flat (backward compatible)
    if (seasonGroups.length <= 1) {
        return <FlatTimeline episodes={episodes} currentEpisodeId={currentEpisodeId} onSelect={onSelect} />
    }

    const toggleSeason = (num: number) => {
        setExpandedSeasons(prev => {
            const next = new Set(prev)
            if (next.has(num)) next.delete(num)
            else next.add(num)
            return next
        })
    }

    return (
        <div className="space-y-3">
            {seasonGroups.map(group => {
                const isExpanded = expandedSeasons.has(group.seasonNumber)
                return (
                    <div key={group.seasonNumber}>
                        <button
                            onClick={() => toggleSeason(group.seasonNumber)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
                        >
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <Layers size={12} />
                            Season {group.seasonNumber}
                            <span className="text-neutral-600 font-normal ml-1">
                                ({group.episodes.length} episodes)
                            </span>
                        </button>
                        {isExpanded && (
                            <div className="space-y-2 ml-2">
                                {group.episodes.map(ep => (
                                    <EpisodeRow
                                        key={ep.id}
                                        episode={ep}
                                        isActive={ep.id === currentEpisodeId}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function FlatTimeline({ episodes, currentEpisodeId, onSelect }: EpisodeTimelineProps) {
    const [expanded, setExpanded] = useState(false)
    const displayEpisodes = expanded ? episodes : episodes.slice(0, 3)

    return (
        <div className="space-y-2">
            {displayEpisodes.map(ep => (
                <EpisodeRow
                    key={ep.id}
                    episode={ep}
                    isActive={ep.id === currentEpisodeId}
                    onSelect={onSelect}
                />
            ))}

            {episodes.length > 3 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {expanded ? 'Show less' : `Show ${episodes.length - 3} more episodes`}
                </button>
            )}
        </div>
    )
}

function EpisodeRow({
    episode: ep,
    isActive,
    onSelect,
}: {
    episode: Episode
    isActive: boolean
    onSelect: (id: string) => void
}) {
    const date = new Date(ep.created_at)

    return (
        <button
            onClick={() => onSelect(ep.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                isActive
                    ? 'bg-blue-500/5 border-blue-500/30'
                    : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700'
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-neutral-500 shrink-0">
                        #{ep.episode_number}
                    </span>
                    <span className="text-sm font-medium text-neutral-200 truncate">
                        {ep.title}
                    </span>
                </div>
                <AMDPhaseBadge phase={ep.current_phase} size="sm" />
            </div>
            <div className="flex items-center gap-2 mt-1.5">
                <Clock size={10} className="text-neutral-600" />
                <span className="text-[10px] text-neutral-600">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' '}
                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {ep.confidence != null && (
                    <span className="text-[10px] text-neutral-500 ml-auto">
                        {Math.round(ep.confidence * 100)}% confidence
                    </span>
                )}
            </div>
        </button>
    )
}
