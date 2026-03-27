'use client'

import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

interface CumulativePnLChartProps {
    data: { date: string; pnl: number }[]
}

export function CumulativePnLChart({ data }: CumulativePnLChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-600 italic">
                No trades recorded yet for cumulative analysis.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis
                    dataKey="date"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        fontSize: '12px'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                />
                <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPnL)"
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
