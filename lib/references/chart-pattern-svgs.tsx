import React from 'react'

interface PatternSvgProps {
  className?: string
}

const PRICE = '#e5e5e5'
const NECKLINE = '#f59e0b'
const SUPPORT = '#3b82f6'
const BREAKOUT_BULL = '#10b981'
const BREAKOUT_BEAR = '#ef4444'

// === REVERSAL PATTERNS ===

export function HeadAndShouldersSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action */}
      <polyline
        points="15,145 45,105 65,135 95,50 125,135 155,100 185,140"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Neckline */}
      <line x1="55" y1="135" x2="195" y2="140" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakdown */}
      <polyline
        points="185,140 215,155 250,180"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Labels */}
      <text x="38" y="98" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">LS</text>
      <text x="95" y="42" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">H</text>
      <text x="155" y="93" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">RS</text>
      <text x="210" y="130" fill={NECKLINE} fontSize="8" fontWeight="bold">Neckline</text>
    </svg>
  )
}

export function InverseHeadAndShouldersSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action */}
      <polyline
        points="15,55 45,95 65,65 95,155 125,65 155,100 185,60"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Neckline */}
      <line x1="55" y1="65" x2="195" y2="60" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakout up */}
      <polyline
        points="185,60 215,45 250,20"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Labels */}
      <text x="38" y="105" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">LS</text>
      <text x="95" y="168" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">H</text>
      <text x="155" y="113" fill="#737373" fontSize="9" fontWeight="bold" textAnchor="middle">RS</text>
      <text x="210" y="78" fill={NECKLINE} fontSize="8" fontWeight="bold">Neckline</text>
    </svg>
  )
}

export function DoubleTopSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action - M shape */}
      <polyline
        points="20,155 70,50 120,125 175,50 220,130"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Resistance line */}
      <line x1="55" y1="50" x2="190" y2="50" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Neckline at support */}
      <line x1="100" y1="125" x2="240" y2="130" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakdown */}
      <polyline
        points="220,130 245,155 265,178"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
      <text x="200" y="45" fill={SUPPORT} fontSize="8" fontWeight="bold">Resistance</text>
    </svg>
  )
}

export function DoubleBottomSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action - W shape */}
      <polyline
        points="20,45 70,150 120,75 175,150 220,70"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Support line */}
      <line x1="55" y1="150" x2="190" y2="150" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Neckline at resistance */}
      <line x1="100" y1="75" x2="240" y2="70" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakout up */}
      <polyline
        points="220,70 245,48 265,25"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
      <text x="200" y="163" fill={SUPPORT} fontSize="8" fontWeight="bold">Support</text>
    </svg>
  )
}

export function TripleTopSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action - three peaks */}
      <polyline
        points="15,145 45,50 75,120 115,50 150,120 190,50 220,125"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Resistance */}
      <line x1="30" y1="50" x2="205" y2="50" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Support/Neckline */}
      <line x1="60" y1="120" x2="240" y2="125" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakdown */}
      <polyline
        points="220,125 245,150 265,175"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function TripleBottomSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Price action - three troughs */}
      <polyline
        points="15,55 45,150 75,80 115,150 150,80 190,150 220,75"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Support */}
      <line x1="30" y1="150" x2="205" y2="150" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Resistance/Neckline */}
      <line x1="60" y1="80" x2="240" y2="75" stroke={NECKLINE} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Breakout up */}
      <polyline
        points="220,75 245,50 265,25"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function RisingWedgeSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Upper trendline (resistance - rising) */}
      <line x1="30" y1="120" x2="200" y2="40" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Lower trendline (support - rising steeper) */}
      <line x1="30" y1="170" x2="200" y2="65" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action inside wedge */}
      <polyline
        points="30,168 60,122 80,160 110,85 130,130 160,60 185,95 200,55"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakdown */}
      <polyline
        points="200,80 230,120 260,170"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function FallingWedgeSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Upper trendline (resistance - falling) */}
      <line x1="30" y1="40" x2="200" y2="120" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Lower trendline (support - falling steeper) */}
      <line x1="30" y1="65" x2="200" y2="160" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action inside wedge */}
      <polyline
        points="30,50 60,62 80,48 110,100 130,78 160,130 185,110 200,140"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout up */}
      <polyline
        points="200,120 230,80 260,30"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

// === CONTINUATION PATTERNS ===

export function AscendingTriangleSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Flat resistance */}
      <line x1="40" y1="50" x2="210" y2="50" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Rising support */}
      <line x1="40" y1="170" x2="200" y2="60" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action */}
      <polyline
        points="40,168 65,52 90,140 120,52 145,110 170,52 195,80 205,52"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout up */}
      <polyline
        points="205,52 230,35 260,15"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function DescendingTriangleSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Flat support */}
      <line x1="40" y1="150" x2="210" y2="150" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Falling resistance */}
      <line x1="40" y1="30" x2="200" y2="140" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action */}
      <polyline
        points="40,32 65,148 90,60 120,148 145,90 170,148 195,120 205,148"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakdown */}
      <polyline
        points="205,148 230,165 260,185"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function SymmetricalTriangleSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Falling resistance */}
      <line x1="30" y1="30" x2="200" y2="95" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Rising support */}
      <line x1="30" y1="170" x2="200" y2="105" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action */}
      <polyline
        points="30,32 55,168 85,48 115,155 140,65 165,135 190,85 200,100"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout (neutral - show both possibilities with dashed) */}
      <polyline
        points="200,95 230,65 255,30"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4,3"
      />
      <polyline
        points="200,105 230,135 255,170"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4,3"
      />
      <text x="258" y="28" fill={BREAKOUT_BULL} fontSize="8" fontWeight="bold">?</text>
      <text x="258" y="175" fill={BREAKOUT_BEAR} fontSize="8" fontWeight="bold">?</text>
    </svg>
  )
}

export function BullFlagSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Flagpole - sharp rally */}
      <polyline
        points="25,175 55,170 75,100 95,60 105,35"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Flag channel - slight downward slope */}
      <line x1="105" y1="35" x2="190" y2="60" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      <line x1="105" y1="70" x2="190" y2="95" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      {/* Price inside flag */}
      <polyline
        points="105,35 120,68 135,45 150,80 165,55 180,90 190,72"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout up */}
      <polyline
        points="190,60 220,35 255,10"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function BearFlagSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Flagpole - sharp decline */}
      <polyline
        points="25,25 55,30 75,100 95,140 105,165"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Flag channel - slight upward slope */}
      <line x1="105" y1="130" x2="190" y2="105" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      <line x1="105" y1="165" x2="190" y2="140" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      {/* Price inside flag */}
      <polyline
        points="105,165 120,132 135,155 150,120 165,145 180,110 190,128"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakdown */}
      <polyline
        points="190,140 220,165 255,190"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function PennantSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Flagpole */}
      <polyline
        points="20,170 45,160 65,100 85,55 100,30"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Pennant (small symmetrical triangle) */}
      <line x1="100" y1="30" x2="190" y2="72" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      <line x1="100" y1="75" x2="190" y2="72" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="5,3" />
      {/* Price inside pennant */}
      <polyline
        points="100,30 115,73 130,40 148,68 165,50 180,65 190,58"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout up */}
      <polyline
        points="190,58 215,35 250,10"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function RectangleSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Resistance */}
      <line x1="30" y1="50" x2="210" y2="50" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Support */}
      <line x1="30" y1="145" x2="210" y2="145" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price bouncing inside */}
      <polyline
        points="20,80 45,52 65,143 90,52 115,143 140,52 165,143 195,52 210,100"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout */}
      <polyline
        points="210,50 235,30 260,10"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
      <text x="215" y="63" fill={SUPPORT} fontSize="8" fontWeight="bold">R</text>
      <text x="215" y="143" fill={SUPPORT} fontSize="8" fontWeight="bold">S</text>
    </svg>
  )
}

export function ChannelSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      {/* Upper channel line (ascending) */}
      <line x1="20" y1="100" x2="220" y2="20" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Lower channel line (ascending parallel) */}
      <line x1="20" y1="175" x2="220" y2="95" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      {/* Price action bouncing between */}
      <polyline
        points="20,173 50,102 75,160 105,68 135,135 165,42 195,110 220,30"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      {/* Breakout up */}
      <polyline
        points="220,30 245,10 265,5"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function ChannelUpSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      <line x1="20" y1="100" x2="220" y2="20" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      <line x1="20" y1="175" x2="220" y2="95" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      <polyline
        points="20,173 50,102 75,160 105,68 135,135 165,42 195,110 220,30"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <polyline
        points="220,30 245,10 265,5"
        stroke={BREAKOUT_BULL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function ChannelDownSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      <line x1="20" y1="20" x2="220" y2="100" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      <line x1="20" y1="95" x2="220" y2="175" stroke={SUPPORT} strokeWidth="1.5" strokeDasharray="6,4" />
      <polyline
        points="20,22 50,93 75,35 105,127 135,60 165,153 195,85 220,165"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <polyline
        points="220,165 245,185 265,190"
        stroke={BREAKOUT_BEAR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  )
}

export function SupportSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      <line x1="30" y1="145" x2="210" y2="145" stroke={SUPPORT} strokeWidth="2.5" />
      <polyline
        points="20,70 60,110 90,143 125,70 160,110 190,143 210,90"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <text x="215" y="148" fill={SUPPORT} fontSize="9" fontWeight="bold">Support</text>
    </svg>
  )
}

export function ResistanceSvg({ className }: PatternSvgProps) {
  return (
    <svg viewBox="0 0 280 200" fill="none" className={className}>
      <line x1="30" y1="55" x2="210" y2="55" stroke={SUPPORT} strokeWidth="2.5" />
      <polyline
        points="20,130 60,90 90,57 125,130 160,90 190,57 210,110"
        stroke={PRICE} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <text x="215" y="58" fill={SUPPORT} fontSize="9" fontWeight="bold">Resistance</text>
    </svg>
  )
}

// === LOOKUP MAP ===

export const CHART_PATTERN_SVG_MAP: Record<string, React.FC<PatternSvgProps>> = {
  'Head and Shoulders': HeadAndShouldersSvg,
  'Inverse Head and Shoulders': InverseHeadAndShouldersSvg,
  'Double Top': DoubleTopSvg,
  'Double Bottom': DoubleBottomSvg,
  'Triple Top': TripleTopSvg,
  'Triple Bottom': TripleBottomSvg,
  'Rising Wedge': RisingWedgeSvg,
  'Falling Wedge': FallingWedgeSvg,
  'Ascending Triangle': AscendingTriangleSvg,
  'Descending Triangle': DescendingTriangleSvg,
  'Symmetrical Triangle': SymmetricalTriangleSvg,
  'Bull Flag': BullFlagSvg,
  'Bear Flag': BearFlagSvg,
  'Pennant': PennantSvg,
  'Rectangle': RectangleSvg,
  'Channel': ChannelSvg,
  'Channel Up': ChannelUpSvg,
  'Channel Down': ChannelDownSvg,
  'Support': SupportSvg,
  'Resistance': ResistanceSvg,
}
