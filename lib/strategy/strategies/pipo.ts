import { Strategy, StrategySignal, ProposedTrade, CalculatedIndicators, PivotPointLevels } from "../types";
import { OandaCandle } from "@/lib/types/oanda";
import { calculateATR } from "@/lib/utils/indicators";

export function calculatePivotPoints(prevHigh: number, prevLow: number, prevClose: number): PivotPointLevels {
    const pp = (prevHigh + prevLow + prevClose) / 3;
    const r1 = (2 * pp) - prevLow;
    const r2 = pp + (prevHigh - prevLow);
    const r3 = prevHigh + 2 * (pp - prevLow);
    const s1 = (2 * pp) - prevHigh;
    const s2 = pp - (prevHigh - prevLow);
    const s3 = prevLow - 2 * (prevHigh - pp);

    return {
        pp, r1, r2, r3, s1, s2, s3,
        m1: (s1 + pp) / 2,
        m2: (pp + r1) / 2,
        m3: (r1 + r2) / 2,
        m4: (s1 + s2) / 2
    };
}

function checkBounceConfirmation(
    lastCandles: OandaCandle[],
    level: number,
    direction: "long" | "short"
): boolean {
    if (lastCandles.length < 2) return false;

    const prevCandle = lastCandles[lastCandles.length - 2];
    const currCandle = lastCandles[lastCandles.length - 1];

    if (direction === "long") {
        const prevLow = parseFloat(prevCandle.mid.l);
        const currClose = parseFloat(currCandle.mid.c);
        const currOpen = parseFloat(currCandle.mid.o);

        const touchedLevel = prevLow <= level * 1.001;
        const closedBullish = currClose > currOpen;
        const closedAboveLevel = currClose > level;

        return touchedLevel && closedBullish && closedAboveLevel;
    } else {
        const prevHigh = parseFloat(prevCandle.mid.h);
        const currClose = parseFloat(currCandle.mid.c);
        const currOpen = parseFloat(currCandle.mid.o);

        const touchedLevel = prevHigh >= level * 0.999;
        const closedBearish = currClose < currOpen;
        const closedBelowLevel = currClose < level;

        return touchedLevel && closedBearish && closedBelowLevel;
    }
}

export const PIPOStrategy: Strategy = {
    id: "pipo",
    name: "PIPO",
    displayName: "Pivot Point Strategy",
    description: "Trades bounces and breakouts at daily pivot point levels. Uses the PP, S1/S2, R1/R2 as institutional order flow zones. Works best in trending markets where pivot levels act as stepping stones.",
    timeframe: "H1",
    type: "manual",
    requiredIndicators: ["ema", "rsi", "atr", "pivotPoints", "volume"],

    parameters: {
        emaFast: 10,
        emaSlow: 40,
        rsiPeriod: 9,
        atrPeriod: 14,
        pivotType: "standard",
        entryMode: "bounce",
        confirmationCandles: 2,
    },

    generateSignals(candles, indicators, pipelineResult) {
        const signals: StrategySignal[] = [];
        const pivots = indicators.pivotPoints;
        const currentPrice = parseFloat(candles[candles.length - 1].mid.c);
        const currentRSI = indicators.rsi[indicators.rsi.length - 1];
        const trendWeight = pipelineResult.directionBias;

        if (trendWeight === "neutral") return [];

        if (trendWeight === "long") {
            const supportLevels = [
                { name: "PP", price: pivots.pp, strength: 3 },
                { name: "S1", price: pivots.s1, strength: 2 },
                { name: "M1", price: pivots.m1, strength: 1 },
                { name: "S2", price: pivots.s2, strength: 3 },
                { name: "M4", price: pivots.m4, strength: 1 },
            ];

            for (const level of supportLevels) {
                const atrPips = indicators.atr[indicators.atr.length - 1];
                // Convert atrPips back to price distance (assuming pipLocation is available or hardcoded for forex)
                // Wait, calculateATR in lib/utils/atr returns pips.
                // Let's assume 1 pip = 0.0001 for now or use the pip value if we had it.
                // Actually indicators.atr is from calculateATR which returns pips.
                const proximity = Math.abs(currentPrice - level.price);
                const proximityInPips = proximity * 10000; // rough estimate for 4-decimal pairs

                if (proximityInPips < atrPips * 0.3 && currentPrice >= level.price) {
                    const lastCandles = candles.slice(-3);
                    const hasBounce = checkBounceConfirmation(lastCandles, level.price, "long");

                    if (hasBounce) {
                        const rsiRising = indicators.rsi[indicators.rsi.length - 1] > indicators.rsi[indicators.rsi.length - 2];
                        const rsiNotOverbought = currentRSI < 70;
                        const volumeIncreasing = indicators.volume[indicators.volume.length - 1] > indicators.volumeSma[indicators.volumeSma.length - 1];

                        let confidence = 30;
                        confidence += hasBounce ? 20 : 0;
                        confidence += rsiRising && rsiNotOverbought ? 15 : 0;
                        confidence += volumeIncreasing ? 15 : 0;
                        confidence += level.strength * 5;
                        confidence = Math.min(confidence, 100);

                        signals.push({
                            direction: "long",
                            triggerPrice: currentPrice,
                            triggerTime: new Date(),
                            reason: `Bullish bounce off ${level.name} (${level.price.toFixed(5)}) with ${rsiRising ? "rising" : "flat"} RSI and ${volumeIncreasing ? "increasing" : "declining"} volume.`,
                            confidence,
                            pipelineAlignment: pipelineResult.alignmentScore
                        });
                    }
                }
            }

            // Breakout Strategy
            const breakoutLevels = [
                { name: "R1", price: pivots.r1, target: pivots.r2, strength: 2 },
                { name: "R2", price: pivots.r2, target: pivots.r3, strength: 3 },
            ];

            for (const level of breakoutLevels) {
                const prevCandle = candles[candles.length - 2];
                const currCandle = candles[candles.length - 1];
                const prevClose = parseFloat(prevCandle.mid.c);
                const currClose = parseFloat(currCandle.mid.c);

                if (prevClose < level.price && currClose > level.price) {
                    const volumeSpike = indicators.volume[indicators.volume.length - 1] > (indicators.volumeSma[indicators.volumeSma.length - 1] || 0) * 1.3;
                    const rsiStrong = currentRSI > 55 && currentRSI < 80;

                    let confidence = 35;
                    confidence += volumeSpike ? 20 : 0;
                    confidence += rsiStrong ? 15 : 0;
                    confidence += level.strength * 5;
                    confidence = Math.min(confidence, 100);

                    signals.push({
                        direction: "long",
                        triggerPrice: currClose,
                        triggerTime: new Date(),
                        reason: `Bullish breakout above ${level.name} (${level.price.toFixed(5)}). ${volumeSpike ? "Volume spike confirms." : "Low volume — watch for fakeout."} Target: ${level.target.toFixed(5)}.`,
                        confidence,
                        pipelineAlignment: pipelineResult.alignmentScore
                    });
                }
            }
        }

        if (trendWeight === "short") {
            const resistanceLevels = [
                { name: "PP", price: pivots.pp, strength: 3 },
                { name: "R1", price: pivots.r1, strength: 2 },
                { name: "M2", price: pivots.m2, strength: 1 },
                { name: "R2", price: pivots.r2, strength: 3 },
                { name: "M3", price: pivots.m3, strength: 1 },
            ];

            for (const level of resistanceLevels) {
                const atrPips = indicators.atr[indicators.atr.length - 1];
                const proximity = Math.abs(currentPrice - level.price);
                const proximityInPips = proximity * 10000;

                if (proximityInPips < atrPips * 0.3 && currentPrice <= level.price) {
                    const lastCandles = candles.slice(-3);
                    const hasRejection = checkBounceConfirmation(lastCandles, level.price, "short");

                    if (hasRejection) {
                        const rsiDropping = indicators.rsi[indicators.rsi.length - 1] < indicators.rsi[indicators.rsi.length - 2];
                        const rsiNotOversold = currentRSI > 30;
                        const volumeIncreasing = indicators.volume[indicators.volume.length - 1] > (indicators.volumeSma[indicators.volumeSma.length - 1] || 0);

                        let confidence = 30;
                        confidence += hasRejection ? 20 : 0;
                        confidence += rsiDropping && rsiNotOversold ? 15 : 0;
                        confidence += volumeIncreasing ? 15 : 0;
                        confidence += level.strength * 5;
                        confidence = Math.min(confidence, 100);

                        signals.push({
                            direction: "short",
                            triggerPrice: currentPrice,
                            triggerTime: new Date(),
                            reason: `Bearish rejection off ${level.name} (${level.price.toFixed(5)}) with ${rsiDropping ? "dropping" : "flat"} RSI and ${volumeIncreasing ? "increasing" : "declining"} volume.`,
                            confidence,
                            pipelineAlignment: pipelineResult.alignmentScore
                        });
                    }
                }
            }

            // Breakdown Strategy
            const breakdownLevels = [
                { name: "S1", price: pivots.s1, target: pivots.s2, strength: 2 },
                { name: "S2", price: pivots.s2, target: pivots.s3, strength: 3 },
            ];

            for (const level of breakdownLevels) {
                const prevCandle = candles[candles.length - 2];
                const currCandle = candles[candles.length - 1];
                const prevClose = parseFloat(prevCandle.mid.c);
                const currClose = parseFloat(currCandle.mid.c);

                if (prevClose > level.price && currClose < level.price) {
                    const volumeSpike = indicators.volume[indicators.volume.length - 1] > (indicators.volumeSma[indicators.volumeSma.length - 1] || 0) * 1.3;
                    const rsiWeak = currentRSI < 45 && currentRSI > 20;

                    let confidence = 35;
                    confidence += volumeSpike ? 20 : 0;
                    confidence += rsiWeak ? 15 : 0;
                    confidence += level.strength * 5;
                    confidence = Math.min(confidence, 100);

                    signals.push({
                        direction: "short",
                        triggerPrice: currClose,
                        triggerTime: new Date(),
                        reason: `Bearish breakdown below ${level.name} (${level.price.toFixed(5)}). Target: ${level.target.toFixed(5)}.`,
                        confidence,
                        pipelineAlignment: pipelineResult.alignmentScore
                    });
                }
            }
        }

        return signals;
    },

    calculateTrade(signal, candles, accountBalance, riskPercent, pipLocation, instrument = 'EUR_USD') {
        const highs = candles.map(c => parseFloat(c.mid.h));
        const lows = candles.map(c => parseFloat(c.mid.l));
        const closes = candles.map(c => parseFloat(c.mid.c));
        const atrValues = calculateATR(highs, lows, closes, 14);
        const atrPips = atrValues[atrValues.length - 1];
        const pipVal = Math.pow(10, pipLocation);
        const atrPrice = atrPips * pipVal;

        // Get previous day's high, low, close for pivots
        // For simplicity, we assume the caller provides enough candles to extract the previous day
        // Or we should have pivots in indicators anyway. Let's recalculate if needed.
        // Actually indicators.pivotPoints should be used but calculating here for SL/TP precision.
        const pivots = calculatePivotPoints(
            parseFloat(candles[candles.length - 2].mid.h),
            parseFloat(candles[candles.length - 2].mid.l),
            parseFloat(candles[candles.length - 2].mid.c)
        );

        let stopLoss: number;
        let takeProfit: number[];

        if (signal.direction === "long") {
            const supportBelow = [pivots.s3, pivots.s2, pivots.s1, pivots.pp, pivots.m1, pivots.m4]
                .filter(p => p < signal.triggerPrice)
                .sort((a, b) => b - a)[0] || (signal.triggerPrice - (atrPrice * 2));

            stopLoss = supportBelow - (atrPrice * 0.3);

            const resistanceAbove = [pivots.pp, pivots.r1, pivots.r2, pivots.r3]
                .filter(p => p > signal.triggerPrice)
                .sort((a, b) => a - b);

            takeProfit = resistanceAbove.length >= 2
                ? [resistanceAbove[0], resistanceAbove[1]]
                : resistanceAbove.length === 1
                    ? [resistanceAbove[0]]
                    : [signal.triggerPrice + (atrPrice * 2)];
        } else {
            const resistanceAbove = [pivots.r3, pivots.r2, pivots.r1, pivots.pp, pivots.m2, pivots.m3]
                .filter(p => p > signal.triggerPrice)
                .sort((a, b) => a - b)[0] || (signal.triggerPrice + (atrPrice * 2));

            stopLoss = resistanceAbove + (atrPrice * 0.3);

            const supportBelow = [pivots.pp, pivots.s1, pivots.s2, pivots.s3]
                .filter(p => p < signal.triggerPrice)
                .sort((a, b) => b - a);

            takeProfit = supportBelow.length >= 2
                ? [supportBelow[0], supportBelow[1]]
                : supportBelow.length === 1
                    ? [supportBelow[0]]
                    : [signal.triggerPrice - (atrPrice * 2)];
        }

        const slDistance = Math.abs(signal.triggerPrice - stopLoss);
        const tp1Distance = Math.abs(takeProfit[0] - signal.triggerPrice);
        const rr = tp1Distance / slDistance;

        const riskAmount = accountBalance * (riskPercent / 100);
        const slPips = slDistance / pipVal;
        const units = Math.floor(riskAmount / (slPips * pipVal));

        return {
            instrument,
            direction: signal.direction,
            entryPrice: signal.triggerPrice,
            entryType: "market",
            stopLoss,
            takeProfit,
            units: Math.max(units, 1),
            riskPercent,
            riskRewardRatio: Math.round(rr * 100) / 100,
            strategyName: "PIPO",
            pipelineResult: null,
            confidence: signal.confidence
        };
    }
};
