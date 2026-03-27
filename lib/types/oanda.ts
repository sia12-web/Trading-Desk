export interface OandaAccountSummary {
    id: string
    balance: string
    unrealizedPL: string
    pl: string
    marginUsed: string
    marginAvailable: string
    openTradeCount: number
    currency: string
    lastTransactionID: string
}

export interface OandaTrade {
    id: string
    instrument: string
    price: string
    openTime: string
    initialUnits: string
    currentUnits: string
    realizedPL: string
    unrealizedPL: string
    marginUsed: string
    state: 'OPEN' | 'CLOSED' | 'CLOSE_WHEN_TRADEABLE'
    averageClosePrice?: string
    closeTime?: string
    financing?: string
    closingTransactionIDs?: string[]
    stopLossOrder?: {
        id: string
        price: string
        state: string
    }
    takeProfitOrder?: {
        id: string
        price: string
        state: string
    }
}

export interface OandaPrice {
    instrument: string
    asks: { price: string; liquidity: number }[]
    bids: { price: string; liquidity: number }[]
    tradeable: boolean
    time: string
    status: string
}

export interface OandaInstrument {
    name: string
    displayName: string
    type: string
    pipLocation: number
    displayPrecision: number
    tradeUnitsPrecision: number
    minimumTradeSize: string
    maximumTrailingStopDistance: string
    minimumTrailingStopDistance: string
    maximumPositionSize: string
    maximumOrderUnits: string
    marginRate: string
    financing?: {
        longRate: string
        shortRate: string
        financingDaysOfWeek: Array<{
            day: string
            daysCharged: number
        }>
    }
}

export interface OandaTransaction {
    id: string
    type: string
    instrument?: string
    units?: string
    price?: string
    reason?: string
    time: string
    accountBalance?: string
    pl?: string
    financing?: string
    commission?: string
}

export interface OandaOrderResponse {
    orderCreateTransaction: {
        id: string
        type: string
        instrument: string
        units: string
        price?: string
        reason: string
        time: string
    }
    orderFillTransaction?: {
        id: string
        tradeOpened?: { tradeID: string, units: string }
        pl: string
        price: string
        time: string
    }
    orderCancelTransaction?: {
        id: string
        type: string
        orderID: string
        reason: string
    }
    relatedTransactionIDs: string[]
}

export interface OandaModifyResponse {
    tradeOrderCreateTransaction?: OandaTransaction
    tradeOrderCancelTransaction?: OandaTransaction
    relatedTransactionIDs: string[]
}

export interface OandaCloseResponse {
    orderCreateTransaction: { id: string, type: string }
    orderFillTransaction: OandaTransaction & {
        tradesClosed: Array<{ tradeID: string, units: string, realizedPL: string }>
    }
    relatedTransactionIDs: string[]
}

export interface OandaCancelResponse {
    orderCancelTransaction: {
        id: string
        type: string
        orderID: string
        time: string
    }
    relatedTransactionIDs: string[]
}

export interface OandaError {
    errorCode: string
    errorMessage: string
}

export interface OandaCandle {
    time: string
    mid: {
        o: string
        h: string
        l: string
        c: string
    }
    volume: number
    complete: boolean
}
