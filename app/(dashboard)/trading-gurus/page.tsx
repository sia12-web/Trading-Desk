'use client'

import React, { useState, useEffect } from 'react'
import { GraduationCap, Plus, Loader2, ArrowLeft, User as UserIcon, X, Search, Zap } from 'lucide-react'
import { GuruCard } from './_components/GuruCard'
import { useRouter } from 'next/navigation'

interface Guru {
    name: string
    topics: string[]
}

export default function TradingGurusPage() {
    const [gurus, setGurus] = useState<Guru[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newGuruName, setNewGuruName] = useState('')
    const [newTopic, setNewTopic] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchGurus = async () => {
            try {
                const res = await fetch('/api/trading-gurus/list')
                const data = await res.json()
                setGurus(data.gurus || [])
            } catch (err) {
                console.error('Failed to fetch gurus:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchGurus()
    }, [])

    const handleAddGuru = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGuruName || !newTopic) return

        // To initialize a guru, we just need to save one note (even if empty)
        try {
            await fetch('/api/trading-gurus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guru: newGuruName, topic: newTopic, content: '' }),
            })
            router.push(`/trading-gurus/${encodeURIComponent(newGuruName)}?topic=${encodeURIComponent(newTopic)}`)
        } catch (err) {
            console.error('Failed to add guru:', err)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-800/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
                            <GraduationCap size={20} className="text-blue-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Trading Gurus</h1>
                    </div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest pl-[52px]">Your private library of trading mentors & wisdom</p>
                </div>

                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={16} />
                    Onboard Mentor
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 size={32} className="animate-spin text-blue-500 mb-4 opacity-50" />
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Accessing the Great Library...</p>
                </div>
            ) : gurus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-neutral-800 rounded-[3rem] bg-neutral-950/20">
                    <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-8">
                        <GraduationCap size={40} className="text-neutral-700" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-400 uppercase tracking-tight mb-2">The Vault is Empty</h2>
                    <p className="text-xs text-neutral-600 uppercase tracking-widest font-black mb-8">Start capturing wisdom from your trading mentors</p>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-neutral-700"
                    >
                        Begin Your Library
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gurus.map(guru => (
                        <GuruCard key={guru.name} name={guru.name} topicCount={guru.topics.length} />
                    ))}
                </div>
            )}

            {/* Support Info */}
            <div className="pt-20">
                <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-3xl p-8 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                        <Zap size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-neutral-200 uppercase tracking-tight">AI Exclusion Policy</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl mt-1 font-medium">
                            The "Trading Gurus" section is a hard-walled private workspace. Content in this directory is never fed to AI models, stored in training logs, or scanned by the system. This is strictly your personal intellectual property.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Guru Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Onboard New Mentor</h3>
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Start a new private knowledge base</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddGuru} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Mentor Name (The Guru)</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                    <input 
                                        type="text" 
                                        value={newGuruName}
                                        onChange={(e) => setNewGuruName(e.target.value)}
                                        placeholder="e.g. Mark Douglas"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-neutral-700"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-1">Primary Topic / Lesson</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                    <input 
                                        type="text" 
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        placeholder="e.g. Psychology of Trading"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-neutral-700"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={!newGuruName || !newTopic}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/10"
                            >
                                Open Vault for {newGuruName || '...'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
