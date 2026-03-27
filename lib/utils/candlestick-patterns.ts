export interface CandlestickPattern {
  name: string
  type: 'single' | 'double' | 'triple'
  signal: 'bullish_reversal' | 'bearish_reversal' | 'continuation' | 'indecision'
  reliability: number
  description: string
  identification: string
  context_required: string
  confirmation: string
  failure: string
}

export const CANDLESTICK_PATTERNS: CandlestickPattern[] = [
  // === SINGLE CANDLE PATTERNS ===
  {
    name: 'Hammer',
    type: 'single',
    signal: 'bullish_reversal',
    reliability: 60,
    description: 'Small body at the top with a long lower wick (at least 2x the body). Shows sellers pushed price down but buyers took control by close.',
    identification: 'Small body near candle high. Long lower shadow at least 2x body length. Little to no upper shadow.',
    context_required: 'Only meaningful at the bottom of a downtrend or at a support level. A hammer in the middle of a range is noise.',
    confirmation: 'Next candle closes above the hammer\'s high. Increasing volume on the confirmation candle strengthens the signal.',
    failure: 'Next candle closes below the hammer\'s low — the downtrend continues.'
  },
  {
    name: 'Inverted Hammer',
    type: 'single',
    signal: 'bullish_reversal',
    reliability: 55,
    description: 'Small body at the bottom with a long upper wick. Buyers tried to push up but sellers fought back. Still bullish if confirmed because it shows buying interest is emerging.',
    identification: 'Small body near candle low. Long upper shadow at least 2x body length. Little to no lower shadow.',
    context_required: 'Must be at the bottom of a downtrend. Weaker signal than a regular hammer.',
    confirmation: 'Next candle must close above the inverted hammer\'s body to confirm. Without confirmation, ignore.',
    failure: 'Next candle closes lower — no buying follow-through.'
  },
  {
    name: 'Shooting Star',
    type: 'single',
    signal: 'bearish_reversal',
    reliability: 60,
    description: 'Small body at the bottom with a long upper wick. Buyers pushed price up but sellers rejected it hard. The opposite of a hammer.',
    identification: 'Small body near candle low. Long upper shadow at least 2x body length. Little to no lower shadow.',
    context_required: 'Only meaningful at the top of an uptrend or at a resistance level. At support, this pattern means nothing.',
    confirmation: 'Next candle closes below the shooting star\'s low. Increasing volume on the breakdown strengthens the signal.',
    failure: 'Next candle closes above the shooting star\'s high — uptrend continues.'
  },
  {
    name: 'Hanging Man',
    type: 'single',
    signal: 'bearish_reversal',
    reliability: 55,
    description: 'Looks identical to a hammer but appears at the TOP of an uptrend. Shows sellers briefly took control during the session — a warning sign.',
    identification: 'Same shape as hammer: small body at top, long lower wick. But it appears after an uptrend.',
    context_required: 'Must be at the top of an uptrend or at resistance. At support, this is a hammer (bullish).',
    confirmation: 'Next candle closes below the hanging man\'s body. This is a weaker signal than a shooting star — needs confirmation.',
    failure: 'Next candle closes higher — uptrend continues, ignore the pattern.'
  },
  {
    name: 'Doji',
    type: 'single',
    signal: 'indecision',
    reliability: 50,
    description: 'Open and close are nearly identical — creates a cross or plus shape. Neither buyers nor sellers won. Signals indecision and potential trend change.',
    identification: 'Very small or no body. Upper and lower shadows can vary. The key is open = close.',
    context_required: 'At key levels (support/resistance), a doji signals the current trend is losing momentum. In a range, it\'s just indecision.',
    confirmation: 'The candle AFTER the doji determines direction. Bullish close after = reversal up. Bearish close after = reversal down.',
    failure: 'Multiple dojis in a row = choppy market, no clear signal. Stay out.'
  },
  {
    name: 'Dragonfly Doji',
    type: 'single',
    signal: 'bullish_reversal',
    reliability: 58,
    description: 'Open and close at the high with a long lower shadow. Like a doji that\'s also a hammer. Strong bullish reversal signal at support.',
    identification: 'Open and close at or near the high. Long lower shadow. No upper shadow.',
    context_required: 'Strongest at support levels or after a downtrend. Signals complete rejection of lower prices.',
    confirmation: 'Next candle closes above the dragonfly — confirms the reversal.',
    failure: 'Next candle makes a new low — the selling pressure was too strong.'
  },
  {
    name: 'Gravestone Doji',
    type: 'single',
    signal: 'bearish_reversal',
    reliability: 58,
    description: 'Open and close at the low with a long upper shadow. Like a doji that\'s also a shooting star. Strong bearish reversal signal at resistance.',
    identification: 'Open and close at or near the low. Long upper shadow. No lower shadow.',
    context_required: 'Strongest at resistance levels or after an uptrend. Signals complete rejection of higher prices.',
    confirmation: 'Next candle closes below the gravestone — confirms the reversal.',
    failure: 'Next candle makes a new high — buyers overpowered the rejection.'
  },
  {
    name: 'Marubozu (Bullish)',
    type: 'single',
    signal: 'continuation',
    reliability: 70,
    description: 'Large bullish candle with no shadows (or very tiny). Open equals the low, close equals the high. Pure buying pressure with zero hesitation.',
    identification: 'Large green/white body. No upper or lower shadows. Open = low, close = high.',
    context_required: 'Strong continuation signal in an uptrend. At the start of a new trend, signals strong conviction. Can also signal a breakout.',
    confirmation: 'Self-confirming — the sheer size and lack of wicks shows complete dominance. But watch for exhaustion if it follows many bullish candles.',
    failure: 'Next candle reverses more than 50% of the marubozu — was an exhaustion move.'
  },
  {
    name: 'Marubozu (Bearish)',
    type: 'single',
    signal: 'continuation',
    reliability: 70,
    description: 'Large bearish candle with no shadows. Open equals the high, close equals the low. Pure selling pressure.',
    identification: 'Large red/black body. No shadows. Open = high, close = low.',
    context_required: 'Strong continuation in a downtrend or panic selling signal. If it appears after a long uptrend, could signal trend reversal.',
    confirmation: 'Self-confirming. But if it appears at a strong support level, the next candle is critical.',
    failure: 'Next candle recovers more than 50% — was a capitulation (potential reversal).'
  },

  // === DOUBLE CANDLE PATTERNS ===
  {
    name: 'Bullish Engulfing',
    type: 'double',
    signal: 'bullish_reversal',
    reliability: 65,
    description: 'A small bearish candle followed by a large bullish candle that completely engulfs (covers) the previous candle\'s body. Buyers overwhelmed sellers.',
    identification: 'Candle 1: small bearish body. Candle 2: large bullish body that opens below candle 1\'s close and closes above candle 1\'s open.',
    context_required: 'Must be at the bottom of a downtrend or at support. In an uptrend, this is just normal buying.',
    confirmation: 'Third candle closes above the engulfing candle\'s high. Volume increasing on the engulfing candle is a strong confirm.',
    failure: 'Price falls below the engulfing candle\'s low — the reversal failed.'
  },
  {
    name: 'Bearish Engulfing',
    type: 'double',
    signal: 'bearish_reversal',
    reliability: 65,
    description: 'A small bullish candle followed by a large bearish candle that completely engulfs the previous candle. Sellers overwhelmed buyers.',
    identification: 'Candle 1: small bullish body. Candle 2: large bearish body that opens above candle 1\'s close and closes below candle 1\'s open.',
    context_required: 'Must be at the top of an uptrend or at resistance. In a downtrend, this is just continued selling.',
    confirmation: 'Third candle closes below the engulfing candle\'s low. Increasing volume strengthens the signal.',
    failure: 'Price rallies above the engulfing candle\'s high — reversal rejected.'
  },
  {
    name: 'Tweezer Top',
    type: 'double',
    signal: 'bearish_reversal',
    reliability: 60,
    description: 'Two candles with nearly identical highs. First is bullish, second is bearish. Price tested a level twice and got rejected both times.',
    identification: 'Two consecutive candles with matching highs (within a few pips). First bullish, second bearish. Like tweezers pointing up.',
    context_required: 'At resistance or after an uptrend. The double rejection is the key — the market tried twice and failed twice.',
    confirmation: 'Next candle closes below both tweezers. Volume spike on the bearish candle strengthens the signal.',
    failure: 'Price breaks above the tweezers\' high — the resistance is broken, not confirmed.'
  },
  {
    name: 'Tweezer Bottom',
    type: 'double',
    signal: 'bullish_reversal',
    reliability: 60,
    description: 'Two candles with nearly identical lows. First is bearish, second is bullish. Price tested support twice and held both times.',
    identification: 'Two consecutive candles with matching lows. First bearish, second bullish. Like tweezers pointing down.',
    context_required: 'At support or after a downtrend. Double test of support that holds is a strong floor.',
    confirmation: 'Next candle closes above both tweezers. Volume picking up on the bullish candle confirms buying interest.',
    failure: 'Price breaks below the tweezers\' low — support failed.'
  },

  // === TRIPLE CANDLE PATTERNS ===
  {
    name: 'Morning Star',
    type: 'triple',
    signal: 'bullish_reversal',
    reliability: 70,
    description: 'Three-candle bottom reversal. Candle 1: large bearish. Candle 2: small body (indecision — the star). Candle 3: large bullish that closes into candle 1\'s body. The tide is turning.',
    identification: 'Candle 1: large bearish. Candle 2: small body (gap down from candle 1 in stocks; in forex, just a small body). Candle 3: large bullish closing above midpoint of candle 1.',
    context_required: 'At support or after an extended downtrend. One of the most reliable reversal patterns.',
    confirmation: 'Self-confirming due to three candles. Volume should be low on candle 2, high on candle 3.',
    failure: 'Price falls below candle 2\'s low — the reversal attempt failed.'
  },
  {
    name: 'Evening Star',
    type: 'triple',
    signal: 'bearish_reversal',
    reliability: 70,
    description: 'Three-candle top reversal. Candle 1: large bullish. Candle 2: small body (indecision). Candle 3: large bearish closing into candle 1\'s body. The uptrend is exhausting.',
    identification: 'Candle 1: large bullish. Candle 2: small body. Candle 3: large bearish closing below midpoint of candle 1.',
    context_required: 'At resistance or after an extended uptrend. Very reliable — one of the strongest reversal signals.',
    confirmation: 'Self-confirming. Volume declining on candle 2, increasing on candle 3 is ideal.',
    failure: 'Price rallies above candle 2\'s high — bulls regained control.'
  },
  {
    name: 'Three White Soldiers',
    type: 'triple',
    signal: 'bullish_reversal',
    reliability: 72,
    description: 'Three consecutive large bullish candles, each closing higher. Each opens within the previous candle\'s body. Strong, sustained buying pressure.',
    identification: 'Three green candles in a row. Each with a higher close. Each opens within the prior candle\'s body (not gapping up). Small or no upper shadows.',
    context_required: 'After a downtrend or at a major support. Signals the start of a new bullish trend. In an existing uptrend, signals strong continuation.',
    confirmation: 'Self-confirming. Volume should increase across all three candles.',
    failure: 'Fourth candle is a large bearish candle — could be an exhaustion reversal.'
  },
  {
    name: 'Three Black Crows',
    type: 'triple',
    signal: 'bearish_reversal',
    reliability: 72,
    description: 'Three consecutive large bearish candles, each closing lower. Strong, sustained selling pressure. The mirror of Three White Soldiers.',
    identification: 'Three red candles in a row. Each with a lower close. Each opens within the prior candle\'s body. Small or no lower shadows.',
    context_required: 'After an uptrend or at resistance. Signals the start of a bearish trend.',
    confirmation: 'Self-confirming. Increasing volume across all three strengthens the signal.',
    failure: 'Fourth candle is a strong bullish candle with high volume — possible capitulation bottom.'
  }
]

export function getPatternsBySignal(signal: CandlestickPattern['signal']): CandlestickPattern[] {
  return CANDLESTICK_PATTERNS.filter(p => p.signal === signal)
}

export function getPatternByName(name: string): CandlestickPattern | undefined {
  return CANDLESTICK_PATTERNS.find(p => p.name.toLowerCase() === name.toLowerCase())
}
