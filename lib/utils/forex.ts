/**
 * Convert OANDA instrument name (EUR_USD) to display pair (EUR/USD)
 */
export function oandaToDisplayPair(instrument: string): string {
    return instrument.replace('_', '/')
}

/**
 * Convert display pair (EUR/USD) to OANDA instrument name (EUR_USD)
 */
export function displayToOandaPair(pair: string): string {
    return pair.replace('/', '_')
}

/**
 * Calculate pips for a given trade.
 * For standard pairs, 1 pip = 0.0001 (pipLocation = -4)
 * For JPY pairs, 1 pip = 0.01 (pipLocation = -2)
 */
export function calculatePips(
    entry: number,
    exit: number,
    direction: 'long' | 'short',
    pair: string,
    pipLocation?: number
): number {
    let multiplier: number

    if (pipLocation !== undefined) {
        multiplier = Math.pow(10, -pipLocation)
    } else {
        const isJpy = pair.toUpperCase().includes('JPY')
        multiplier = isJpy ? 100 : 10000
    }

    const diff = exit - entry
    const pips = diff * multiplier

    return direction === 'long' ? pips : -pips
}

/**
 * Estimate P&L in USD based on pips and lot size.
 * Note: This is an approximation. Phase 4 will use OANDA live rates for exact values.
 */
export function estimatePnL(
    pips: number,
    lotSize: number,
    pair: string
): number {
    const pipValuePerStandardLot = 10
    const pnl = pips * lotSize * pipValuePerStandardLot

    return Number(pnl.toFixed(2))
}
