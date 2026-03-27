'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ChartPattern } from '@/lib/references/chart-patterns'
import { CHART_PATTERN_SVG_MAP } from '@/lib/references/chart-pattern-svgs'

interface ChartPatternCardProps {
  pattern: ChartPattern
}

function getCategoryStyle(category: ChartPattern['category']) {
  switch (category) {
    case 'reversal':
      return { label: 'Reversal', className: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
    case 'continuation':
      return { label: 'Continuation', className: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
  }
}

function getSignalStyle(signal: ChartPattern['signal']) {
  switch (signal) {
    case 'bullish':
      return { label: 'Bullish', className: 'text-green-400 bg-green-500/10 border-green-500/20' }
    case 'bearish':
      return { label: 'Bearish', className: 'text-red-400 bg-red-500/10 border-red-500/20' }
    case 'neutral':
      return { label: 'Directional', className: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  }
}

export function ChartPatternCard({ pattern }: ChartPatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const SvgComponent = CHART_PATTERN_SVG_MAP[pattern.name]
  const category = getCategoryStyle(pattern.category)
  const signal = getSignalStyle(pattern.signal)

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all group">
      {/* SVG Visual */}
      <div className="flex items-center justify-center p-6 bg-neutral-950/50 h-[200px]">
        {SvgComponent ? (
          <SvgComponent className="h-full w-auto max-w-full" />
        ) : (
          <div className="text-neutral-600 text-sm">No visual</div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Name */}
        <h3 className="text-lg font-bold text-white">{pattern.name}</h3>

        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${category.className}`}>
            {category.label}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${signal.className}`}>
            {signal.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-relaxed">{pattern.description}</p>

        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-blue-400 transition-colors w-full pt-1"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.15em] mb-1.5">Key Characteristics</p>
              <ul className="space-y-1">
                {pattern.keyCharacteristics.map((item, i) => (
                  <li key={i} className="text-xs text-neutral-300 leading-relaxed flex gap-2">
                    <span className="text-neutral-600 mt-0.5 shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.15em] mb-1">How to Trade</p>
              <p className="text-xs text-neutral-300 leading-relaxed">{pattern.howToTrade}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.15em] mb-1">Failure Mode</p>
              <p className="text-xs text-red-400/80 leading-relaxed">{pattern.failureMode}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
