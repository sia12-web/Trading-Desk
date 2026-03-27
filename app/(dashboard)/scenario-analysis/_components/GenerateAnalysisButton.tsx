'use client'

import { Loader2, Target } from 'lucide-react'
import { useBackgroundTask } from '@/lib/hooks/use-background-task'

interface GenerateAnalysisButtonProps {
    pair: string
    onComplete: (analysisId: string) => void
}

export function GenerateAnalysisButton({ pair, onComplete }: GenerateAnalysisButtonProps) {
    const { status, progress, message, result, error, startTask, reset } = useBackgroundTask('scenario_analysis')

    const handleGenerate = () => {
        startTask('/api/scenario-analysis/generate', { pair })
    }

    // Auto-navigate on completion
    if (status === 'completed' && result?.analysisId) {
        onComplete(result.analysisId as string)
    }

    if (status === 'running') {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                    <Loader2 size={18} className="animate-spin text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-300 truncate">{message || 'Processing...'}</p>
                        <div className="mt-1.5 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-xs text-neutral-500 shrink-0">{progress}%</span>
                </div>
            </div>
        )
    }

    if (status === 'failed') {
        return (
            <div className="space-y-2">
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm text-red-400">{error || 'Generation failed'}</p>
                </div>
                <button
                    onClick={reset}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                    Try again
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={handleGenerate}
            disabled={!pair}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
            <Target size={16} />
            Generate Analysis
        </button>
    )
}
