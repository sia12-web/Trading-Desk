import React from 'react'

interface PatternSvgProps {
  className?: string
}

const BULL = '#10b981'
const BEAR = '#ef4444'
const WICK = '#737373'
const NEUTRAL = '#737373'

// === SINGLE CANDLE PATTERNS ===

export function HammerSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Tiny upper wick */}
      <line x1="60" y1="32" x2="60" y2="48" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Small bullish body at top */}
      <rect x="44" y="48" width="32" height="24" rx="3" fill={BULL} />
      {/* Long lower wick */}
      <line x1="60" y1="72" x2="60" y2="168" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function InvertedHammerSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Long upper wick */}
      <line x1="60" y1="32" x2="60" y2="128" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Small bullish body at bottom */}
      <rect x="44" y="128" width="32" height="24" rx="3" fill={BULL} />
      {/* Tiny lower wick */}
      <line x1="60" y1="152" x2="60" y2="168" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ShootingStarSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Long upper wick */}
      <line x1="60" y1="32" x2="60" y2="128" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Small bearish body at bottom */}
      <rect x="44" y="128" width="32" height="24" rx="3" fill={BEAR} />
      {/* Tiny lower wick */}
      <line x1="60" y1="152" x2="60" y2="168" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function HangingManSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Tiny upper wick */}
      <line x1="60" y1="32" x2="60" y2="48" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Small bearish body at top */}
      <rect x="44" y="48" width="32" height="24" rx="3" fill={BEAR} />
      {/* Long lower wick */}
      <line x1="60" y1="72" x2="60" y2="168" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function DojiSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Upper wick */}
      <line x1="60" y1="40" x2="60" y2="96" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Thin horizontal body line (open = close) */}
      <line x1="42" y1="100" x2="78" y2="100" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      {/* Lower wick */}
      <line x1="60" y1="104" x2="60" y2="160" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function DragonflyDojiSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Horizontal body line at top (open/close at high) */}
      <line x1="42" y1="48" x2="78" y2="48" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
      {/* Long lower wick */}
      <line x1="60" y1="52" x2="60" y2="168" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GravestoneDojiSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Long upper wick */}
      <line x1="60" y1="32" x2="60" y2="148" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      {/* Horizontal body line at bottom (open/close at low) */}
      <line x1="42" y1="152" x2="78" y2="152" stroke="#d4d4d4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function MarubozuBullishSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Large bullish body, no wicks */}
      <rect x="38" y="30" width="44" height="140" rx="4" fill={BULL} />
    </svg>
  )
}

export function MarubozuBearishSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className}>
      {/* Large bearish body, no wicks */}
      <rect x="38" y="30" width="44" height="140" rx="4" fill={BEAR} />
    </svg>
  )
}

// === DOUBLE CANDLE PATTERNS ===

export function BullishEngulfingSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 180 200" fill="none" className={className}>
      {/* Candle 1: small bearish */}
      <line x1="55" y1="55" x2="55" y2="145" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="42" y="75" width="26" height="40" rx="3" fill={BEAR} />
      {/* Candle 2: large bullish engulfing */}
      <line x1="125" y1="40" x2="125" y2="160" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="108" y="55" width="34" height="75" rx="3" fill={BULL} />
    </svg>
  )
}

export function BearishEngulfingSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 180 200" fill="none" className={className}>
      {/* Candle 1: small bullish */}
      <line x1="55" y1="55" x2="55" y2="145" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="42" y="75" width="26" height="40" rx="3" fill={BULL} />
      {/* Candle 2: large bearish engulfing */}
      <line x1="125" y1="40" x2="125" y2="160" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="108" y="55" width="34" height="75" rx="3" fill={BEAR} />
    </svg>
  )
}

export function TweezerTopSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 180 200" fill="none" className={className}>
      {/* Matching highs line (dashed) */}
      <line x1="30" y1="42" x2="150" y2="42" stroke="#525252" strokeWidth="1" strokeDasharray="4,4" />
      {/* Candle 1: bullish */}
      <line x1="60" y1="42" x2="60" y2="150" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="60" width="28" height="50" rx="3" fill={BULL} />
      {/* Candle 2: bearish (same high) */}
      <line x1="120" y1="42" x2="120" y2="145" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="106" y="60" width="28" height="50" rx="3" fill={BEAR} />
    </svg>
  )
}

export function TweezerBottomSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 180 200" fill="none" className={className}>
      {/* Matching lows line (dashed) */}
      <line x1="30" y1="158" x2="150" y2="158" stroke="#525252" strokeWidth="1" strokeDasharray="4,4" />
      {/* Candle 1: bearish */}
      <line x1="60" y1="50" x2="60" y2="158" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="46" y="90" width="28" height="50" rx="3" fill={BEAR} />
      {/* Candle 2: bullish (same low) */}
      <line x1="120" y1="55" x2="120" y2="158" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="106" y="90" width="28" height="50" rx="3" fill={BULL} />
    </svg>
  )
}

// === TRIPLE CANDLE PATTERNS ===

export function MorningStarSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" className={className}>
      {/* Candle 1: large bearish */}
      <line x1="50" y1="28" x2="50" y2="170" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="38" width="28" height="85" rx="3" fill={BEAR} />
      {/* Candle 2: small body (star/indecision) */}
      <line x1="120" y1="115" x2="120" y2="172" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="112" y="132" width="16" height="14" rx="2" fill={NEUTRAL} />
      {/* Candle 3: large bullish */}
      <line x1="190" y1="28" x2="190" y2="160" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="176" y="38" width="28" height="85" rx="3" fill={BULL} />
    </svg>
  )
}

export function EveningStarSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" className={className}>
      {/* Candle 1: large bullish */}
      <line x1="50" y1="28" x2="50" y2="170" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="75" width="28" height="85" rx="3" fill={BULL} />
      {/* Candle 2: small body (star/indecision) at top */}
      <line x1="120" y1="28" x2="120" y2="85" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="112" y="52" width="16" height="14" rx="2" fill={NEUTRAL} />
      {/* Candle 3: large bearish */}
      <line x1="190" y1="28" x2="190" y2="170" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="176" y="75" width="28" height="85" rx="3" fill={BEAR} />
    </svg>
  )
}

export function ThreeWhiteSoldiersSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" className={className}>
      {/* Candle 1: bullish, lowest */}
      <line x1="50" y1="95" x2="50" y2="175" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="105" width="28" height="60" rx="3" fill={BULL} />
      {/* Candle 2: bullish, middle - opens within candle 1 body */}
      <line x1="120" y1="60" x2="120" y2="145" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="106" y="70" width="28" height="60" rx="3" fill={BULL} />
      {/* Candle 3: bullish, highest - opens within candle 2 body */}
      <line x1="190" y1="22" x2="190" y2="110" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="176" y="32" width="28" height="60" rx="3" fill={BULL} />
    </svg>
  )
}

export function ThreeBlackCrowsSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" className={className}>
      {/* Candle 1: bearish, highest */}
      <line x1="50" y1="22" x2="50" y2="110" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="32" width="28" height="60" rx="3" fill={BEAR} />
      {/* Candle 2: bearish, middle */}
      <line x1="120" y1="60" x2="120" y2="145" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="106" y="70" width="28" height="60" rx="3" fill={BEAR} />
      {/* Candle 3: bearish, lowest */}
      <line x1="190" y1="95" x2="190" y2="175" stroke={WICK} strokeWidth="2" strokeLinecap="round" />
      <rect x="176" y="105" width="28" height="60" rx="3" fill={BEAR} />
    </svg>
  )
}

// === LOOKUP MAP ===

export const CANDLESTICK_SVG_MAP: Record<string, React.FC<PatternSvgProps>> = {
  'Hammer': HammerSvg,
  'Inverted Hammer': InvertedHammerSvg,
  'Shooting Star': ShootingStarSvg,
  'Hanging Man': HangingManSvg,
  'Doji': DojiSvg,
  'Dragonfly Doji': DragonflyDojiSvg,
  'Gravestone Doji': GravestoneDojiSvg,
  'Marubozu (Bullish)': MarubozuBullishSvg,
  'Marubozu (Bearish)': MarubozuBearishSvg,
  'Bullish Engulfing': BullishEngulfingSvg,
  'Bearish Engulfing': BearishEngulfingSvg,
  'Tweezer Top': TweezerTopSvg,
  'Tweezer Bottom': TweezerBottomSvg,
  'Morning Star': MorningStarSvg,
  'Evening Star': EveningStarSvg,
  'Three White Soldiers': ThreeWhiteSoldiersSvg,
  'Three Black Crows': ThreeBlackCrowsSvg,
}
