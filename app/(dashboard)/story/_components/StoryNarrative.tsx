'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface StoryNarrativeProps {
    content: string
    episodeId: string
}

/**
 * StoryNarrative renders AI-generated story content with persistent user highlighting.
 * 
 * Flow:
 * 1. First render: show markdown via ReactMarkdown (read-only view)
 * 2. When user clicks "Enable Highlighting": switch to Tiptap editor with HTML content
 * 3. User selects text → floating toolbar appears → click highlight color → auto-saves
 */
export function StoryNarrative({ content, episodeId }: StoryNarrativeProps) {
    const [highlightMode, setHighlightMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savedHtml, setSavedHtml] = useState<string | null>(null)
    const selectionRef = useRef<{ hasSelection: boolean }>({ hasSelection: false })

    // Load any previously-saved highlighted HTML for this episode
    useEffect(() => {
        // Check localStorage for saved highlights
        const key = `story_highlights_${episodeId}`
        const saved = localStorage.getItem(key)
        if (saved) setSavedHtml(saved)
    }, [episodeId])

    const editor = useEditor({
        extensions: [
            StarterKit,
            Highlight.configure({ multicolor: true }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm max-w-none focus:outline-none ' +
                       'prose-headings:text-neutral-200 prose-headings:font-bold ' +
                       'prose-p:text-neutral-300 prose-p:leading-relaxed ' +
                       'prose-strong:text-white prose-em:text-blue-300 ' +
                       'prose-ul:text-neutral-300 prose-ol:text-neutral-300 ' +
                       'prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
            },
        },
        onSelectionUpdate: ({ editor: e }) => {
            const { from, to } = e.state.selection
            selectionRef.current.hasSelection = from !== to
        },
    })

    // When entering highlight mode, convert markdown → HTML and load into editor
    useEffect(() => {
        if (!editor || !highlightMode) return
        if (savedHtml) {
            editor.commands.setContent(savedHtml)
        } else {
            // Convert markdown content into a div, grab innerHTML
            const tempDiv = document.createElement('div')
            const tempRoot = document.createElement('div')
            tempDiv.innerHTML = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br/>')
            tempRoot.innerHTML = `<p>${tempDiv.innerHTML}</p>`
            editor.commands.setContent(tempRoot.innerHTML)
        }
    }, [editor, highlightMode, content, savedHtml])

    const saveHighlights = useCallback(async () => {
        if (!editor || saving) return
        setSaving(true)
        try {
            const html = editor.getHTML()
            // Save to localStorage for instant load
            localStorage.setItem(`story_highlights_${episodeId}`, html)
            setSavedHtml(html)
        } catch (error) {
            console.error('Failed to save highlights:', error)
        } finally {
            setSaving(false)
        }
    }, [editor, episodeId, saving])

    // Auto-save on editor changes (debounced)
    useEffect(() => {
        if (!editor || !highlightMode) return

        const handleUpdate = () => {
            const timeoutId = (editor as any)._saveTimeout
            if (timeoutId) clearTimeout(timeoutId)
            ;(editor as any)._saveTimeout = setTimeout(() => {
                saveHighlights()
            }, 1500)
        }

        editor.on('update', handleUpdate)
        return () => {
            editor.off('update', handleUpdate)
            const timeoutId = (editor as any)._saveTimeout
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [editor, highlightMode, saveHighlights])

    const applyHighlight = (color: string) => {
        if (!editor) return
        editor.chain().focus().toggleHighlight({ color }).run()
    }

    const removeHighlight = () => {
        if (!editor) return
        editor.chain().focus().unsetHighlight().run()
    }

    // Read-only markdown view (default)
    if (!highlightMode) {
        return (
            <div className="relative group">
                <div className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-neutral-200 prose-headings:font-bold
                    prose-p:text-neutral-300 prose-p:leading-relaxed
                    prose-strong:text-white
                    prose-em:text-blue-300
                    prose-ul:text-neutral-300 prose-ol:text-neutral-300
                    prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                ">
                    {savedHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: savedHtml }} />
                    ) : (
                        <ReactMarkdown>{content}</ReactMarkdown>
                    )}
                </div>

                <button
                    onClick={() => setHighlightMode(true)}
                    className="mt-4 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all hover:text-neutral-300"
                >
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    Enable Highlighting
                </button>
            </div>
        )
    }

    // Highlight editor mode
    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-neutral-900/80 border border-neutral-800 rounded-xl">
                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mr-2">Highlight:</span>
                <button
                    onClick={() => applyHighlight('#3b82f6')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md hover:bg-blue-500/10 text-neutral-400 hover:text-blue-400 transition-colors"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Blue
                </button>
                <button
                    onClick={() => applyHighlight('#f59e0b')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md hover:bg-amber-500/10 text-neutral-400 hover:text-amber-400 transition-colors"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Amber
                </button>
                <button
                    onClick={() => applyHighlight('#10b981')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md hover:bg-emerald-500/10 text-neutral-400 hover:text-emerald-400 transition-colors"
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Green
                </button>
                <button
                    onClick={removeHighlight}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-md hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 transition-colors border-l border-neutral-800 ml-1 pl-3"
                >
                    Remove
                </button>

                <div className="flex-1" />

                {saving && (
                    <div className="flex items-center gap-1.5">
                        <Loader2 size={10} className="animate-spin text-blue-400" />
                        <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Saving...</span>
                    </div>
                )}

                <button
                    onClick={() => setHighlightMode(false)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                >
                    Done
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            <style>{`
                .ProseMirror mark {
                    background-color: #3b82f633;
                    color: inherit;
                    border-radius: 2px;
                    padding: 1px 2px;
                }
                .ProseMirror mark[data-color="#f59e0b"] {
                    background-color: #f59e0b33;
                }
                .ProseMirror mark[data-color="#10b981"] {
                    background-color: #10b98133;
                }
                .ProseMirror { outline: none !important; }
            `}</style>
        </div>
    )
}
