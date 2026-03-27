'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, RotateCcw, Play, Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { ParsedStrategy, StrategyTemplate } from '@/lib/types/database'

interface VoiceRecorderProps {
    instrument: string
    templates: StrategyTemplate[]
    onParsed: (data: ParsedStrategy, transcript: string) => void
}

export default function VoiceRecorder({ instrument, templates, onParsed }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimTranscript, setInterimTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSupported, setIsSupported] = useState(true)

    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
        } else {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'en-US'

            recognition.onresult = (event: any) => {
                let final = ''
                let interim = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript
                    } else {
                        interim += event.results[i][0].transcript
                    }
                }
                setTranscript((prev) => prev + final)
                setInterimTranscript(interim)
            }

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error', event.error)
                setError(`Speech recognition error: ${event.error}`)
                setIsRecording(false)
            }

            recognition.onend = () => {
                setIsRecording(false)
            }

            recognitionRef.current = recognition
        }
    }, [])

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
        } else {
            setError(null)
            setTranscript('')
            setInterimTranscript('')
            try {
                recognitionRef.current?.start()
                setIsRecording(true)
            } catch (err: any) {
                setError(err.message)
            }
        }
    }

    const handleReset = () => {
        setTranscript('')
        setInterimTranscript('')
        setError(null)
    }

    const handleParse = async () => {
        if (!transcript.trim()) {
            setError('No analysis detected. Try again.')
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const response = await fetch('/api/ai/parse-strategy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: transcript,
                    instrument: instrument,
                    templates: templates
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse strategy')
            }

            onParsed(data, transcript)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    if (!isSupported) {
        return (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Voice recording not supported</span>
                </div>
                <p className="text-sm text-amber-700 mb-4">
                    Your browser does not support the Web Speech API. Use Chrome or Edge for the best experience.
                    You can still type your analysis manually below.
                </p>
                <textarea
                    className="w-full p-3 border rounded-md min-h-[120px] mb-3"
                    placeholder="Type your analysis here (e.g., Daily trend is bearish, price rejection at R1, RSI overbought...)"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                />
                <button
                    onClick={handleParse}
                    disabled={isProcessing || !transcript.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:bg-blue-300 transition-colors"
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Parse Strategy
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={clsx(
                        "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                        isRecording
                            ? "bg-red-500 text-white animate-pulse scale-110 shadow-lg shadow-red-200"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600 shadow-sm"
                    )}
                >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>

                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-700">
                        {isRecording ? "Listening... speak your analysis" : isProcessing ? "Analyzing your strategy..." : "Click to record your analysis"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Explain your trend context, indicators, and key levels naturally.
                    </p>
                </div>

                {error && (
                    <div className="mt-4 flex flex-col items-center gap-2 text-red-600 text-sm bg-red-50/50 px-4 py-3 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                        {error.includes('not-allowed') && (
                            <p className="text-xs text-red-500 mt-1 max-w-[250px]">
                                Your browser is blocking microphone access. Please click the permissions icon in your URL bar and allow microphone access.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {(transcript || interimTranscript) && (
                <div className="space-y-3">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Transcript</label>
                        <textarea
                            className="w-full p-0 border-none focus:ring-0 text-gray-800 placeholder-gray-400 min-h-[100px] resize-none"
                            placeholder="Your analysis will appear here..."
                            value={isRecording ? transcript + interimTranscript : transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            disabled={isRecording || isProcessing}
                        />
                    </div>

                    {!isRecording && transcript && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Re-record
                            </button>
                            <button
                                type="button"
                                onClick={handleParse}
                                disabled={isProcessing || !transcript.trim()}
                                className="flex-[2] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg disabled:bg-blue-400 transition-colors"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Parse Strategy
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
