'use client'

const PHASE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    accumulation: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', label: 'Accumulation' },
    manipulation: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Manipulation' },
    distribution: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', label: 'Distribution' },
    unknown: { bg: 'bg-neutral-500/10 border-neutral-500/30', text: 'text-neutral-400', label: 'Unknown' },
}

export function AMDPhaseBadge({ phase, size = 'md' }: { phase: string; size?: 'sm' | 'md' }) {
    const style = PHASE_STYLES[phase] || PHASE_STYLES.unknown
    const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${style.bg} ${style.text} ${sizeClass}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {style.label}
        </span>
    )
}
