'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Target, Zap, Lock, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface StrategyGateStatus {
  isUnlocked: boolean
  strategy: 'PIPO' | 'NONE'
  pair: string
  confirmationScore: number
  waveContext: string
  lastUpdated: string
}

const STRATEGY_ROUTES: Record<string, string> = {
  'PIPO': '/pipo',
}

const STRATEGY_ICONS: Record<string, React.ReactNode> = {
  'PIPO': <Target className="text-emerald-400" size={24} />,
}

export function StrategyGateWidget() {
  const [status, setStatus] = useState<StrategyGateStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGateStatus()
  }, [])

  const fetchGateStatus = async () => {
    try {
      const res = await fetch('/api/waves')
      const data = await res.json()

      if (data.success && data.analyses) {
        // Find latest unlocked analysis
        const unlocked = data.analyses.find((a: any) =>
          a.analysis_result?.gate_status === 'UNLOCKED' &&
          a.analysis_result?.unlocked_strategy &&
          a.analysis_result?.unlocked_strategy !== 'NONE'
        )

        if (unlocked) {
          setStatus({
            isUnlocked: true,
            strategy: unlocked.analysis_result.unlocked_strategy,
            pair: unlocked.pair,
            confirmationScore: unlocked.analysis_result.connectivity_analysis?.confirmation_score || 0,
            waveContext: unlocked.analysis_result.monthly_analysis?.major_wave || 'Analyzing...',
            lastUpdated: new Date(unlocked.created_at).toLocaleString()
          })
        } else {
          setStatus({
            isUnlocked: false,
            strategy: 'NONE',
            pair: '',
            confirmationScore: 0,
            waveContext: '',
            lastUpdated: ''
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch gate status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-800 rounded w-32 mb-4"></div>
          <div className="h-24 bg-neutral-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Shield size={14} />
          Strategy Gate
        </h3>
        <Link
          href="/analysis"
          className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
        >
          Configure
        </Link>
      </div>

      {status?.isUnlocked ? (
        <Link
          href={STRATEGY_ROUTES[status.strategy] || '/strategies'}
          className="block group"
        >
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 hover:border-emerald-500/50 transition-all">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 blur-[40px] -mr-12 -mt-12 group-hover:bg-emerald-500/30 transition-all" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                    Unlocked
                  </span>
                </div>
                <ChevronRight size={16} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  {STRATEGY_ICONS[status.strategy] || <Zap className="text-amber-400" size={24} />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">{status.strategy}</h4>
                  <p className="text-xs text-emerald-400/70">{status.pair}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Confirmation</span>
                  <span className="font-bold text-emerald-400">{status.confirmationScore}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Wave Context</span>
                  <span className="font-mono text-white text-[10px]">{status.waveContext}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-500/10">
                <p className="text-[9px] text-emerald-500/50 font-medium">
                  Click to launch strategy dashboard
                </p>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-800/50 flex items-center justify-center">
              <Lock className="text-neutral-600" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-400">Gate Locked</h4>
              <p className="text-xs text-neutral-600">No strategy unlocked</p>
            </div>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed mb-4">
            Upload multi-timeframe charts to Wave Analytics to unlock the PIPO execution strategy.
          </p>

          <Link
            href="/analysis"
            className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-all"
          >
            <TrendingUp size={14} />
            Analyze Waves
          </Link>
        </div>
      )}

      {status?.isUnlocked && (
        <div className="mt-4 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800">
          <p className="text-[9px] text-neutral-600 font-medium">
            Last updated: {status.lastUpdated}
          </p>
        </div>
      )}
    </div>
  )
}
