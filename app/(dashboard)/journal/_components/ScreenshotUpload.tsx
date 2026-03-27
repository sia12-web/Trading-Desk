'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileImage, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export type UploadedFile = {
    id: string
    file: File
    preview: string
    label: string
    notes: string
    uploading: boolean
    error?: string
}

const LABELS = ['Entry Setup', 'Exit Setup', 'Analysis', 'Result', 'Other']

interface ScreenshotUploadProps {
    onFilesChange: (files: UploadedFile[]) => void
}

export function ScreenshotUpload({ onFilesChange }: ScreenshotUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([])

    useEffect(() => {
        onFilesChange(files)
    }, [files, onFilesChange])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file),
            label: 'Analysis',
            notes: '',
            uploading: false
        }))

        setFiles(prev => [...prev, ...newFiles].slice(0, 5))
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 5
    })

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const updateFileData = (id: string, key: keyof UploadedFile, value: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f))
    }

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'}
        `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-neutral-500'}`} />
                    <p className="text-neutral-300 font-medium">
                        {isDragActive ? 'Drop screenshots here' : 'Drag & drop screenshots or click to browse'}
                    </p>
                    <p className="text-neutral-500 text-xs text-secondary-text">
                        Supports PNG, JPG, WEBP (Max 5MB per file, up to 5)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((file) => (
                        <div key={file.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 relative">
                            <button
                                onClick={() => removeFile(file.id)}
                                className="absolute top-2 right-2 p-1 bg-neutral-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition-colors z-10"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex gap-4">
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                                    <Image
                                        src={file.preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1"> Label </label>
                                        <select
                                            value={file.label}
                                            onChange={(e) => updateFileData(file.id, 'label', e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-sm px-2 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                                        >
                                            {LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="text-xs text-neutral-400 truncate max-w-[150px]">
                                        {file.file.name}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1"> Notes </label>
                                <textarea
                                    value={file.notes}
                                    onChange={(e) => updateFileData(file.id, 'notes', e.target.value)}
                                    placeholder="Capture specific observations..."
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg text-sm p-3 h-20 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
