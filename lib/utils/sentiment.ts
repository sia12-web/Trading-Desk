export interface SentimentIndicator {
    name: string
    value: number
    previousClose: number
    change: number
    changePercent: number
    signal: "risk_on" | "risk_off" | "neutral"
    explanation: string
    lastUpdated: Date
}

export interface CurrencyImplication {
    currency: string
    expected: "strengthen" | "weaken" | "neutral"
    reasoning: string
}

export interface MarketSentiment {
    overall: "risk_on" | "risk_off" | "mixed" | "neutral" | "unknown"
    confidence: "strong" | "moderate" | "weak"
    indicators: SentimentIndicator[]
    summary: string
    implications: CurrencyImplication[]
    lastUpdated: Date
}

export const SENTIMENT_CURRENCY_MAP = {
    risk_on: [
        { currency: "AUD", expected: "strengthen", reasoning: "Risk-on favors commodity currencies" },
        { currency: "NZD", expected: "strengthen", reasoning: "Risk-on favors commodity currencies" },
        { currency: "CAD", expected: "strengthen", reasoning: "Risk-on supports oil and commodity demand" },
        { currency: "GBP", expected: "strengthen", reasoning: "GBP is moderately risk-sensitive" },
        { currency: "JPY", expected: "weaken", reasoning: "Safe haven outflows — money leaves JPY for higher-yield" },
        { currency: "CHF", expected: "weaken", reasoning: "Safe haven outflows" },
        { currency: "USD", expected: "weaken", reasoning: "USD weakens as safe haven demand drops" },
        { currency: "EUR", expected: "neutral", reasoning: "EUR responds more to ECB policy than sentiment" }
    ],
    risk_off: [
        { currency: "JPY", expected: "strengthen", reasoning: "Safe haven inflows — money parks in JPY" },
        { currency: "CHF", expected: "strengthen", reasoning: "Safe haven inflows" },
        { currency: "USD", expected: "strengthen", reasoning: "Flight to safety — USD is the global reserve" },
        { currency: "AUD", expected: "weaken", reasoning: "Risk-off hits commodity currencies hardest" },
        { currency: "NZD", expected: "weaken", reasoning: "Risk-off hits commodity currencies hardest" },
        { currency: "CAD", expected: "weaken", reasoning: "Oil demand falls in risk-off" },
        { currency: "GBP", expected: "weaken", reasoning: "GBP sells off in risk-off environments" },
        { currency: "EUR", expected: "neutral", reasoning: "EUR is mixed — weakens in severe risk-off but stable otherwise" }
    ]
} as const;

export function calculateOverallSentiment(indicators: SentimentIndicator[]): { overall: MarketSentiment["overall"], confidence: MarketSentiment["confidence"] } {
    if (indicators.length === 0) {
        return { overall: "unknown", confidence: "weak" };
    }

    const signals = indicators.map(i => i.signal);
    const riskOnCount = signals.filter(s => s === "risk_on").length;
    const riskOffCount = signals.filter(s => s === "risk_off").length;

    if (riskOnCount >= 3) return { overall: "risk_on", confidence: "strong" };
    if (riskOffCount >= 3) return { overall: "risk_off", confidence: "strong" };
    if (riskOnCount === 2 && riskOffCount === 0) return { overall: "risk_on", confidence: "moderate" };
    if (riskOffCount === 2 && riskOnCount === 0) return { overall: "risk_off", confidence: "moderate" };
    if (riskOnCount === 2 && riskOffCount === 1) return { overall: "risk_on", confidence: "weak" };
    if (riskOffCount === 2 && riskOnCount === 1) return { overall: "risk_off", confidence: "weak" };
    if (riskOnCount === 1 && riskOffCount === 1) return { overall: "mixed", confidence: "weak" };

    return { overall: "neutral", confidence: "moderate" };
}

export function getCurrencyImplications(overall: MarketSentiment["overall"]): CurrencyImplication[] {
    if (overall === "risk_on" || overall === "risk_off") {
        // Return a mutable copy of the implications to match the interface
        return [...SENTIMENT_CURRENCY_MAP[overall]] as CurrencyImplication[];
    }
    return [];
}

export function getPairSentimentAlignment(
    pair: string,
    direction: "long" | "short",
    sentiment: MarketSentiment
): {
    aligned: boolean
    explanation: string
    baseCurrencyImpact: CurrencyImplication | null
    quoteCurrencyImpact: CurrencyImplication | null
} {
    const [base, quote] = pair.split("/");
    if (!base || !quote || sentiment.overall === "unknown") {
        return { aligned: true, explanation: "No sentiment data.", baseCurrencyImpact: null, quoteCurrencyImpact: null };
    }

    const baseImpact = sentiment.implications.find(i => i.currency === base) || null;
    const quoteImpact = sentiment.implications.find(i => i.currency === quote) || null;

    let aligned = true;
    let explanation = "";

    if (!baseImpact && !quoteImpact) {
        return { aligned: true, explanation: "No strong sentiment impact for this pair.", baseCurrencyImpact: null, quoteCurrencyImpact: null };
    }

    const baseExpected = baseImpact?.expected || "neutral";
    const quoteExpected = quoteImpact?.expected || "neutral";

    let pairExpectedTrend = "neutral";
    if ((baseExpected === "strengthen" && quoteExpected !== "strengthen") || (baseExpected !== "weaken" && quoteExpected === "weaken")) {
        pairExpectedTrend = "rise";
    } else if ((baseExpected === "weaken" && quoteExpected !== "weaken") || (baseExpected !== "strengthen" && quoteExpected === "strengthen")) {
        pairExpectedTrend = "fall";
    }

    if (pairExpectedTrend === "rise") {
        aligned = direction === "long";
        explanation = `${base} ${baseExpected}, ${quote} ${quoteExpected} → pair likely to rise`;
    } else if (pairExpectedTrend === "fall") {
        aligned = direction === "short";
        explanation = `${base} ${baseExpected}, ${quote} ${quoteExpected} → pair likely to fall`;
    } else {
        aligned = true;
        explanation = `${base} ${baseExpected}, ${quote} ${quoteExpected} → mixed impact`;
    }

    return { aligned, explanation, baseCurrencyImpact: baseImpact, quoteCurrencyImpact: quoteImpact };
}
