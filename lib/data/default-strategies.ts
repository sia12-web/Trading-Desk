import { ChecklistItem } from '@/lib/types/database'

export const SMC_REVERSAL_STRATEGY = {
    name: "Institutional Reversal (SMC)",
    description: "",
    checklist_items: [
        {
            id: "smc-1",
            category: "trend",
            label: "HTF Bias Alignment",
            logical_condition: "1H or 4H trend should ideally favor the reversal direction."
        },
        {
            id: "smc-2",
            category: "level",
            label: "Major Liquidity Pool",
            logical_condition: "Price must be interacting with a Daily High/Low, Weekly High/Low, or Session High/Low."
        },
        {
            id: "smc-3",
            category: "indicator",
            label: "RSI/Stochastic Divergence",
            logical_condition: "Look for a 'Lower Low' in price but a 'Higher Low' in momentum to spot exhaustion."
        },
        {
            id: "smc-4",
            category: "pattern",
            label: "SFP (Swing Failure Pattern)",
            logical_condition: "Price wicks beyond the level and closes back inside the previous candle's range."
        },
        {
            id: "smc-5",
            category: "confirmation",
            label: "Market Structure Shift (MSS)",
            logical_condition: "A 1m or 5m candle must break the most recent swing point in the new direction."
        },
        {
            id: "smc-6",
            category: "indicator",
            label: "Fair Value Gap (FVG)",
            logical_condition: "The reversal move should be energetic, leaving an imbalance behind."
        }
    ] as ChecklistItem[]
}
