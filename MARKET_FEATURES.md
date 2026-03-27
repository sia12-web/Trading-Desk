# Market Intelligence Features - Organization

## 📊 Current Market Features

### 1. **Market Sentiment** (`components/dashboard/MarketSentimentWidget.tsx`)
**Purpose:** Macro risk sentiment analysis
**Data Sources:**
- VIX (Volatility Index)
- 10Y Treasury Yield
- DXY (Dollar Index)
- SPX (S&P 500)

**Displays:**
- Overall sentiment: Risk On / Risk Off / Neutral
- Confidence level
- 4 key indicators with changes
- Summary narrative

**Location:**
- Main Dashboard (right side, market intelligence grid)
- **NEW:** Trade Page sidebar (Market Context section)

**API:** `/api/sentiment`
**Utility:** `lib/utils/sentiment.ts`

---

### 2. **Market Sessions** (`components/dashboard/MarketSessionsWidget.tsx`)
**Purpose:** Trading session activity tracker
**Sessions:**
- Tokyo (Asian session)
- London (European session)
- New York (American session)

**Displays:**
- Active sessions with progress bars
- Session overlaps (peak liquidity times)
- Time until open/close
- Market phase (high/moderate/low liquidity)

**Location:**
- Main Dashboard (left side, market intelligence grid)
- **NEW:** Trade Page sidebar (Market Context section)

**Utility:** `lib/utils/market-sessions.ts`
**Related:** `lib/utils/session-relationships.ts` (trading tips for each session)

---

### 3. **Market Cycles** (`components/dashboard/MarketCyclesWidget.tsx`)
**Purpose:** Macro economic cycle awareness
**Cycles:**
- 10-Year Economic Cycle (expansion, peak, recession, recovery)
- 4-Year Presidential Cycle
- Monthly Seasonality (best/worst months historically)

**Displays:**
- Current phase in each cycle
- Phase descriptions
- Historical biases
- Context warnings

**Location:**
- Main Dashboard (right side, market intelligence grid)

**Utility:** `lib/utils/market-cycles.ts`

---

### 4. **Volatility Widget** (`components/dashboard/VolatilityWidget.tsx`)
**Purpose:** Real-time volatility monitoring

**Location:**
- Main Dashboard (left side, market intelligence grid)

---

### 5. **Pair Knowledge** (`lib/utils/pair-knowledge.ts`)
**Purpose:** Currency pair characteristics and correlations
**Data:**
- Major driver (GDP, commodities, etc.)
- Typical ranges
- Best trading times
- Correlation relationships

**Used in:**
- `components/pair-info-card.tsx` (Trade Page)

---

## 🎯 Where Market Context Appears

### Main Dashboard (`app/(dashboard)/page.tsx`)
```
┌─────────────────────────────────┐
│  Market Intelligence Grid       │
│  ┌──────────────┬─────────────┐ │
│  │  Sessions    │  Sentiment  │ │
│  ├──────────────┼─────────────┤ │
│  │  Volatility  │  Cycles     │ │
│  └──────────────┴─────────────┘ │
└─────────────────────────────────┘
```

### Trade Page (`app/(dashboard)/trade/_components/TradeOrderForm.tsx`)
**NEW: Market Context Section** (Sidebar)
```
┌─────────────────────────────┐
│  Market Context             │
│  • Macro Sentiment          │
│  • Active Sessions          │
│  • Session Overlaps         │
│  • Liquidity Phase          │
└─────────────────────────────┘
```

---

## 📝 What's Missing (Potential Additions)

### 1. **Economic Calendar / News**
**Status:** Not implemented
**Would include:**
- Upcoming high-impact news events
- Central bank meetings
- NFP, CPI, interest rate decisions
- Real-time news feed integration

**Potential Sources:**
- Forex Factory API
- Trading Economics API
- Custom RSS feed aggregator

**Suggested Location:**
- New widget on main dashboard
- Optional banner on trade page for imminent high-impact events

---

### 2. **Correlation Matrix**
**Status:** Data exists in `pair-knowledge.ts`, no widget
**Would show:**
- Real-time correlation between pairs
- Heatmap visualization
- Diversification score

---

### 3. **Central Bank Policy Tracker**
**Status:** Not implemented
**Would track:**
- Current interest rates by currency
- Rate change trajectory
- Policy stance (hawkish/dovish)

---

## 🗂️ File Organization

```
components/dashboard/
├── MarketSentimentWidget.tsx     ✅ Macro sentiment
├── MarketSessionsWidget.tsx      ✅ Trading sessions
├── MarketCyclesWidget.tsx        ✅ Economic cycles
├── VolatilityWidget.tsx          ✅ Volatility
└── StrategyGateWidget.tsx        ✅ Wave analysis status

lib/utils/
├── sentiment.ts                  ✅ Sentiment calculation logic
├── market-sessions.ts            ✅ Session timing logic
├── session-relationships.ts      ✅ Session trading tips
├── market-cycles.ts              ✅ Cycle phase logic
└── pair-knowledge.ts             ✅ Pair characteristics

API Routes:
└── app/api/sentiment/route.ts    ✅ Sentiment data endpoint
```

---

## 🎨 Design Patterns

All market widgets follow consistent design:
- **Header:** Icon + Title (10px, bold, uppercase, tracking-widest)
- **Main Content:** Key metric with visual indicator
- **Supporting Data:** Grid of sub-metrics
- **Timestamp:** "X ago" format
- **Colors:**
  - Risk On: Emerald (#10b981)
  - Risk Off: Rose (#f43f5e)
  - Neutral: Neutral (#737373)
  - Active: Blue (#3b82f6)

---

## 🔄 Data Refresh Rates

- **Sentiment:** 5 minutes
- **Sessions:** 1 minute
- **Cycles:** Static (calculated on mount)
- **Volatility:** Real-time (component-specific)

---

## ✅ Recent Changes

1. **Removed:** Seasonal pattern warning banner from trade page (redundant)
2. **Added:** Comprehensive market context section to trade page sidebar
3. **Integrated:** Sentiment + Sessions data into trade execution flow
4. **Organized:** All market intelligence in dedicated widgets

---

## 🚀 Recommended Next Steps

If you want to add economic news:

1. Create `components/dashboard/EconomicCalendarWidget.tsx`
2. Create API route `/api/economic-calendar`
3. Integrate with external news API (Forex Factory, Trading Economics)
4. Add to main dashboard grid
5. Optional: Show high-impact alerts on trade page

Would you like me to implement economic calendar integration?
