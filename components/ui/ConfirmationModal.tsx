'use client'

import React from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmationModalProps {
    title: string
    description: string
    confirmLabel: string
    confirmVariant?: 'danger' | 'primary'
    loading?: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ConfirmationModal({
    title,
    description,
    confirmLabel,
    confirmVariant = 'primary',
    loading,
    onClose,
    onConfirm
}: ConfirmationModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-8 pb-0 flex justify-end">
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 text-center space-y-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${confirmVariant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${confirmVariant === 'danger'
                                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                                } text-white shadow-lg`}
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {confirmLabel}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-4 text-neutral-400 hover:text-white font-bold rounded-2xl transition-all hover:bg-neutral-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
