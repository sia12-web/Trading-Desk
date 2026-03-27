import { NextResponse } from 'next/server'
import { getCandles } from '@/lib/oanda/client'

const MAJOR_INDICES = [
    { instrument: 'SPX500_USD', name: 'S&P 500', region: 'US' },
    { instrument: 'US30_USD', name: 'Dow Jones', region: 'US' },
    { instrument: 'NAS100_USD', name: 'Nasdaq 100', region: 'US' },
    { instrument: 'DE30_EUR', name: 'DAX 40', region: 'Europe' },
    { instrument: 'EU50_EUR', name: 'Euro Stoxx 50', region: 'Europe' },
    { instrument: 'UK100_GBP', name: 'FTSE 100', region: 'UK' },
    { instrument: 'JP225_USD', name: 'Nikkei 225', region: 'Asia' },
    { instrument: 'AU200_AUD', name: 'ASX 200', region: 'Asia' },
]

interface IndexData {
    instrument: string
    name: string
    region: string
    currentLevel: number
    change1d: number
    change5d: number
    change20d: number
    trend: 'bullish' | 'bearish' | 'flat'
}

/**
 * GET /api/market-indices
 * Fetches current levels and changes for major global stock indices.
 * Public route (no auth required for dashboard widget).
 */
export async function GET() {
    try {
        const indices: IndexData[] = []

        // Fetch indices sequentially with delay to respect rate limits
        for (const index of MAJOR_INDICES) {
            try {
                const data = await fetchIndexData(index.instrument, index.name, index.region)
                if (data) indices.push(data)
                await sleep(150) // Rate limit protection
            } catch (error) {
                console.error(`Failed to fetch ${index.name}:`, error instanceof Error ? error.message : error)
                // Continue with other indices even if one fails
            }
        }

        if (indices.length === 0) {
            return NextResponse.json({ error: 'No index data available' }, { status: 503 })
        }

        // Calculate risk appetite (simple: % of indices up vs down)
        const up = indices.filter(idx => idx.change1d > 0).length
        const total = indices.length
        const upPct = (up / total) * 100

        const riskAppetite = upPct >= 60 ? 'risk-on' : upPct <= 40 ? 'risk-off' : 'mixed'

        return NextResponse.json({
            indices,
            riskAppetite,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Market indices API error:', error instanceof Error ? error.message : error)
        return NextResponse.json(
            { error: 'Failed to fetch market indices' },
            { status: 500 }
        )
    }
}

async function fetchIndexData(
    instrument: string,
    name: string,
    region: string
): Promise<IndexData | null> {
    const { data: candles, error } = await getCandles({ instrument, granularity: 'D', count: 50 })
    if (error || !candles || candles.length < 2) return null

    const closes = candles.map(c => parseFloat(c.mid.c))
    const latest = closes[closes.length - 1]
    const prev1d = closes[closes.length - 2]
    const prev5d = closes[closes.length - 6] ?? closes[0]
    const prev20d = closes[closes.length - 21] ?? closes[0]

    const change1d = ((latest - prev1d) / prev1d) * 100
    const change5d = ((latest - prev5d) / prev5d) * 100
    const change20d = ((latest - prev20d) / prev20d) * 100

    // Simple trend: compare 5-day MA vs 20-day MA
    const sma5 = average(closes.slice(-5))
    const sma20 = average(closes.slice(-20))
    const trend = sma5 > sma20 * 1.005 ? 'bullish' : sma5 < sma20 * 0.995 ? 'bearish' : 'flat'

    return {
        instrument,
        name,
        region,
        currentLevel: latest,
        change1d,
        change5d,
        change20d,
        trend,
    }
}

function average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
