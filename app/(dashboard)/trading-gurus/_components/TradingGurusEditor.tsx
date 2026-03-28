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
    Type, Save, Loader2, Clock, Zap, Activity, Info, GraduationCap,
    BookOpen, Target, Brain, Lightbulb
} from 'lucide-react'

interface TradingGurusEditorProps {
    guru: string
    topic: string
}

const CATEGORIES = [
    { label: 'MECHANICS', color: '#3b82f6', icon: Activity },
    { label: 'PSYCHOLOGY', color: '#a855f7', icon: Brain },
    { label: 'STRATEGY', color: '#10b981', icon: Target },
    { label: 'INSIGHT', color: '#f59e0b', icon: Lightbulb },
]

export function TradingGurusEditor({ guru, topic }: TradingGurusEditorProps) {
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
                placeholder: `Capture your notes on ${topic} by ${guru}...`,
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none min-h-[500px] focus:outline-none p-6 text-sm',
            },
        },
    })

    // Load initial content
    useEffect(() => {
        const loadNote = async () => {
            setInitialLoading(true)
            try {
                const res = await fetch(`/api/trading-gurus?guru=${encodeURIComponent(guru)}&topic=${encodeURIComponent(topic)}`)
                const data = await res.json()
                if (data.content !== undefined && editor) {
                    editor.commands.setContent(data.content)
                }
            } catch (err) {
                console.error('Failed to load note:', err)
            } finally {
                setInitialLoading(false)
            }
        }
        if (editor && guru && topic) loadNote()
    }, [guru, topic, editor])

    const saveContent = useCallback(async () => {
        if (!editor || saving) return
        setSaving(true)
        try {
            const content = editor.getHTML()
            await fetch('/api/trading-gurus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guru, topic, content }),
            })
            setLastSaved(new Date())
        } catch (err) {
            console.error('Failed to save note:', err)
        } finally {
            setSaving(false)
        }
    }, [editor, guru, topic, saving])

    // Auto-save logic
    useEffect(() => {
        if (!editor) return

        const handleUpdate = () => {
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

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/20 border border-neutral-800 rounded-2xl h-full">
                <Loader2 size={24} className="animate-spin text-neutral-600 mb-4" />
                <p className="text-xs font-black text-neutral-500 uppercase tracking-widest">Accessing Guru Vault...</p>
            </div>
        )
    }

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[600px]">
            {/* Toolbar Header */}
            <div className="border-b border-neutral-800 p-4 bg-neutral-950/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <GraduationCap size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">{topic}</h2>
                            <p className="text-[10px] text-neutral-500 font-bold tracking-tighter uppercase">Insights from {guru}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastSaved && (
                            <span className="text-[10px] text-neutral-600 font-mono italic">
                                Vault updated: {lastSaved.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
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
                        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded ${editor?.isActive('bold') ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-white'}`}><Bold size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded ${editor?.isActive('italic') ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-white'}`}><Italic size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded ${editor?.isActive('underline') ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-white'}`}><UnderlineIcon size={14} /></button>
                    </div>
                    <div className="flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg">
                        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded ${editor?.isActive('bulletList') ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-white'}`}><List size={14} /></button>
                        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded ${editor?.isActive('orderedList') ? 'bg-blue-500/20 text-blue-400' : 'text-neutral-500 hover:text-white'}`}><ListOrdered size={14} /></button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat.label}
                                onClick={() => insertLabel(cat.label, cat.color)}
                                className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-black rounded-md transition-all hover:scale-110 active:scale-95 border"
                                style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}30` }}
                            >
                                <cat.icon size={10} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Privacy Shield */}
            <div className="bg-blue-500/5 px-6 py-2 flex items-center gap-2 border-b border-neutral-800">
                <Info size={12} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest leading-none">
                    GURU PRIVACY: This knowledge base is exclusive to you. No AI models or systemic trackers have access to these files.
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
                .prose strong { color: #3b82f6; }
                .prose h1, .prose h2, .prose h3 { color: #ffffff !important; margin-top: 1em; margin-bottom: 0.5em; }
                .ProseMirror { outline: none !important; }
            `}</style>
        </div>
    )
}
