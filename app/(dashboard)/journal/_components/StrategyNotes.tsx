'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

export type StrategyStep = {
    id: string
    step_number: number
    title: string
    description: string
}

interface StrategyNotesProps {
    onStepsChange: (steps: StrategyStep[]) => void
}

export function StrategyNotes({ onStepsChange }: StrategyNotesProps) {
    const [steps, setSteps] = useState<StrategyStep[]>([
        { id: '1', step_number: 1, title: '', description: '' }
    ])

    useEffect(() => {
        onStepsChange(steps)
    }, [steps, onStepsChange])

    const addStep = () => {
        setSteps(prev => [
            ...prev,
            { id: Math.random().toString(36).substring(7), step_number: prev.length + 1, title: '', description: '' }
        ])
    }

    const removeStep = (id: string) => {
        if (steps.length <= 1) return
        setSteps(prev => prev
            .filter(s => s.id !== id)
            .map((s, idx) => ({ ...s, step_number: idx + 1 }))
        )
    }

    const updateStep = (id: string, key: keyof StrategyStep, value: string) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Strategy Steps</h3>
                <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <Plus size={14} />
                    Add Step
                </button>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all hover:border-neutral-700">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-sm font-bold text-neutral-400">
                                {step.step_number}
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={step.title}
                                            onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                            placeholder="Step Title (e.g., Trend Direction)"
                                            className="w-full bg-transparent border-none text-lg font-bold placeholder:text-neutral-700 focus:ring-0 outline-none"
                                        />
                                    </div>
                                    {steps.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeStep(step.id)}
                                            className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                    placeholder="Describe your reasoning and criteria for this step..."
                                    className="w-full bg-neutral-800/50 border border-neutral-800 rounded-xl p-4 text-sm focus:border-blue-500/50 outline-none resize-none h-24 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
