'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface PnLByPairChartProps {
    data: { pair: string; pnl: number }[]
}

export function PnLByPairChart({ data }: PnLByPairChartProps) {
    if (data.length === 0) return null

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#262626" />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="pair"
                    type="category"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '12px',
                        fontSize: '12px'
                    }}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
