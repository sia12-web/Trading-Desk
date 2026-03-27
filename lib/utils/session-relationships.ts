export interface SessionRelationship {
    title: string
    description: string
}

export const SESSION_RELATIONSHIPS: SessionRelationship[] = [
    {
        title: "Tokyo sets the range, London breaks it",
        description: "Price often consolidates during Tokyo, forming a range. London session frequently breaks this range with a strong directional move. Look for Tokyo's high and low as breakout levels when London opens."
    },
    {
        title: "London-NY overlap is where the money moves",
        description: "12:00-16:00 UTC sees the highest volume in forex. Institutional traders from both regions are active. This is when major trends establish or reverse. Your best setups should be in this window."
    },
    {
        title: "New York continuation or reversal",
        description: "NY session often continues the trend established by London. But watch for reversals around 14:00-15:00 UTC when London traders start closing positions. A London trend that reverses at NY afternoon is a common pattern."
    },
    {
        title: "End-of-session profit taking",
        description: "In the last 30-60 minutes of each session, institutional traders take profits. This can cause sudden counter-trend moves. Avoid entering new positions in the last 30 minutes of a session."
    },
    {
        title: "Sunday gap and Monday Asian session",
        description: "The forex market reopens during Tokyo session on Sunday/Monday. Gaps from weekend news can occur. Monday Asian session is often low-conviction — many traders wait for London to set the week's direction."
    },
    {
        title: "Session currency dominance",
        description: "Each session is dominated by its local currencies. Tokyo: JPY and AUD pairs. London: EUR, GBP, CHF pairs. New York: USD and CAD pairs. Trading a pair in its home session gives you the best liquidity and tightest spreads."
    },
    {
        title: "News releases shift session dynamics",
        description: "Major economic releases (NFP, ECB rate decision, BoJ) can override normal session behavior. A US NFP release at 13:30 UTC during London-NY overlap creates maximum volatility. Always check the economic calendar."
    }
]
