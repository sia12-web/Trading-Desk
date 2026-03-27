export interface ChartPattern {
  name: string
  category: 'reversal' | 'continuation'
  signal: 'bullish' | 'bearish' | 'neutral'
  description: string
  keyCharacteristics: string[]
  howToTrade: string
  failureMode: string
}

export const CHART_PATTERNS: ChartPattern[] = [
  // === REVERSAL PATTERNS ===
  {
    name: 'Head and Shoulders',
    category: 'reversal',
    signal: 'bearish',
    description: 'Three peaks where the middle peak (head) is higher than the two outer peaks (shoulders). A neckline connects the two troughs. Signals the end of an uptrend.',
    keyCharacteristics: [
      'Left shoulder, head (higher), right shoulder form three peaks',
      'Neckline connects the two troughs between the peaks',
      'Volume typically decreases on each successive peak',
      'Right shoulder usually forms on lower volume than the left'
    ],
    howToTrade: 'Enter short when price breaks below the neckline. Target is the distance from the head to the neckline, projected downward from the breakout point. Place stop loss above the right shoulder.',
    failureMode: 'Price breaks above the right shoulder instead of breaking the neckline — uptrend resumes.'
  },
  {
    name: 'Inverse Head and Shoulders',
    category: 'reversal',
    signal: 'bullish',
    description: 'Three troughs where the middle trough (head) is lower than the two outer troughs (shoulders). The mirror image of Head and Shoulders. Signals the end of a downtrend.',
    keyCharacteristics: [
      'Left shoulder, head (lower), right shoulder form three troughs',
      'Neckline connects the two peaks between the troughs',
      'Volume should increase on the breakout above the neckline',
      'Right shoulder often forms on higher volume than the left'
    ],
    howToTrade: 'Enter long when price breaks above the neckline. Target is the distance from the head to the neckline, projected upward from the breakout point. Place stop loss below the right shoulder.',
    failureMode: 'Price breaks below the right shoulder — downtrend continues.'
  },
  {
    name: 'Double Top',
    category: 'reversal',
    signal: 'bearish',
    description: 'Price hits a resistance level twice, forming two roughly equal peaks with a trough between them. The market tried twice and failed twice — sellers are in control at that level.',
    keyCharacteristics: [
      'Two peaks at approximately the same price level',
      'A trough (support) between the two peaks forms the neckline',
      'Volume typically lower on the second peak',
      'Looks like the letter "M"'
    ],
    howToTrade: 'Enter short when price breaks below the trough (neckline) between the peaks. Target equals the height from peaks to trough, projected downward. Stop above the second peak.',
    failureMode: 'Price breaks above both peaks — resistance broken, uptrend continues.'
  },
  {
    name: 'Double Bottom',
    category: 'reversal',
    signal: 'bullish',
    description: 'Price hits a support level twice, forming two roughly equal troughs with a peak between them. The market tested support twice and held — buyers are defending that level.',
    keyCharacteristics: [
      'Two troughs at approximately the same price level',
      'A peak (resistance) between the two troughs forms the neckline',
      'Volume typically increases on the second bounce',
      'Looks like the letter "W"'
    ],
    howToTrade: 'Enter long when price breaks above the peak (neckline) between the troughs. Target equals the height from troughs to peak, projected upward. Stop below the second trough.',
    failureMode: 'Price breaks below both troughs — support failed, downtrend continues.'
  },
  {
    name: 'Triple Top',
    category: 'reversal',
    signal: 'bearish',
    description: 'Price tests the same resistance level three times and gets rejected each time. Stronger signal than a double top because sellers defended the level three times.',
    keyCharacteristics: [
      'Three peaks at approximately the same price level',
      'Two troughs between the peaks form the support/neckline',
      'Volume typically decreases on each successive peak',
      'Rare but very reliable when it forms'
    ],
    howToTrade: 'Enter short when price breaks below the support line connecting the troughs. Target is the distance from the peaks to the support, projected downward. Stop above the third peak.',
    failureMode: 'Price breaks above all three peaks on the fourth attempt — extremely bullish breakout.'
  },
  {
    name: 'Triple Bottom',
    category: 'reversal',
    signal: 'bullish',
    description: 'Price tests the same support level three times and bounces each time. Very strong support signal — buyers have defended this level aggressively.',
    keyCharacteristics: [
      'Three troughs at approximately the same price level',
      'Two peaks between the troughs form the resistance/neckline',
      'Volume may increase on each successive bounce',
      'Rare but very reliable when it forms'
    ],
    howToTrade: 'Enter long when price breaks above the resistance line connecting the peaks. Target is the distance from the troughs to the resistance, projected upward. Stop below the third trough.',
    failureMode: 'Price breaks below all three troughs — support completely failed.'
  },
  {
    name: 'Rising Wedge',
    category: 'reversal',
    signal: 'bearish',
    description: 'Both support and resistance lines slope upward, but they converge. Price makes higher highs and higher lows, but the range is narrowing. Buying pressure is weakening — often breaks down.',
    keyCharacteristics: [
      'Both trendlines slope upward but converge',
      'Higher highs and higher lows, but with decreasing momentum',
      'Volume typically decreases as the wedge progresses',
      'Usually breaks to the downside (bearish)'
    ],
    howToTrade: 'Enter short when price breaks below the lower trendline. Target is the height of the wedge at its widest point, projected downward. Stop above the last swing high inside the wedge.',
    failureMode: 'Price breaks above the upper trendline — uptrend accelerates.'
  },
  {
    name: 'Falling Wedge',
    category: 'reversal',
    signal: 'bullish',
    description: 'Both support and resistance lines slope downward, but they converge. Price makes lower highs and lower lows, but sellers are losing steam. Usually breaks to the upside.',
    keyCharacteristics: [
      'Both trendlines slope downward but converge',
      'Lower highs and lower lows, but with decreasing momentum',
      'Volume typically decreases, then spikes on the breakout',
      'Usually breaks to the upside (bullish)'
    ],
    howToTrade: 'Enter long when price breaks above the upper trendline. Target is the height of the wedge at its widest point, projected upward. Stop below the last swing low inside the wedge.',
    failureMode: 'Price breaks below the lower trendline — downtrend accelerates.'
  },

  // === CONTINUATION PATTERNS ===
  {
    name: 'Ascending Triangle',
    category: 'continuation',
    signal: 'bullish',
    description: 'Flat resistance at the top with rising support (higher lows). Each bounce gets closer to the resistance. Buyers are getting more aggressive — usually breaks up.',
    keyCharacteristics: [
      'Flat horizontal resistance line at the top',
      'Rising support line connecting higher lows',
      'Volume typically decreases during formation',
      'Breakout usually to the upside with volume surge'
    ],
    howToTrade: 'Enter long when price breaks above the flat resistance line with increased volume. Target is the height of the triangle at its widest point, projected upward. Stop below the last higher low.',
    failureMode: 'Price breaks below the rising support — the pattern fails, expect further downside.'
  },
  {
    name: 'Descending Triangle',
    category: 'continuation',
    signal: 'bearish',
    description: 'Flat support at the bottom with falling resistance (lower highs). Each rally gets weaker. Sellers are pushing harder — usually breaks down.',
    keyCharacteristics: [
      'Flat horizontal support line at the bottom',
      'Falling resistance line connecting lower highs',
      'Volume typically decreases during formation',
      'Breakout usually to the downside'
    ],
    howToTrade: 'Enter short when price breaks below the flat support line. Target is the height of the triangle projected downward. Stop above the last lower high.',
    failureMode: 'Price breaks above the descending resistance — unexpected bullish breakout.'
  },
  {
    name: 'Symmetrical Triangle',
    category: 'continuation',
    signal: 'neutral',
    description: 'Converging trendlines with lower highs AND higher lows. Neither buyers nor sellers are winning. Direction of breakout determines the trend — trades in the direction of the prior trend.',
    keyCharacteristics: [
      'Both trendlines converge symmetrically',
      'Lower highs and higher lows create a coiling pattern',
      'Volume decreases as the triangle narrows',
      'Breaks in the direction of the prior trend ~65% of the time'
    ],
    howToTrade: 'Wait for the breakout direction. Enter in the direction of the break. Target is the height of the triangle at its widest, projected from the breakout point. Stop on the other side of the triangle.',
    failureMode: 'False breakout — price breaks one direction then immediately reverses. Wait for a candle close outside the triangle to confirm.'
  },
  {
    name: 'Bull Flag',
    category: 'continuation',
    signal: 'bullish',
    description: 'A sharp rally (the flagpole) followed by a small downward-sloping channel (the flag). The flag is a brief pause before the next leg up. Very common in trending markets.',
    keyCharacteristics: [
      'Strong upward move forms the flagpole',
      'Small downward-sloping parallel channel forms the flag',
      'Volume decreases during the flag, increases on breakout',
      'Flag typically retraces 38.2-50% of the flagpole'
    ],
    howToTrade: 'Enter long when price breaks above the upper boundary of the flag channel. Target is the length of the flagpole, projected upward from the breakout. Stop below the flag\'s low.',
    failureMode: 'Flag breaks down below the lower boundary — the trend may be reversing.'
  },
  {
    name: 'Bear Flag',
    category: 'continuation',
    signal: 'bearish',
    description: 'A sharp decline (the flagpole) followed by a small upward-sloping channel (the flag). The flag is a brief bounce before the next leg down.',
    keyCharacteristics: [
      'Strong downward move forms the flagpole',
      'Small upward-sloping parallel channel forms the flag',
      'Volume decreases during the flag, increases on breakdown',
      'Flag typically retraces 38.2-50% of the flagpole'
    ],
    howToTrade: 'Enter short when price breaks below the lower boundary of the flag channel. Target is the length of the flagpole, projected downward from the breakdown. Stop above the flag\'s high.',
    failureMode: 'Flag breaks up above the upper boundary — potential trend reversal.'
  },
  {
    name: 'Pennant',
    category: 'continuation',
    signal: 'neutral',
    description: 'A sharp move (flagpole) followed by a small symmetrical triangle. Like a flag but the consolidation narrows instead of being a channel. Resolves in the direction of the prior move.',
    keyCharacteristics: [
      'Strong directional move forms the flagpole',
      'Small symmetrical triangle forms after the move',
      'Very short consolidation period (1-3 weeks on daily)',
      'Volume drops during the pennant, spikes on breakout'
    ],
    howToTrade: 'Enter in the direction of the flagpole when price breaks out of the pennant. Target is the flagpole length projected from the breakout. Stop on the opposite side of the pennant.',
    failureMode: 'Breakout in the opposite direction of the flagpole — the trend has reversed.'
  },
  {
    name: 'Rectangle',
    category: 'continuation',
    signal: 'neutral',
    description: 'Price bounces between horizontal support and resistance, creating a box/range. The market is consolidating. Usually resolves in the direction of the prior trend.',
    keyCharacteristics: [
      'Clear horizontal support and resistance levels',
      'Price bounces between the two levels at least twice each',
      'Volume may decrease during the range',
      'Breakout direction follows the prior trend ~60% of the time'
    ],
    howToTrade: 'Trade the breakout from the rectangle. Enter long above resistance or short below support. Target is the height of the rectangle projected from the breakout point. Can also trade bounces within the range.',
    failureMode: 'False breakout — price briefly breaks a level then returns inside the range. Use a candle close filter.'
  },
  {
    name: 'Channel',
    category: 'continuation',
    signal: 'neutral',
    description: 'Price moves between two parallel trendlines (ascending or descending). The trend continues within the channel until a breakout occurs. Can trade bounces within or wait for breakout.',
    keyCharacteristics: [
      'Two parallel trendlines containing the price action',
      'Can be ascending (bullish), descending (bearish), or horizontal',
      'Price respects both boundaries with multiple touches',
      'Breakout from the channel signals acceleration or reversal'
    ],
    howToTrade: 'Inside the channel: buy at support line, sell at resistance line. On breakout above: enter long. On breakdown below: enter short. Target is the channel width projected from the breakout.',
    failureMode: 'Channel boundaries become unreliable — price starts cutting through trendlines without clear direction.'
  },
  {
    name: 'Channel Up',
    category: 'continuation',
    signal: 'bullish',
    description: 'Price moves upwards on higher highs and higher lows between two parallel rising trendlines. Buyers are in continuous control, pushing the trend higher.',
    keyCharacteristics: [
      'Two upward-sloping parallel trendlines bounding price action',
      'Higher highs and higher lows touch upper and lower boundaries',
      'Volume usually steady within the channel, expanding on breakouts',
      'Signals strong, steady uptrend'
    ],
    howToTrade: 'Buy at the support (lower) trendline with confirmation. Place stop loss just below that trendline. Take profit at the resistance (upper) trendline or ride breakout up.',
    failureMode: 'Price breaks down out of the channel bottom trendline — potential trend reversal.'
  },
  {
    name: 'Channel Down',
    category: 'continuation',
    signal: 'bearish',
    description: 'Price moves downwards on lower highs and lower lows between two parallel falling trendlines. Sellers are in control, suppressing rallies.',
    keyCharacteristics: [
      'Two downward-sloping parallel trendlines bounding price action',
      'Lower highs and lower lows touch upper and lower boundaries',
      'Generally bearish continuation structures',
      'Price respects parallel tracks firmly'
    ],
    howToTrade: 'Sell at the resistance (upper) trendline with confirmation. Place stop loss above that trendline. Take profit at the support (lower) trendline or ride breakdown.',
    failureMode: 'Price breaks up out of the channel top trendline — potential trend reversal upwards.'
  },
  {
    name: 'Support',
    category: 'continuation',
    signal: 'bullish',
    description: 'A price level where a downtrend tends to pause due to a concentration of demand (buying interest). It acts as a floor that price struggles to break below.',
    keyCharacteristics: [
      'Acts as a price floor',
      'Concentration of buy orders overpowers sell requests',
      'Volume often swells when price re-tests the floor',
      'Breached support often turns into future resistance'
    ],
    howToTrade: 'Look for bullish candlestick reversal patterns at the support level. Look for low volume tests or spikes holding the floor to enter long with minimum risks.',
    failureMode: 'Supported floor breaks to the downside — becomes a bearish breakdown triggers setups.'
  },
  {
    name: 'Resistance',
    category: 'continuation',
    signal: 'bearish',
    description: 'A price level where an uptrend tends to pause due to a concentration of supply (selling interest). It acts as a ceiling that price struggles to break above.',
    keyCharacteristics: [
      'Acts as a price ceiling',
      'Concentration of sell orders overpowers buy requests',
      'Price gets rejected downwards repeatedly at the zone',
      'Breached resistance often turns into future support levels'
    ],
    howToTrade: 'Look for bearish candlestick reversal patterns at the resistance ceiling. Look for exhaustion spikes testing the level before entering shorts setup.',
    failureMode: 'Resisted ceiling breaks to the upside on strong volumes — becomes high volume breakout setups.'
  }
]

export function getChartPatternsByCategory(category: ChartPattern['category']): ChartPattern[] {
  return CHART_PATTERNS.filter(p => p.category === category)
}

export function getChartPatternByName(name: string): ChartPattern | undefined {
  return CHART_PATTERNS.find(p => p.name.toLowerCase() === name.toLowerCase())
}
