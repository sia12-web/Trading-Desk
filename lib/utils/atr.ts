import { OandaCandle } from '@/lib/types/oanda'

export interface ATRResult {
    instrument: string
    displayPair: string
    atr14: number
    atr50: number
    ratio: number
    status: "hot" | "normal" | "cold" | "spike"
    statusLabel: string
    dailyRangePips: number
    avgDailyRangePips: number
    percentile: number
    lastPrice: number
    pipLocation: number
    spreadPips: number
    bookLiquidity: number
    liquidityScore: number       // 0-100, higher = more liquid
    tradabilityScore: number     // composite: volatility + liquidity
}

export function calculateATR(candles: OandaCandle[], period: number, pipLocation: number): number {
    if (candles.length <= period) return 0;

    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i++) {
        const high = parseFloat(candles[i].mid.h);
        const low = parseFloat(candles[i].mid.l);
        const prevClose = parseFloat(candles[i - 1].mid.c);

        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trueRanges.push(tr);
    }

    const recentTRs = trueRanges.slice(-period);
    const atr = recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;

    const pipMultiplier = Math.pow(10, Math.abs(pipLocation));
    return atr * pipMultiplier;
}

export function getATRStatus(ratio: number): { status: "hot" | "normal" | "cold" | "spike", label: string } {
    if (ratio >= 1.5) return { status: "spike", label: "Volatility Spike — High risk, high reward" };
    if (ratio >= 1.15) return { status: "hot", label: "Above Average — Good trading conditions" };
    if (ratio >= 0.85) return { status: "normal", label: "Normal — Average conditions" };
    return { status: "cold", label: "Below Average — Low movement, consider waiting" };
}

export function calculatePercentile(currentATR: number, allATRs: number[]): number {
    if (allATRs.length === 0) return 0;
    const sorted = [...allATRs].sort((a, b) => a - b);
    const rank = sorted.filter(v => v <= currentATR).length;
    return Math.round((rank / sorted.length) * 100);
}
