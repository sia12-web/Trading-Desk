'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Placeholder } from '@tiptap/extension-placeholder'
import { 
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
    Type, Save, Loader2, Clock, Zap, Activity, Info
} from 'lucide-react'

interface MyStoryEditorProps {
    pair: string
}

const TIMEFRAMES = [
    { label: 'MN', color: '#a855f7', name: 'Monthly' }, // Purple
    { label: 'W1', color: '#3b82f6', name: 'Weekly' },  // Blue
    { label: 'D1', color: '#10b981', name: 'Daily' },   // Emerald
    { label: 'H4', color: '#f59e0b', name: '4 Hours' }, // Amber
    { label: 'H1', color: '#f43f5e', name: '1 Hour' },  // Rose
]

const INDICATORS = [
    'EMA', 'SMA', 'Bollinger', 'Ichimoku', 'VWAP', 'Pivot Points', 'Supply/Demand'
]

const OSCILLATORS = [
    'RSI', 'MACD', 'Stochastic', 'ATR', 'CCI', 'ADX'
]

export function MyStoryEditor({ pair }: MyStoryEditorProps) {
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder: `Write your understanding of ${pair} here...`,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none p-6 text-sm',
            },
        },
    })

    // Load initial content
    useEffect(() => {
        const loadNote = async () => {
            try {
                const res = await fetch(`/api/story/my-story?pair=${encodeURIComponent(pair)}`)
                const data = await res.json()
                if (data.content && editor) {
                    editor.commands.setContent(data.content)
                }
            } catch (err) {
                console.error('Failed to load note:', err)
            } finally {
                setInitialLoading(false)
            }
        }
        if (editor) loadNote()
    }, [pair, editor])

    const saveContent = useCallback(async () => {
        if (!editor || saving) return
        setSaving(true)
        try {
            const content = editor.getHTML()
            await fetch('/api/story/my-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pair, content }),
            })
            setLastSaved(new Date())
        } catch (err) {
            console.error('Failed to save note:', err)
        } finally {
            setSaving(false)
        }
    }, [editor, pair, saving])

    // Auto-save logic using Tiptap's update event
    useEffect(() => {
        if (!editor) return

        const handleUpdate = () => {
            // Use a timeout to debounce saving
            const timeoutId = (editor as any)._saveTimeout
            if (timeoutId) clearTimeout(timeoutId)
            
            ;(editor as any)._saveTimeout = setTimeout(() => {
                saveContent()
            }, 3000)
        }

        editor.on('update', handleUpdate)
        return () => {
            editor.off('update', handleUpdate)
            const timeoutId = (editor as any)._saveTimeout
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [editor, saveContent])

    const insertLabel = (text: string, color: string) => {
        if (!editor) return
        editor.chain().focus().insertContent(`<span style="background-color: ${color}33; color: ${color}; padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 10px; margin: 0 2px; border: 1px solid ${color}44;">${text}</span> `).run()
    }

    const insertIndicator = (name: string) => {
        insertLabel(name, '#06b6d4') // Cyan
    }

    const insertOscillator = (name: string) => {
        insertLabel(name, '#6366f1') // Indigo
    }

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/20 border border-neutral-800 rounded-2xl">
                <Loader2 size={24} className="animate-spin text-neutral-600 mb-4" />
                <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Re-initializing Private Workspace...</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[800px]">
            {/* Toolbar Header */}
            <div className="border-b border-neutral-800 p-4 bg-neutral-950/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Zap size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">My Story</h2>
                            <p className="text-[10px] text-neutral-500 font-bold tracking-tighter uppercase">Private Market Understanding — Zero AI Tracking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-[10px] text-neutral-600 font-mono italic">
                                Last saved: {lastSaved.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <button 
                            onClick={saveContent}
                            disabled={saving}
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        </button>
                    </div>
                </div>

                {/* Editor Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/30">
                    <div className="flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg">
                        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-white'}`}><Bold size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor?.isActive('italic') ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-white'}`}><Italic size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor?.isActive('underline') ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-white'}`}><UnderlineIcon size={14} /></button>
                    </div>
                    <div className="flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg">
                        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-white'}`}><List size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive('orderedList') ? 'bg-orange-500/20 text-orange-400' : 'text-neutral-500 hover:text-white'}`}><ListOrdered size={14} /></button>
                    </div>
                </div>

                {/* Trading Labels Section */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    {/* Timeframes */}
                    <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-800">
                        <Clock size={12} className="text-neutral-600" />
                        {TIMEFRAMES.map(tf => (
                            <button 
                                key={tf.label}
                                onClick={() => insertLabel(tf.label, tf.color)}
                                className="px-2 py-1 text-[9px] font-black rounded-md transition-all hover:scale-110 active:scale-95 border"
                                style={{ backgroundColor: `${tf.color}15`, color: tf.color, borderColor: `${tf.color}30` }}
                                title={tf.name}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Indicators Dropdown/List */}
                    <div className="flex items-center gap-1.5 pr-3 border-r border-neutral-800">
                        <Activity size={12} className="text-neutral-600" />
                        <select 
                            className="bg-neutral-900 text-[9px] font-black text-neutral-400 border border-neutral-800 rounded px-2 py-1 uppercase tracking-widest focus:outline-none"
                            onChange={(e) => {
                                if (e.target.value) {
                                    insertIndicator(e.target.value)
                                    e.target.value = ''
                                }
                            }}
                        >
                            <option value="">Indicators</option>
                            {INDICATORS.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                    </div>

                    {/* Oscillators Dropdown/List */}
                    <div className="flex items-center gap-1.5">
                        <Activity size={12} className="text-neutral-600" />
                        <select 
                            className="bg-neutral-900 text-[9px] font-black text-neutral-400 border border-neutral-800 rounded px-2 py-1 uppercase tracking-widest focus:outline-none"
                            onChange={(e) => {
                                if (e.target.value) {
                                    insertOscillator(e.target.value)
                                    e.target.value = ''
                                }
                            }}
                        >
                            <option value="">Oscillators</option>
                            {OSCILLATORS.map(osc => <option key={osc} value={osc}>{osc}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Editor Focus Policy Info */}
            <div className="bg-orange-500/5 px-6 py-2 flex items-center gap-2 border-b border-neutral-800">
                <Info size={12} className="text-orange-500" />
                <span className="text-[9px] font-black text-orange-500/70 uppercase tracking-widest leading-none">
                    Session Security: This content stays encrypted for your account only. AI models are strictly blocked from reading this data.
                </span>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto bg-neutral-950/20">
                <EditorContent editor={editor} />
            </div>
            
            <style>{`
                .ProseMirror p.is-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #525252;
                    pointer-events: none;
                    height: 0;
                }
                .prose strong { color: #f97316; }
                .prose h1, .prose h2, .prose h3 { color: #ffffff !important; margin-top: 1em; margin-bottom: 0.5em; }
                .prose ul, .prose ol { padding-left: 1.25em; margin-top: 0.5em; margin-bottom: 0.5em; }
                .prose li { margin-bottom: 0.25em; }
                .ProseMirror { outline: none !important; }
            `}</style>
        </div>
    )
}
