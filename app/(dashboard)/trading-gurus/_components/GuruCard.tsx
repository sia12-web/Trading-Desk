'use client'

import React from 'react'
import { GraduationCap, ArrowRight, User as UserIcon, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface GuruCardProps {
    name: string
    topicCount: number
}

export function GuruCard({ name, topicCount }: GuruCardProps) {
    return (
        <Link 
            href={`/trading-gurus/${encodeURIComponent(name)}`}
            className="group block bg-neutral-900 border border-neutral-800 rounded-3xl p-6 hover:bg-neutral-800/80 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/5"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all text-blue-500">
                    <UserIcon size={24} />
                </div>
                <div className="px-3 py-1 bg-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-widest rounded-full border border-neutral-700/50">
                    {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{name}</h3>
                <div className="flex items-center gap-2 text-neutral-500">
                    <BookOpen size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">Trading Guru Library</span>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-neutral-800/50">
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Entry to Vault</span>
                <ArrowRight size={14} className="text-neutral-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    )
}
