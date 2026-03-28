'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { 
    GraduationCap, Plus, Loader2, ArrowLeft, User as UserIcon, 
    ChevronRight, BookOpen, Clock, Zap, Search, Layers, X
} from 'lucide-react'
import { TradingGurusEditor } from '../_components/TradingGurusEditor'
import Link from 'next/link'

interface Note {
    topic: string
    updated_at: string
}

export default function GuruDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    
    const guru = decodeURIComponent(params.guru as string)
    const initialTopic = searchParams.get('topic')
    
    const [topics, setTopics] = useState<string[]>([])
    const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic)
    const [loading, setLoading] = useState(true)
    const [showAddTopic, setShowAddTopic] = useState(false)
    const [newTopic, setNewTopic] = useState('')

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await fetch('/api/trading-gurus/list')
                const data = await res.json()
                const guruData = data.gurus.find((g: any) => g.name === guru)
                if (guruData) {
                    setTopics(guruData.topics || [])
                    if (!selectedTopic && guruData.topics.length > 0) {
                        setSelectedTopic(guruData.topics[0])
                    }
                }
            } catch (err) {
                console.error('Failed to fetch topics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchTopics()
    }, [guru, selectedTopic])

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTopic) return

        try {
            await fetch('/api/trading-gurus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guru, topic: newTopic, content: '' }),
            })
            setTopics(prev => [...prev, newTopic])
            setSelectedTopic(newTopic)
            setShowAddTopic(false)
            setNewTopic('')
        } catch (err) {
            console.error('Failed to add topic:', err)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-4 opacity-50" />
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">Syncing Guru Archive...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
            {/* Context Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/trading-gurus" 
                        className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <UserIcon size={14} className="text-blue-500" />
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">{guru}</h1>
                        </div>
                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest pl-5 italic">Institutional Wisdom Library</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                        <Layers size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">{topics.length} Private Volumes</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Sidebar Navigation for Topics */}
                <div className="w-72 shrink-0 flex flex-col gap-4">
                    <button 
                        onClick={() => setShowAddTopic(true)}
                        className="w-full h-12 flex items-center justify-center gap-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/10"
                    >
                        <Plus size={14} />
                        New Volume
                    </button>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setSelectedTopic(topic)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group h-14 ${
                                    selectedTopic === topic 
                                        ? 'bg-neutral-800 border-blue-500 text-white shadow-lg' 
                                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800/50 hover:border-neutral-700'
                                }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <BookOpen size={14} className={selectedTopic === topic ? 'text-blue-400' : 'text-neutral-600'} />
                                    <span className="text-[11px] font-bold uppercase truncate tracking-tight">{topic}</span>
                                </div>
                                <ChevronRight size={14} className={`shrink-0 transition-transform ${selectedTopic === topic ? 'text-blue-400 rotate-90' : 'text-neutral-700 group-hover:translate-x-1'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {selectedTopic ? (
                        <TradingGurusEditor guru={guru} topic={selectedTopic} />
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-neutral-800 rounded-[3rem] bg-neutral-950/20 flex flex-col items-center justify-center">
                            <BookOpen size={48} className="text-neutral-800 mb-6" />
                            <h3 className="text-neutral-500 font-black uppercase tracking-widest text-[10px]">Select a volume to begin decrypting wisdom</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Topic Modal */}
            {showAddTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-tight">New Library Volume</h3>
                                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-0.5">Define a new study area</p>
                            </div>
                            <button onClick={() => setShowAddTopic(false)} className="p-2 hover:bg-neutral-800 rounded-xl text-neutral-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTopic} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] pl-1">Knowledge Topic</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                                    <input 
                                        type="text" 
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        placeholder="e.g. Risk Management"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder:text-neutral-700"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={!newTopic}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Append Volume
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
