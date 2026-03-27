'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CandlestickPattern } from '@/lib/utils/candlestick-patterns'
import { CANDLESTICK_SVG_MAP } from '@/lib/references/candlestick-svgs'

interface CandlestickPatternCardProps {
  pattern: CandlestickPattern
}

function getSignalStyle(signal: CandlestickPattern['signal']) {
  switch (signal) {
    case 'bullish_reversal':
      return { label: 'Bullish Reversal', className: 'text-green-400 bg-green-500/10 border-green-500/20' }
    case 'bearish_reversal':
      return { label: 'Bearish Reversal', className: 'text-red-400 bg-red-500/10 border-red-500/20' }
    case 'continuation':
      return { label: 'Continuation', className: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
    case 'indecision':
      return { label: 'Indecision', className: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
  }
}

function getReliabilityColor(reliability: number) {
  if (reliability >= 70) return 'bg-green-500'
  if (reliability >= 60) return 'bg-amber-500'
  return 'bg-neutral-500'
}

export function CandlestickPatternCard({ pattern }: CandlestickPatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const SvgComponent = CANDLESTICK_SVG_MAP[pattern.name]
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
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${signal.className}`}>
            {signal.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getReliabilityColor(pattern.reliability)}`}
                  style={{ width: `${pattern.reliability}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-neutral-400">{pattern.reliability}%</span>
            </div>
          </div>
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
            <DetailSection label="Identification" value={pattern.identification} />
            <DetailSection label="Context Required" value={pattern.context_required} />
            <DetailSection label="Confirmation" value={pattern.confirmation} />
            <DetailSection label="Failure" value={pattern.failure} color="text-red-400/80" />
          </div>
        )}
      </div>
    </div>
  )
}

function DetailSection({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.15em] mb-1">{label}</p>
      <p className={`text-xs leading-relaxed ${color || 'text-neutral-300'}`}>{value}</p>
    </div>
  )
}
